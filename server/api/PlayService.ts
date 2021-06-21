import { Request, Response, Router } from 'express';
import { TarotBotRegistry } from '../../bots/TarotBot';
import { Database } from '../db/dbConnector';
import { GameRecordQuerier } from '../db/GameRecordQuerier';
import { PlayerQuerier } from '../db/PlayerQuerier';
import { LobbySocketMessages } from '../play/lobby/LobbySocketMessages';
import { PlayerId } from '../play/model/GameState';
import { NewRoomArgs } from '../play/room/NewRoomArgs';
import { Room } from '../play/room/Room';
import { getRoomDescription, RoomDescriptions } from '../play/room/RoomDescription';
import { Multimap } from '../utils/multimap';
import { JsonSocket } from '../websocket/JsonSocket';
import { WebsocketManager } from '../websocket/WebsocketManager';

export class PlayService {
  public router: Router;

  public websocketManager: WebsocketManager;
  public readonly gameQuerier: GameRecordQuerier;
  public readonly playerQuerier: PlayerQuerier;
  private rooms: Map<string, Room>;
  private playerIdToRoomId: Multimap<string>;
  private lobbyPlayers: Set<string>;
  private playerIdToSocketId: Multimap<string>;
  private socketIdToPlayerId: Map<string, PlayerId>;

  constructor(
    db: Database,
    websocketManager: WebsocketManager,
    public readonly botRegistry: TarotBotRegistry,
  ) {
    this.router = Router();
    this.gameQuerier = new GameRecordQuerier(db);
    this.playerQuerier = new PlayerQuerier(db);
    this.rooms = new Map();
    this.playerIdToRoomId = new Multimap();
    this.lobbyPlayers = new Set();
    this.playerIdToSocketId = new Multimap();
    this.socketIdToPlayerId = new Map();

    this.websocketManager = websocketManager;
    this.router.post('/new_room', this.newRoom);
    this.router.get('/rooms', this.listRooms);
  }


  public newRoom = async (req: Request, res: Response) => {
    const args: NewRoomArgs = req.body;
    const room = Room.empty(this, args);
    this.rooms.set(room.id, room);
    this.roomUpdated(room);
  };

  public listRooms = async (_: Request, res: Response) => {
    const rooms: RoomDescriptions = {};
    for (const [id, room] of this.rooms) {
      rooms[id] = getRoomDescription(room);
    }
    res.send(rooms);
  };

  /* Helpers */

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getSocketIdsForPlayer(playerId: string): Set<string> {
    return this.playerIdToSocketId.get(playerId);
  }

  public getPlayerIdForSocketId(socketId: string): string | undefined {
    return this.socketIdToPlayerId.get(socketId);
  }

  public getSocketsForPlayer(playerId: string): Set<JsonSocket> {
    const socketIds = this.playerIdToSocketId.get(playerId);
    const sockets = new Set<JsonSocket>();
    for (const socketId of socketIds) {
      const socket = this.websocketManager.getSocket(socketId ?? "");
      if (socket != null) {
        sockets.add(socket);
      }
    }
    return sockets;
  }

  public playerEnteredLobby(socketId: string, playerId: string) {
    const oldPlayer = this.getPlayerIdForSocketId(socketId);
    if (oldPlayer) {
      this.lobbyPlayers.delete(oldPlayer);
      this.removeSocketById(socketId);
    }
    this.lobbyPlayers.add(playerId);
    this.setPlayerSocketId(socketId, playerId);
  }

  /* Helper */

  public socketClosed(socketId: string) {
    const playerId = this.removeSocketById(socketId);
    if (playerId) {
      this.lobbyPlayers.delete(playerId);
      const roomIds = this.playerIdToRoomId.get(playerId);
      for (const roomId of roomIds) {
        this.rooms.get(roomId)?.socketClosed(playerId);
      }
    }
  }

  public setPlayerSocketId(socketId: string, playerId: string) {
    this.playerIdToSocketId.set(playerId, socketId);
    this.socketIdToPlayerId.set(socketId, playerId);
  }

  public removeSocketById(socketId: string): string | undefined {
    const playerId = this.socketIdToPlayerId.get(socketId);
    this.socketIdToPlayerId.delete(socketId);
    if (playerId) {
      this.playerIdToSocketId.delete(playerId, socketId);
    }
    return playerId;
  }

  public addPlayerToRoom(roomId: string, playerId: string) {
    this.playerIdToRoomId.set(playerId, roomId);
  }

  public removePlayerFromRoom(roomId: string, playerId: string) {
    this.playerIdToRoomId.delete(playerId, roomId);
  }

  public roomUpdated(room: Room) {
    const roomDescription = getRoomDescription(room);
    for (const playerId of this.lobbyPlayers) {
      const sockets = this.getSocketsForPlayer(playerId);
      for (const socket of sockets) {
        if (socket != null) {
          socket.send(LobbySocketMessages.roomUpdated(roomDescription));
        }
      }
    }
  }
}
