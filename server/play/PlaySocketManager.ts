import { Action, AutoplayActionType, EnteredChatTransition, EnterGameAction, LeaveGameAction, LeftChatTransition, PlayerEvent, PlayerId, PlayerNotReadyAction, PlayerReadyAction, Transition } from '../../app/play/common';
import { RandomBotType } from '../../bots/RandomBot';
import { TarotBotRegistry } from '../../bots/TarotBot';
import { PlayerQuerier } from '../db/PlayerQuerier';
import { Player } from '../model/Player';
import { JsonSocket } from '../websocket/JsonSocket';
import { SocketChannelManager } from '../websocket/SocketChannelManager';
import { SocketMessage } from '../websocket/SocketMessage';
import { WebsocketManager } from '../websocket/WebsocketManager';
import { autoplayNextCard } from './Autoplay';
import { getNextPlayer, playForBot } from './BotPlayer';
import { AddBotAction, AddBotActionType, DebugPlayAction, DebugPlayMessage, PlayAction, PlayMessage, RemoveBotAction, RemoveBotActionType } from './PlayMessages';
import { PlayService } from './PlayService';
import { PlaySocket } from './PlaySocket';

export class PlaySocketManager extends SocketChannelManager<PlayMessage> {
  static Type = 'play';

  private sockets: Map<string, PlaySocket>;

  constructor(
    websocketManager: WebsocketManager,
    private playService: PlayService,
    private playerQuerier: PlayerQuerier,
    private botRegistry: TarotBotRegistry,
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
          case AddBotActionType:
            const addBotMessage = event as AddBotAction;
            this.handleAddBot(gameId, addBotMessage.botId);
            break;
          case RemoveBotActionType:
            const removeBotMessage = event as RemoveBotAction;
            this.handleRemoveBot(gameId, removeBotMessage.botId);
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
    this.handleBotPlayers(gameId);
  }

  private handleBotPlayers(gameId: string) {
    const game = this.playService.games.get(gameId);
    if (!game) {
      return;
    }
    this.playerQuerier.queryAllPlayers().then((playerList: Player[]) => {
      const players = new Map<PlayerId, Player>();
      for (const player of playerList) {
        players.set(player.id, player);
      }
      let nextPlayerId = getNextPlayer(game);
      while(nextPlayerId && players.get(nextPlayerId)?.isBot) {
        const nextPlayer = players.get(nextPlayerId);
        const botType = nextPlayer?.botType ?? RandomBotType;
        const bot = this.botRegistry[botType]();
        const action = playForBot(game, nextPlayerId, bot);
        if (action) {
          const messages = this.playService.games.get(gameId)?.playerAction(action);
          if (messages) {
            this.broadcastEvents(gameId, messages);
            this.playService.gameUpdated(gameId);
          }
        } else {
          break;
        }
        nextPlayerId = getNextPlayer(game);
      }
    });
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
      const filteredEvents = events.filter((event) => {
        const isPrivate = event.privateTo != null && event.privateTo !== player;
        const isExcluded = ((event.exclude ?? []).indexOf(player) >= 0)
        return (!isPrivate && !isExcluded);
      })
      this.sockets.get(socketId)?.sendPlayerEvents(filteredEvents);
    }
  }

  public appendEnteredChatTransition(gameId: string, playerId: PlayerId) {
    const enteredChat: EnteredChatTransition = {
      type: 'entered_chat',
      player: playerId,
      privateTo: undefined,
    };
    this.appendTransition(gameId, enteredChat);
  }

  public appendLeftChatTransition(gameId: string, playerId: PlayerId) {
    const leftChat: LeftChatTransition = {
      type: 'left_chat',
      player: playerId,
      privateTo: undefined,
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

  private handleAddBot(gameId: string, botId: string) {
    const game = this.playService.games.get(gameId);
    if (!game) {
      return;
    }
    this.appendEnteredChatTransition(gameId, botId);
    const joinGame: EnterGameAction = {
      type: 'enter_game',
      privateTo: undefined,
      player: botId,
      time: new Date().getTime(),
    };
    const ready: PlayerReadyAction = {
      type: 'mark_player_ready',
      privateTo: undefined,
      player: botId,
      time: new Date().getTime(),
    }
    const actions: Action[] = [joinGame, ready];
    for (const action of actions) {
      const messages = this.playService.games.get(gameId)?.playerAction(action);
      if (messages) {
        this.broadcastEvents(gameId, messages);
        this.playService.gameUpdated(gameId);
      }
    }
  }

  private handleRemoveBot(gameId: string, botId: string) {
    const game = this.playService.games.get(gameId);
    if (!game) {
      return;
    }
    const unready: PlayerNotReadyAction = {
      type: 'unmark_player_ready',
      privateTo: undefined,
      player: botId,
      time: new Date().getTime(),
    }
    const leaveGame: LeaveGameAction = {
      type: 'leave_game',
      privateTo: undefined,
      player: botId,
      time: new Date().getTime(),
    }
    const actions: Action[] = [unready, leaveGame];
    for (const action of actions) {
      const messages = this.playService.games.get(gameId)?.playerAction(action);
      if (messages) {
        this.broadcastEvents(gameId, messages);
        this.playService.gameUpdated(gameId);
      }
    }
    this.appendLeftChatTransition(gameId, botId);
  }
}
