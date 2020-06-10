import { Action, AutoplayActionType, EnteredChatTransition, LeftChatTransition, PlayerEvent, PlayerId, Transition } from '../../app/play/common';
import { JsonSocket } from '../websocket/JsonSocket';
import { SocketChannelManager } from '../websocket/SocketChannelManager';
import { SocketMessage } from '../websocket/SocketMessage';
import { WebsocketManager } from '../websocket/WebsocketManager';
import { autoplayNextCard } from './Autoplay';
import { DebugPlayAction, DebugPlayMessage, PlayAction, PlayMessage } from './PlayMessages';
import { PlayService } from './PlayService';
import { PlaySocket } from './PlaySocket';

export class PlaySocketManager extends SocketChannelManager<PlayMessage> {
  static Type = 'play';

  private sockets: Map<string, PlaySocket>;

  constructor(
    websocketManager: WebsocketManager,
    private playService: PlayService,
  ) {
    super(websocketManager, PlaySocketManager.Type);
    this.sockets = new Map();
  }

  public addSocket(webSocket: JsonSocket, data: PlayMessage) {
    const { game: gameId, player: playerId } = data;
    const socket = new PlaySocket(gameId, playerId, webSocket);

    try {
      if (!this.playService.games.has(gameId)) {
        socket.sendGameDoesNotExistError();
        socket.close();
        return;
      } else if (this.sockets.has(socket.id)) {
        socket.sendAlreadyConnectedError();
        socket.close();
        return;
      }

      this.sockets.set(socket.id, socket);
      this.playService.players.get(gameId)?.add(playerId);
      webSocket.handleMessage = this.getSocketMessageHandler(gameId, playerId);
      webSocket.handleClose = () => this.removeSocket(gameId, playerId);
      socket.sendPlayerEvents(this.playService.games.get(gameId)?.getEvents(playerId, 0, 100000)[0] || []);
      this.appendEnteredChatTransition(gameId, playerId);
    } catch (e) {
      console.error("Error while adding socket:", gameId, playerId, e)
    }
  }

  private getSocketMessageHandler(gameId: string, playerId: PlayerId) {
    return (event: SocketMessage) => {
      console.log(JSON.stringify(event, null, 2));
      try {
        switch (event.type) {
          case 'play_action':
            const playAction = event as PlayAction;
            this.handlePlayAction(gameId, playAction.action);
            break;
          case 'debug_play_action':
            const debugPlayAction = event as DebugPlayAction;
            this.handlePlayAction(gameId, debugPlayAction.action, true);
            break;
          case AutoplayActionType:
            this.handleAutoplay(gameId);
            break;
          case 'debug_play':
            const debugPlayMessage = event as DebugPlayMessage;
            this.appendEnteredChatTransition(gameId, debugPlayMessage.player);
            break;
        }
      } catch (e) {
        console.error("Error while trying to process player action", gameId, playerId, event, e);
        this.removeSocket(gameId, playerId);
      }
    }
  }

  private handlePlayAction(gameId: string, action: Action, debugPlayer?: boolean) {
    const socket = this.sockets.get(PlaySocket.getId(gameId, action.player));
    if (!socket && !debugPlayer) {
      throw Error(`Could not find socket for ${gameId}, ${action.player}`);
    }
    try {
      const messages = this.playService.games.get(gameId)?.playerAction(action);
      if (messages) {
        this.broadcastEvents(gameId, messages);
        this.playService.gameUpdated(gameId);
      }
    } catch (e) {
      socket?.sendError(e.message);
    }
  }

  private removeSocket(game: string, player: PlayerId) {
    try {
      const socketKey = PlaySocket.getId(game, player);
      const socket = this.sockets.get(socketKey);
      if (socket) {
        this.playService.players.get(game)?.delete(player);
        this.sockets.delete(socketKey);
        this.appendLeftChatTransition(game, player);
      }
    } catch (e) {
      console.error("Error while trying to remove socket", game, player, e)
    }
  }

  private broadcastEvents(gameId: string, events: PlayerEvent[]) {
    for (const player of this.playService.players.get(gameId) || []) {
      const socketId = PlaySocket.getId(gameId, player);
      const filteredEvents = events.filter((event) =>
        event.private_to == null || event.private_to === player)
      this.sockets.get(socketId)?.sendPlayerEvents(filteredEvents);
    }
  }

  public appendEnteredChatTransition(gameId: string, playerId: PlayerId) {
    const enteredChat: EnteredChatTransition = {
      type: 'entered_chat',
      player: playerId,
      private_to: undefined,
    };
    this.appendTransition(gameId, enteredChat);
  }

  public appendLeftChatTransition(gameId: string, playerId: PlayerId) {
    const leftChat: LeftChatTransition = {
      type: 'left_chat',
      player: playerId,
      private_to: undefined,
    };
    this.appendTransition(gameId, leftChat);
  }

  public appendTransition(gameId: string, transition: Transition) {
    this.playService.games.get(gameId)?.appendTransition(transition);
    this.broadcastEvents(gameId, [transition]);
    this.playService.gameUpdated(gameId);
  }

  private handleAutoplay(gameId: string) {
    const game = this.playService.games.get(gameId);
    if (!game) {
      return;
    }
    const action = autoplayNextCard(game);
    if (action) {
      this.handlePlayAction(gameId, action, true);
    }
  }
}