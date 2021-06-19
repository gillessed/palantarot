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
import { JsonSocket } from '../websocket/JsonSocket';
import { WebsocketManager } from '../websocket/WebsocketManager';

export class PlayService {
  public router: Router;

  public websocketManager: WebsocketManager;
  public readonly gameQuerier: GameRecordQuerier;
  public readonly playerQuerier: PlayerQuerier;
  private rooms: Map<string, Room>;
  private playersInRooms: Map<PlayerId, Set<string>>;
  private lobbyPlayers: Set<string>;
  private playerIdToSocketId: Map<PlayerId, string>;
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
    this.playersInRooms = new Map();
    this.lobbyPlayers = new Set();
    this.playerIdToSocketId = new Map();
    this.socketIdToPlayerId = new Map();

    this.websocketManager = websocketManager;
    this.router.post('/new_room', this.newRoom);
    this.router.get('/rooms', this.listRooms);
  }


  public newRoom = async (req: Request, res: Response) => {
    const args: NewRoomArgs = req.body;
    const room = Room.empty(this, args);
    this.playersInRooms.set(room.id, new Set());
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

  public getSocketIdForPlayer(playerId: string): string | undefined {
    return this.playerIdToSocketId.get(playerId);
  }

  public getPlayerIdForSocketId(socketId: string): string | undefined {
    return this.socketIdToPlayerId.get(socketId);
  }

  public getSocketForPlayer(playerId: string): JsonSocket | undefined {
    const socketId = this.playerIdToSocketId.get(playerId);
    const socket = this.websocketManager.getSocket(socketId ?? "");
    return socket;
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

  public setPlayerSocketId(socketId: string, playerId: string) {
    console.log('**** setting socketid to playerid ', socketId, playerId);
    this.playerIdToSocketId.set(playerId, socketId);
    this.socketIdToPlayerId.set(socketId, playerId);
  }

  public removeSocketById(socketId: string) {
    console.log('**** clearing socket ', socketId);
    const playerId = this.socketIdToPlayerId.get(socketId);
    this.socketIdToPlayerId.delete(socketId);
    if (playerId) {
      this.playerIdToSocketId.delete(playerId);
    }
  }

  public roomUpdated(room: Room) {
    const roomDescription = getRoomDescription(room);
    for (const playerId of this.lobbyPlayers) {
      const socketId = this.getSocketIdForPlayer(playerId);
      const socket = this.websocketManager.getSocket(socketId ?? "");
      if (socket != null) {
        socket.send(LobbySocketMessages.roomUpdated(roomDescription));
      }
    }
  }
}
