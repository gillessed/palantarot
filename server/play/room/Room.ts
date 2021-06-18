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
import { RoomSockets } from "./RoomSocketMessages";
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

  public handleMessage(socketId: string, socket: JsonSocket, message: RoomSockets.Message) {
    try {
      switch (message.messageType) {
        case RoomSockets.EnterRoomMessageType:
          this.handlePlayerJoinedMessage(socketId, message);
          break;
        case RoomSockets.RoomChatMessageType:
          this.handlePlayerChatMessage(message);
          break;
        case RoomSockets.GameActionMessageType:
          this.handleGameActionMessage(message);
          break;
        case RoomSockets.AddBotMessageType:
          this.handleAddBotMessage(message);
          break;
        case RoomSockets.RemoveBotMessageType:
          this.handleRemoveBotMessage(message);
          break;
        case RoomSockets.AutoplayMessageType:
          this.handleAutoplayMessage(message);
          break;
      }
    } catch (e) {
      console.error("Cannot process socket message", this.id, message, e);
      socket.send(RoomSockets.error(this.id, "Cannot process socket message " + e));
    }
  }

  public handleClose(playerId: string) {
    if (this.players.has(playerId)) {
      this.players.set(playerId, PlayerStatus.Offline);
      this.broadcastMessage(RoomSockets.playerStatusUpdated(this.id, playerId, PlayerStatus.Offline));
    }
  }

  public handlePlayerChatMessage(message: RoomSockets.RoomChatMessage) {
    this.chat.push(message.chat);
    this.broadcastMessage(message);
  }

  public handlePlayerJoinedMessage(socketId: string, message: RoomSockets.EnterRoomMessage) {
    this.broadcastMessage(message);
    this.playService.setPlayerSocketId(socketId, message.playerId);
    this.players.set(message.playerId, PlayerStatus.Online);
    this.playService.addPlayerToRoom(this.id, message.playerId);
    this.sendRoomStatus(message.playerId);
  }

  public handleGameActionMessage({ action }: RoomSockets.GameActionMessage) {
    this.processGameActions([action]);
    this.handleBotPlayers();
    this.handleNewGame();
  }

  public handleAddBotMessage(message: RoomSockets.AddBotMessage) {
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

  public handleRemoveBotMessage(message: RoomSockets.RemoveBotMessage) {
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

  public handleAutoplayMessage(_message: RoomSockets.AutoplayMessage) {
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
      socket.send(RoomSockets.roomStatus(this.id, this.getRoomStatus(playerId)));
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
        socket.send(RoomSockets.gameUpdates(this.id, this.game.id, filteredEvents));
      }
    }
  }

  private broadcastMessage(message: RoomSockets.Message) {
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
    this.broadcastMessage(RoomSockets.newGame(
      this.id,
      this.game.id,
      this.game.settings,
    ));
  }
}
