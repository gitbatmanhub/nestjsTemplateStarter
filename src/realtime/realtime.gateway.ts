import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

type AuthenticatedSocket = Socket & {
  data: {
    userId?: string;
    email?: string;
  };
};

@WebSocketGateway({
  cors: true,
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly clients = new Map<string, AuthenticatedSocket>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: AuthenticatedSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      throw new UnauthorizedException('Missing socket token');
    }

    const payload = this.jwtService.verify<JwtPayload>(token);
    if (payload.type !== 'access') {
      client.disconnect();
      throw new UnauthorizedException('Invalid socket token');
    }

    client.data.userId = payload.sub;
    client.data.email = payload.email;
    this.clients.set(client.id, client);

    this.server.emit('realtime:clients', this.clients.size);
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.clients.delete(client.id);
    this.server.emit('realtime:clients', this.clients.size);
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('realtime:ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    return {
      event: 'realtime:pong',
      data: {
        socketId: client.id,
        userId: client.data.userId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @SubscribeMessage('realtime:broadcast')
  handleBroadcast(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { message: string },
  ) {
    const message = {
      from: client.data.email,
      message: payload.message,
      timestamp: new Date().toISOString(),
    };

    this.server.emit('realtime:message', message);
    return {
      event: 'realtime:ack',
      data: message,
    };
  }

  private extractToken(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const headerToken = client.handshake.headers.authorization?.replace(
      /^Bearer\s+/i,
      '',
    );

    return authToken || headerToken || null;
  }
}
