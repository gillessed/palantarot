import { Request, Response, Router } from 'express';
import { TarotBotRegistry } from '../../bots/TarotBot';
import { Database } from '../db/dbConnector';
import { GameRecordQuerier } from '../db/GameRecordQuerier';
import { PlayerQuerier } from '../db/PlayerQuerier';
import { LobbySocketMessages } from '../play/lobby/LobbySocketMessages';
import { NewRoomArgs } from '../play/room/NewRoomArgs';
import { Room } from '../play/room/Room';
import {
  getRoomDescription,
  RoomDescriptions,
} from '../play/room/RoomDescription';
import { JsonSocket } from '../websocket/JsonSocket';
import { WebsocketManager } from '../websocket/WebsocketManager';

export class PlayService {
  public router: Router;

  public websocketManager: WebsocketManager;
  public readonly gameQuerier: GameRecordQuerier;
  public readonly playerQuerier: PlayerQuerier;
  private rooms: Map<string, Room>;
  private socketIdToRoomId: Map<string, string>;
  private lobbySocketIds: Set<string>;

  constructor(
    db: Database,
    websocketManager: WebsocketManager,
    public readonly botRegistry: TarotBotRegistry
  ) {
    this.router = Router();
    this.gameQuerier = new GameRecordQuerier(db);
    this.playerQuerier = new PlayerQuerier(db);
    this.rooms = new Map();
    this.socketIdToRoomId = new Map();
    this.lobbySocketIds = new Set();

    this.websocketManager = websocketManager;
    this.router.post('/new_room', this.newRoom);
    this.router.get('/rooms', this.listRooms);
  }

  public newRoom = async (req: Request, _res: Response) => {
    const args: NewRoomArgs = req.body;
    const room = Room.empty(this, args);
    this.rooms.set(room.id, room);
    this.roomUpdated(room);
  };

  public listRooms = async (_req: Request, res: Response) => {
    const rooms: RoomDescriptions = {};
    for (const [ id, room ] of this.rooms) {
      rooms[id] = getRoomDescription(room);
    }
    res.send(rooms);
  };

  /* Helpers */

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getSocketForSocketId(socketId: string): JsonSocket | undefined {
    return this.websocketManager.getSocket(socketId ?? '');
  }

  public playerEnteredLobby(socketId: string) {
    this.lobbySocketIds.add(socketId);
  }

  /* Helper */

  public socketClosed(socketId: string) {
    this.lobbySocketIds.delete(socketId);
    const roomId = this.socketIdToRoomId.get(socketId);
    console.log('socket closing in room ', socketId, roomId);
    this.rooms.get(roomId ?? '')?.socketClosed(socketId);
    this.socketIdToRoomId.delete(socketId);
  }

  public addSocketToRoom(roomId: string, socketId: string) {
    console.log('adding socket to room', socketId, roomId);
    this.socketIdToRoomId.set(socketId, roomId);
  }

  public roomUpdated(room: Room) {
    const roomDescription = getRoomDescription(room);
    for (const socketId of this.lobbySocketIds) {
      const socket = this.getSocketForSocketId(socketId);
      if (socket != null) {
        socket.send(LobbySocketMessages.roomUpdated(roomDescription));
      }
    }
  }
}
