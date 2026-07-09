import { io, type Socket } from 'socket.io-client';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

export function createNotificationsSocket(accessToken: string): Socket {
  return io(`${WS_BASE}/notifications`, {
    auth: { token: accessToken },
    transports: ['websocket'],
    autoConnect: true,
  });
}
