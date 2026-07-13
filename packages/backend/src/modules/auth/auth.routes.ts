import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma.js';
import { config } from '../../config/index.js';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth.js';
import { AppError, NotFoundError, ConflictError, handleError } from '../../utils/errors.js';
import { registerSchema, loginSchema, refreshSchema, updateProfileSchema } from './auth.schema.js';
import type { User } from '@plateforme/shared';
import { nanoid } from 'nanoid';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // ==========================================
  // POST /auth/register - Inscription vendeur
  // ==========================================
  app.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      description: 'Inscription d\'un nouveau vendeur',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string', minLength: 2 },
          phone: { type: 'string' },
          storeName: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const input = registerSchema.parse(request.body);

      // Vérifier si l'email existe déjà
      const existing = await prisma.vendor.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new ConflictError('Un compte avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(input.password, config.jwt.accessExpiry === '15m' ? 12 : 12);

      // Créer le vendeur
      const vendor = await prisma.vendor.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone || null,
          storeName: input.storeName || null,
        },
      });

      // Générer les tokens
      const accessToken = app.jwt.sign(
        { id: vendor.id, email: vendor.email, role: vendor.role },
        { expiresIn: config.jwt.accessExpiry }
      );

      const refreshToken = nanoid(64);
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          vendorId: vendor.id,
          expiresAt: refreshExpires,
        },
      });

      const user: Partial<User> = {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role as User['role'],
        phone: vendor.phone || undefined,
        storeName: vendor.storeName || undefined,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      };

      reply.status(201).send({
        success: true,
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 min
          },
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // POST /auth/login - Connexion
  // ==========================================
  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      description: 'Connexion vendeur',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const input = loginSchema.parse(request.body);

      const vendor = await prisma.vendor.findUnique({
        where: { email: input.email },
      });

      if (!vendor) {
        throw new NotFoundError('Vendeur');
      }

      const isValidPassword = await bcrypt.compare(input.password, vendor.password);
      if (!isValidPassword) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect');
      }

      const accessToken = app.jwt.sign(
        { id: vendor.id, email: vendor.email, role: vendor.role },
        { expiresIn: config.jwt.accessExpiry }
      );

      const refreshToken = nanoid(64);
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          vendorId: vendor.id,
          expiresAt: refreshExpires,
        },
      });

      const user: Partial<User> = {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role as User['role'],
        phone: vendor.phone || undefined,
        storeName: vendor.storeName || undefined,
        avatar: vendor.avatar || undefined,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      };

      reply.send({
        success: true,
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900,
          },
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // POST /auth/refresh - Rafraîchir le token
  // ==========================================
  app.post('/auth/refresh', {
    schema: {
      tags: ['Auth'],
      description: 'Rafraîchir le token d\'accès',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const input = refreshSchema.parse(request.body);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: input.refreshToken },
        include: { vendor: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Token de rafraîchissement invalide ou expiré');
      }

      // Supprimer l'ancien token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Générer nouveaux tokens
      const accessToken = app.jwt.sign(
        { id: storedToken.vendor.id, email: storedToken.vendor.email, role: storedToken.vendor.role },
        { expiresIn: config.jwt.accessExpiry }
      );

      const newRefreshToken = nanoid(64);
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          vendorId: storedToken.vendor.id,
          expiresAt: refreshExpires,
        },
      });

      reply.send({
        success: true,
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 900,
          },
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // POST /auth/logout - Déconnexion
  // ==========================================
  app.post('/auth/logout', {
    schema: {
      tags: ['Auth'],
      description: 'Déconnexion (invalidation du refresh token)',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const input = refreshSchema.parse(request.body);

      await prisma.refreshToken.deleteMany({
        where: { token: input.refreshToken },
      });

      reply.send({ success: true, data: { message: 'Déconnexion réussie' } });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // GET /auth/profile - Profil du vendeur
  // ==========================================
  app.get('/auth/profile', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'],
      description: 'Récupérer le profil du vendeur connecté',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id } = (request as AuthenticatedRequest).user;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
      });

      if (!vendor) {
        throw new NotFoundError('Vendeur');
      }

      const user: Partial<User> = {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role as User['role'],
        phone: vendor.phone || undefined,
        storeName: vendor.storeName || undefined,
        avatar: vendor.avatar || undefined,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      };

      reply.send({ success: true, data: user });
    } catch (error) {
      handleError(reply, error);
    }
  });

  // ==========================================
  // PATCH /auth/profile - Mise à jour profil
  // ==========================================
  app.patch('/auth/profile', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'],
      description: 'Mettre à jour le profil du vendeur',
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const { id } = (request as AuthenticatedRequest).user;
      const input = updateProfileSchema.parse(request.body);

      const vendor = await prisma.vendor.update({
        where: { id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.phone && { phone: input.phone }),
          ...(input.storeName && { storeName: input.storeName }),
          ...(input.avatar && { avatar: input.avatar }),
        },
      });

      const user: Partial<User> = {
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        role: vendor.role as User['role'],
        phone: vendor.phone || undefined,
        storeName: vendor.storeName || undefined,
        avatar: vendor.avatar || undefined,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      };

      reply.send({ success: true, data: user });
    } catch (error) {
      handleError(reply, error);
    }
  });
}