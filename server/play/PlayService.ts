import { Request, Response, Router } from 'express';
import { PlayerId } from '../../app/play/common';
import { Game } from "../../app/play/server";
import { TarotBotRegistry } from '../../bots/TarotBot';
import { Database } from '../db/dbConnector';
import { PlayerQuerier } from '../db/PlayerQuerier';
import { WebsocketManager } from '../websocket/WebsocketManager';
import { GameDescription, getGameDescription } from './GameDescription';
import { LobbySocketManager } from './LobbySocketManager';
import { PlaySocketManager } from './PlaySocketManager';

export class PlayService {
  public router: Router;

  public games: Map<string, Game>;
  public players: Map<string, Set<PlayerId>>;
  public playSocketManager: PlaySocketManager;
  public lobbySocketManager: LobbySocketManager;

  constructor(
    db: Database,
    websocketManager: WebsocketManager,
    botRegistry: TarotBotRegistry,
  ) {
    this.router = Router();
    this.games = new Map();
    this.players = new Map();
    this.playSocketManager = new PlaySocketManager(websocketManager, this, new PlayerQuerier(db), botRegistry);
    this.lobbySocketManager = new LobbySocketManager(websocketManager, this);
    this.router.post('/new_game', this.newGame);
    this.router.get('/games', this.listGames);
    this.router.get('/debug/:id', this.debugView);
  }

  public newGame = async (req: Request, res: Response) => {
    const game = Game.createNew();
    this.games.set(game.id, game);
    this.players.set(game.id, new Set<PlayerId>());
    res.send(game.id);
    this.gameUpdated(game.id);
  };

  public listGames = async (req: Request, res: Response) => {
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
    this.lobbySocketManager.sendUpdateMessage(gameId);
  }
}
