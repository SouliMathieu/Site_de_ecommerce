import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { prisma } from '../utils/prisma.js';

interface ClientConnection {
  ws: WebSocket;
  vendorId: string;
  isAlive: boolean;
}

const clients = new Map<string, ClientConnection[]>();

export function getClients(vendorId: string): ClientConnection[] {
  return clients.get(vendorId) || [];
}

export function broadcastToVendor(vendorId: string, event: string, payload: unknown): void {
  const vendorClients = clients.get(vendorId);
  if (!vendorClients) return;

  const message = JSON.stringify({
    type: event,
    payload,
    timestamp: new Date().toISOString(),
  });

  vendorClients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

export async function websocketPlugin(app: FastifyInstance): Promise<void> {
  app.get('/ws', { websocket: true }, (socket, request) => {
    // L'authentification se fait via le query param token
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(4001, 'Token requis');
      return;
    }

    // Vérifier le token JWT
    try {
      const decoded = app.jwt.verify(token) as { id: string };
      const vendorId = decoded.id;

      // Enregistrer la connexion
      const connection: ClientConnection = {
        ws: socket,
        vendorId,
        isAlive: true,
      };

      if (!clients.has(vendorId)) {
        clients.set(vendorId, []);
      }
      clients.get(vendorId)!.push(connection);

      console.log(`[WebSocket] Client connecté: ${vendorId}`);

      // Ping/pong pour keep-alive
      socket.on('pong', () => {
        connection.isAlive = true;
      });

      // Gérer la déconnexion
      socket.on('close', () => {
        const vendorClients = clients.get(vendorId);
        if (vendorClients) {
          const index = vendorClients.indexOf(connection);
          if (index > -1) {
            vendorClients.splice(index, 1);
          }
          if (vendorClients.length === 0) {
            clients.delete(vendorId);
          }
        }
        console.log(`[WebSocket] Client déconnecté: ${vendorId}`);
      });

      // Envoyer un message de bienvenue
      socket.send(JSON.stringify({
        type: 'CONNECTED',
        payload: { message: 'Connecté au serveur WebSocket' },
        timestamp: new Date().toISOString(),
      }));

    } catch (error) {
      socket.close(4001, 'Token invalide');
    }
  });

  // Intervalle de ping pour nettoyer les connexions mortes
  const interval = setInterval(() => {
    clients.forEach((vendorClients, vendorId) => {
      vendorClients.forEach((client) => {
        if (!client.isAlive) {
          client.ws.terminate();
          return;
        }
        client.isAlive = false;
        client.ws.ping();
      });
    });
  }, 30000);

  app.addHook('onClose', (_instance, done) => {
    clearInterval(interval);
    done();
  });
}