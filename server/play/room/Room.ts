import { RandomBotType } from "../../../bots/RandomBot";
import { PlayService } from "../../api/PlayService";
import { Player } from "../../model/Player";
import { promiseDelay } from "../../utils/promiseDelay";
import { generateId } from "../../utils/randomString";
import { JsonSocket } from "../../websocket/JsonSocket";
import { autologGame } from "../Autolog";
import { autoplayNextCard } from "../bots/Autoplay";
import { getNextPlayer, playForBot } from "../bots/BotPlayer";
import { Game } from "../game/Game";
import { Action, CompletedGameState, EnterGameAction, LeaveGameAction, PlayerEvent, PlayerId, PlayerNotReadyAction, PlayerReadyAction } from "../model/GameEvents";
import { GameSettings } from "../model/GameSettings";
import { CompletedBoardState, GameplayState } from "../model/GameState";
import { PlayerStatus } from "../room/PlayerStatus";
import { ChatText } from "./ChatText";
import { NewRoomArgs } from './NewRoomArgs';
import { AddBotMessage, AddBotMessageType, AutoplayMessage, AutoplayMessageType, EnterRoomMessage, EnterRoomMessageType, GameActionMessage, GameActionMessageType, RemoveBotMessage, RemoveBotMessageType, RoomChatMessage, RoomChatMessageType, RoomSocketMessage, RoomSocketMessages } from './RoomSocketMessages';
import { RoomStatus } from "./RoomStatus";
  
export class Room {
  public static empty = (
    playService: PlayService,
    args: NewRoomArgs,
  ) => {
    return new Room(
      playService,
      generateId(),
      args.name,
      args.gameSettings,
      Game.createNew(args.gameSettings),
      [],
      new Map(),
      [],
    );
  }
  constructor(
    private readonly playService: PlayService,
    public readonly id: string,
    public name: string,
    public settings: GameSettings,
    public game: Game,
    public pastGames: CompletedGameState[],
    public players: Map<PlayerId, PlayerStatus>,
    public chat: ChatText[],
  ) { }

  /* Socket Handlers */

  public handleMessage(socketId: string, socket: JsonSocket, message: RoomSocketMessage) {
    try {
      switch (message.messageType) {
        case EnterRoomMessageType:
          this.handlePlayerJoinedMessage(socketId, message as EnterRoomMessage);
          break;
        case RoomChatMessageType:
          this.handlePlayerChatMessage(message as RoomChatMessage);
          break;
        case GameActionMessageType:
          this.handleGameActionMessage(message as GameActionMessage);
          break;
        case AddBotMessageType:
          this.handleAddBotMessage(message as AddBotMessage);
          break;
        case RemoveBotMessageType:
          this.handleRemoveBotMessage(message as RemoveBotMessage);
          break;
        case AutoplayMessageType:
          this.handleAutoplayMessage(message as AutoplayMessage);
          break;
      }
    } catch (e) {
      console.error("Cannot process socket message", this.id, message, e);
      socket.send(RoomSocketMessages.error(this.id, "Cannot process socket message " + e));
    }
  }

  public handleClose(playerId: string) {
    if (this.players.has(playerId)) {
      this.players.set(playerId, PlayerStatus.Offline);
      this.broadcastMessage(RoomSocketMessages.playerStatusUpdated(this.id, playerId, PlayerStatus.Offline));
    }
  }

  public handlePlayerChatMessage(message: RoomChatMessage) {
    this.chat.push(message.chat);
    this.broadcastMessage(message);
  }

  public handlePlayerJoinedMessage(socketId: string, message: EnterRoomMessage) {
    this.broadcastMessage(message);
    this.playService.setPlayerSocketId(socketId, message.playerId);
    this.players.set(message.playerId, PlayerStatus.Online);
    this.playService.addPlayerToRoom(this.id, message.playerId);
    this.sendRoomStatus(message.playerId);
  }

  public handleGameActionMessage({ action }: GameActionMessage) {
    this.processGameActions([action]);
    this.handleBotPlayers();
    this.handleNewGame();
  }

  public handleAddBotMessage(message: AddBotMessage) {
    const { botId } = message;
    this.players.set(botId, PlayerStatus.Online);
    this.playService.addPlayerToRoom(this.id, botId);
    const joinGame: EnterGameAction = {
      type: 'enter_game',
      player: botId,
      time: new Date().getTime(),
    };
    const ready: PlayerReadyAction = {
      type: 'mark_player_ready',
      player: botId,
      time: new Date().getTime(),
    }
    this.processGameActions([joinGame, ready]);
  }

  public handleRemoveBotMessage(message: RemoveBotMessage) {
    const { botId } = message;
    this.players.set(botId, PlayerStatus.Online);
    this.playService.addPlayerToRoom(this.id, botId);
    const unready: PlayerNotReadyAction = {
      type: 'unmark_player_ready',
      player: botId,
      time: new Date().getTime(),
    }
    const leaveGame: LeaveGameAction = {
      type: 'leave_game',
      player: botId,
      time: new Date().getTime(),
    }
    this.processGameActions([unready, leaveGame]);
  }

  public handleAutoplayMessage(_message: AutoplayMessage) {
    const action = autoplayNextCard(this.game);
    if (action) {
      this.processGameActions([action]);
      this.handleBotPlayers();
    }
  }

  /* Helpers */

  private processGameActions(actions: Action[]) {
    for (const action of actions) {
      const gameEvents = this.game.playerAction(action);
      if (gameEvents) {
        this.broadcastGameEvents(gameEvents);
      }
    }
    //TODO this.playService.gameUpdated(gameId);
  }

  private sendRoomStatus(playerId: string) {
    const socket = this.playService.getSocketForPlayer(playerId);
    if (socket) {
      socket.send(RoomSocketMessages.roomStatus(this.id, this.getRoomStatus(playerId)));
    }
  }

  private broadcastGameEvents(gameEvents: PlayerEvent[]) {
    for (const playerId of this.players.keys()) {
      const socket = this.playService.getSocketForPlayer(playerId);
      if (socket != null) {

        const filteredEvents = gameEvents.filter((gameEvent) => {
          const isPrivate = gameEvent.privateTo != null && gameEvent.privateTo !== playerId;
          const isExcluded = ((gameEvent.exclude ?? []).indexOf(playerId) >= 0)
          return (!isPrivate && !isExcluded);
        });
        socket.send(RoomSocketMessages.gameUpdates(this.id, this.game.id, filteredEvents));
      }
    }
  }

  private broadcastMessage(message: RoomSocketMessage) {
    for (const playerId of this.players.keys()) {
      const socket = this.playService.getSocketForPlayer(playerId);
      if (socket != null) {
        socket.send(message);
      }
    }
  }

  private getRoomStatus(playerId: string): RoomStatus {
    const players: { [key: string]: PlayerStatus } = {};
    for (const [playerId, status] of this.players) {
      players[playerId] = status;
    }
    return {
      id: this.id,
      players,
      settings: this.settings,
      gameId: this.game.id,
      gameEvents: this.game.getEvents(playerId, 0, 100000).events,
      chat: this.chat,
    };
  }

  private async handleBotPlayers() {
    const playerList = await this.playService.playerQuerier.queryAllPlayers();
    const players = new Map<PlayerId, Player>();
    for (const player of playerList) {
      players.set(player.id, player);
    }

    let nextPlayerId = getNextPlayer(this.game);
    while(nextPlayerId && players.get(nextPlayerId)?.isBot) {
      const nextPlayer = players.get(nextPlayerId);
      const botType = nextPlayer?.botType ?? RandomBotType;
      const bot = this.playService.botRegistry[botType]();
      const action = playForBot(this.game, nextPlayerId, bot);
      if (action) {
        await promiseDelay(1000);
        this.processGameActions([action]);
      } else {
        break;
      }
      nextPlayerId = getNextPlayer(this.game);
    }
    await autologGame(this.game, this.playService.gameQuerier);
    await this.handleNewGame();
  }

  private async handleNewGame() {
    if (this.game.getState().name !== GameplayState.Completed) {
      return;
    }

    const completedState = this.game.getState() as CompletedBoardState;
    this.pastGames.push(completedState.end_state);
    this.game = Game.createNew(this.settings);
    this.broadcastMessage(RoomSocketMessages.newGame(
      this.id,
      this.game.id,
      this.game.settings,
    ));
  }
}
