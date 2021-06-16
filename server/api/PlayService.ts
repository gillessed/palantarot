import { Request, Response, Router } from 'express';
import { TarotBotRegistry } from '../../bots/TarotBot';
import { Database } from '../db/dbConnector';
import { GameRecordQuerier } from '../db/GameRecordQuerier';
import { PlayerQuerier } from '../db/PlayerQuerier';
import { Game } from "../play/game/Game";
import { GameDescription, getGameDescription } from '../play/game/GameDescription';
import { LobbyMessages } from '../play/lobby/LobbyMessages';
import { PlayerId } from '../play/model/GameEvents';
import { GameSettings } from '../play/model/GameSettings';
import { NewRoomArgs } from '../play/room/NewRoomArgs';
import { Room } from '../play/room/Room';
import { getRoomDescription, RoomDescriptions } from '../play/room/RoomDescription';
import { JsonSocket } from '../websocket/JsonSocket';
import { WebsocketManager } from '../websocket/WebsocketManager';

export class PlayService {
  public router: Router;

  public games: Map<string, Game>;
  public players: Map<string, Set<PlayerId>>;
  public websocketManager: WebsocketManager;

  // New
  public readonly gameQuerier: GameRecordQuerier;
  public readonly playerQuerier: PlayerQuerier;
  public rooms: Map<string, Room>;
  public playersInRooms: Map<PlayerId, Set<string>>;
  public lobbyPlayers: Set<string>;
  private playerIdToSocketId: Map<PlayerId, string>;
  private socketIdToPlayerId: Map<string, PlayerId>;

  constructor(
    db: Database,
    websocketManager: WebsocketManager,
    public readonly botRegistry: TarotBotRegistry,
  ) {
    this.router = Router();
    this.games = new Map();
    this.players = new Map();
    // New
    this.gameQuerier = new GameRecordQuerier(db);
    this.playerQuerier = new PlayerQuerier(db);
    this.rooms = new Map();
    this.playersInRooms = new Map();
    this.lobbyPlayers = new Set();
    this.playerIdToSocketId = new Map();
    this.socketIdToPlayerId = new Map();

    this.websocketManager = websocketManager;
    this.router.post('/new_game', this.newGame);
    this.router.get('/games', this.listGames);
    this.router.get('/debug/:id', this.debugView);
    this.router.post('/new_room', this.newRoom);
    this.router.get('/rooms', this.listRooms);
  }

  public newGame = async (req: Request, res: Response) => {
    const settings: GameSettings = req.body;
    const game = Game.createNew(settings);
    this.games.set(game.id, game);
    this.players.set(game.id, new Set<PlayerId>());
    res.send(game.id);
    this.gameUpdated(game.id);
  };

  public listGames = async (_: Request, res: Response) => {
    const games: { [id: string]: GameDescription } = {};
    for (const [id, game] of this.games) {
      games[id] = getGameDescription(game);
    }
    res.send(games);
  };

  public debugView = async (req: Request, res: Response) => {
    const id = req.params['id'];
    const game = this.games.get(id);
    if (game == undefined) {
      res.send(404, "unable to locate game " + id);
    } else {
      const reply = {
        state: game.getState(),
        events: game.getEvents('<debugplayer>', 0, 100000),
      };
      res.send(reply);
    }
  };

  public gameUpdated(gameId: string) {
    // this.lobbySocketManager.sendUpdateMessage(gameId);
  }

  public newRoom = async (req: Request, res: Response) => {
    const args: NewRoomArgs = req.body;
    const room = Room.empty(this, args);
    this.playersInRooms.set(room.id, new Set());
    this.rooms.set(room.id, room);
    const roomDescription = getRoomDescription(room);
    for (const playerId of this.lobbyPlayers) {
      const socketId = this.getSocketIdForPlayer(playerId);
      const socket = this.websocketManager.getSocket(socketId ?? "");
      if (socket != null) {
        socket.send(LobbyMessages.roomUpdated(roomDescription));
      }
    }
  };

  public listRooms = async (_: Request, res: Response) => {
    const rooms: RoomDescriptions = {};
    for (const [id, room] of this.rooms) {
      rooms[id] = getRoomDescription(room);
    }
    res.send(rooms);
  };

  /* Helpers */

  public addPlayerToRoom(roomId: string, playerId: string) {
    this.playersInRooms.get(roomId)?.add(playerId);
  }

  public getPlayersInRoom(roomId: string): PlayerId[] {
    return [...(this.playersInRooms.get(roomId) ?? [])];
  }

  public getSocketIdForPlayer(playerId: string): string | undefined {
    return this.playerIdToSocketId.get(playerId);
  }

  public getPlayerIdForSocket(playerId: string): string | undefined {
    return this.playerIdToSocketId.get(playerId);
  }

  public getSocketForPlayer(playerId: string): JsonSocket | undefined {
    const socketId = this.playerIdToSocketId.get(playerId);
    const socket = this.websocketManager.getSocket(socketId ?? "");
    return socket;
  }

  public setPlayerSocketId(socketId: string, playerId: string) {
    this.playerIdToSocketId.set(playerId, socketId);
    this.socketIdToPlayerId.set(socketId, playerId);
  }

  public removeSocketById(socketId: string) {
    const playerId = this.socketIdToPlayerId.get(socketId);
    this.socketIdToPlayerId.delete(socketId);
    if (playerId) {
      this.playerIdToSocketId.delete(playerId);
    }
  }
}
