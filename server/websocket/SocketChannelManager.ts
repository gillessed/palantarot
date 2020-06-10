import { JsonSocket } from './JsonSocket';
import { SocketMessage } from './SocketMessage';
import { WebsocketManager } from './WebsocketManager';

export abstract class SocketChannelManager<T extends SocketMessage> {
  constructor(
    public readonly websocketManager: WebsocketManager,
    public readonly channel: string,
  ) {
    websocketManager.addChannel(this);
  }
  abstract addSocket(socket: JsonSocket, data: T): void;
}