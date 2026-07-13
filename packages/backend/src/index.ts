import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { prisma, disconnectPrisma } from './utils/prisma.js';
import { websocketPlugin } from './plugins/websocket.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { productRoutes } from './modules/products/products.routes.js';
import { orderRoutes } from './modules/orders/orders.routes.js';
import { customerRoutes } from './modules/customers/customers.routes.js';
import { deliveryRoutes } from './modules/delivery/delivery.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { notificationRoutes } from './modules/notifications/notifications.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildApp() {
  const app = Fastify({
    logger: config.server.isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        }
      : {
          level: 'error',
        },
  });

  // ==========================================
  // Plugins
  // ==========================================

  // CORS
  await app.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  });

  // Rate Limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes',
  });

  // JWT
  await app.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.accessExpiry,
    },
  });

  // WebSocket
  await app.register(websocket);
  await app.register(websocketPlugin);

  // Multipart (upload de fichiers)
  await app.register(multipart, {
    limits: {
      fileSize: config.upload.maxFileSize,
    },
  });

  // Static files (uploads)
  await app.register(fastifyStatic, {
    root: path.resolve(__dirname, '..', config.upload.dir),
    prefix: '/uploads/',
    decorateReply: false,
  });

  // Swagger / OpenAPI
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Plateforme de Vente Intelligente API',
        description: 'API REST pour la plateforme de vente intelligente - Social Commerce, WhatsApp Bot, Logistique Automatisée',
        version: '1.0.0',
        contact: {
          email: 'contact@plateforme-vente.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Développement',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // ==========================================
  // Routes
  // ==========================================

  // Health check
  app.get('/health', {
    schema: {
      tags: ['System'],
      description: 'Vérification de l\'état du serveur',
    },
  }, async () => {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  });

  // Modules
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(productRoutes, { prefix: '/api/v1' });
  await app.register(orderRoutes, { prefix: '/api/v1' });
  await app.register(customerRoutes, { prefix: '/api/v1' });
  await app.register(deliveryRoutes, { prefix: '/api/v1' });
  await app.register(dashboardRoutes, { prefix: '/api/v1' });
  await app.register(notificationRoutes, { prefix: '/api/v1' });

  // ==========================================
  // Error Handler Global
  // ==========================================
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.statusCode === 429) {
      reply.status(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Trop de requêtes. Veuillez réessayer plus tard.',
        },
      });
      return;
    }

    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'Une erreur interne est survenue',
      },
    });
  });

  return app;
}

// ==========================================
// Démarrage du serveur
// ==========================================
async function start() {
  try {
    const app = await buildApp();
    const port = config.server.port;
    const host = config.server.host;

    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    await app.listen({ port, host });
    console.log(`🚀 Serveur démarré sur http://${host}:${port}`);
    console.log(`📚 Documentation API: http://${host}:${port}/docs`);
    console.log(`🔌 WebSocket: ws://${host}:${port}/ws`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} reçu. Arrêt gracieux...`);
      await app.close();
      await disconnectPrisma();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error);
    await disconnectPrisma();
    process.exit(1);
  }
}

start();