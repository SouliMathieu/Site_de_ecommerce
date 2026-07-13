import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserRole } from '@plateforme/shared';

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new UnauthorizedError('Token invalide ou expiré');
  }
}

export function authorize(...roles: UserRole[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = (request as AuthenticatedRequest).user;
    
    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenError('Vous n\'avez pas les droits pour accéder à cette ressource');
    }
  };
}