import { RandomBotType } from "../../../bots/RandomBot";
import { PlayService } from "../../api/PlayService";
import { Player } from "../../model/Player";
import { promiseDelay } from "../../utils/promiseDelay";
import { generateId } from "../../utils/randomString";
import { JsonSocket } from "../../websocket/JsonSocket";
import { SocketMessage } from "../../websocket/SocketMessage";
import { autologGame } from "../Autolog";
import { autoplayNextCard } from "../bots/Autoplay";
import { getNextPlayer, playForBot } from "../bots/BotPlayer";
import { Game } from "../game/Game";
import { Action, EnterGameAction, LeaveGameAction, PlayerEvent, PlayerNotReadyAction, PlayerReadyAction } from "../model/GameEvents";
import { GameSettings } from "../model/GameSettings";
import { CompletedBoardState, CompletedGameState, GameplayState, PlayerId } from "../model/GameState";
import { PlayerStatus } from "../room/PlayerStatus";
import { ChatText, ServerChatAuthorId } from "./ChatText";
import { NewRoomArgs } from './NewRoomArgs';
import { BotMessagePayload, EnterRoomMessagePayload, GameActionMessagePayload, RoomChatMessagePayload, RoomSocketMessages } from "./RoomSocketMessages";
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

  public handleMessage(socketId: string, socket: JsonSocket, untypedMessage: SocketMessage<any>) {
    try {
      RoomSocketMessages.enterRoom.handleMessage(untypedMessage, (message) => {
        this.handleEnterRoomMessage(socketId, message)
      });
      RoomSocketMessages.roomChat.handleMessage(untypedMessage, this.handlePlayerChatMessage);
      RoomSocketMessages.gameAction.handle(untypedMessage, this.handleGameActionMessage);
      RoomSocketMessages.addBot.handle(untypedMessage, this.handleAddBotMessage);
      RoomSocketMessages.removeBot.handle(untypedMessage, this.handleRemoveBotMessage);
      RoomSocketMessages.autoplay.handle(untypedMessage, this.handleAutoplayMessage);
    } catch (e) {
      console.error("Cannot process socket message", this.id, untypedMessage, e);
      socket.send(RoomSocketMessages.error({ roomId: this.id, error: "Cannot process socket message " + e }));
    }
  }

  public socketClosed(playerId: string) {
    if (this.players.has(playerId)) {
      this.players.set(playerId, PlayerStatus.Offline);
      this.broadcastMessage(RoomSocketMessages.playerStatusUpdated({ roomId: this.id, playerId, playerStatus: PlayerStatus.Offline, time: Date.now() }));
      this.playService.roomUpdated(this);
    }
  }

  public handleEnterRoomMessage = (socketId: string, message: SocketMessage<EnterRoomMessagePayload>) => {
    const { playerId } = message.payload;
    this.broadcastMessage(message);
    this.playService.setPlayerSocketId(socketId, playerId);
    this.playService.addPlayerToRoom(this.id, playerId);
    this.players.set(playerId, PlayerStatus.Online);
    this.sendRoomStatus(playerId);
    this.playService.roomUpdated(this);
  }

  public handlePlayerChatMessage = (message: SocketMessage<RoomChatMessagePayload>) => {
    this.chat.push(message.payload.chat);
    this.broadcastMessage(message);
  }

  public handleGameActionMessage = ({ action }: GameActionMessagePayload) => {
    this.processGameActions([action]);
    this.handleBotPlayers();
    this.handleNewGame();
  }

  public handleAddBotMessage = (payload: BotMessagePayload) => {
    const { botId } = payload;
    const alreadyIn = this.game.getState().players.indexOf(botId) >= 0;
    if (alreadyIn) {
      return;
    }
    this.players.set(botId, PlayerStatus.Online);
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

  public handleRemoveBotMessage = (payload: BotMessagePayload) => {
    const { botId } = payload;
    this.players.set(botId, PlayerStatus.Online);
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

  public handleAutoplayMessage = () => {
    const action = autoplayNextCard(this.game);
    if (action) {
      this.processGameActions([action]);
      this.handleBotPlayers();
    }
  }

  /* Helpers */

  private processGameActions = (actions: Action[]) => {
    for (const action of actions) {
      const { events, serverMessages } = this.game.playerAction(action);
      if (events) {
        this.broadcastGameEvents(events);
      }
      if (serverMessages) {
        for (const message of serverMessages) {
          const chat: ChatText = {
            id: generateId(),
            text: message,
            time: Date.now(),
            authorId: ServerChatAuthorId,
          }
          this.chat.push(chat);
          this.broadcastMessage(RoomSocketMessages.roomChat({ roomId: this.id, chat }));
        }
      }
    }
    this.playService.roomUpdated(this);
  }

  private sendRoomStatus = (playerId: string) => {
    const sockets = this.playService.getSocketsForPlayer(playerId);
    for (const socket of sockets) {
      socket.send(RoomSocketMessages.roomStatus({ roomId: this.id, room: this.getRoomStatus(playerId) }));
    }
  }

  private broadcastGameEvents = (gameEvents: PlayerEvent[]) => {
    for (const playerId of this.players.keys()) {
      const sockets = this.playService.getSocketsForPlayer(playerId);

      const filteredEvents = gameEvents.filter((gameEvent) => {
        const isPrivate = gameEvent.privateTo != null && gameEvent.privateTo !== playerId;
        const isExcluded = ((gameEvent.exclude ?? []).indexOf(playerId) >= 0)
        return (!isPrivate && !isExcluded);
      });
      for (const socket of sockets) {
        socket.send(RoomSocketMessages.gameUpdates({ roomId: this.id, gameId: this.game.id, events: filteredEvents }));
      }
    }
  }

  private broadcastMessage = (message: SocketMessage) => {
    for (const playerId of this.players.keys()) {
      const sockets = this.playService.getSocketsForPlayer(playerId);
      for (const socket of sockets) {
        socket.send(message);
      }
    }
  }

  private getRoomStatus = (playerId: string): RoomStatus => {
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

  private handleBotPlayers = async () => {
    const playerList = await this.playService.playerQuerier.queryAllPlayers();
    const players = new Map<PlayerId, Player>();
    for (const player of playerList) {
      players.set(player.id, player);
    }

    let nextPlayerId = getNextPlayer(this.game);
    while (nextPlayerId && players.get(nextPlayerId)?.isBot) {
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

  private handleNewGame = () => {
    if (this.game.getState().name !== GameplayState.Completed) {
      return;
    }

    const completedState = this.game.getState() as CompletedBoardState;
    this.pastGames.push(completedState.end_state);
    this.game = Game.createNew(this.settings);
    this.broadcastMessage(RoomSocketMessages.newGame({
      roomId: this.id,
      gameId: this.game.id,
      settings: this.game.settings,
    }));
    this.playService.roomUpdated(this);
  }
}
