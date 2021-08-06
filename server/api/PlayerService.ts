import { Request, Response, Router } from 'express';
import { TarotBotRegistry } from '../../bots/TarotBot';
import { Config } from '../config';
import { AdminPasswordKey } from '../headers';
import { Player } from '../model/Player';
import { Database } from './../db/dbConnector';
import { PlayerQuerier } from './../db/PlayerQuerier';
import { NewPlayer } from './../model/Player';

export class PlayerService {
  public router: Router;
  private playerDb: PlayerQuerier;
  private tarotBotTypes: string[];

  constructor(
    private config: Config,
    db: Database,
    tarotBots: TarotBotRegistry
  ) {
    this.router = Router();
    this.playerDb = new PlayerQuerier(db);
    this.tarotBotTypes = Object.keys(tarotBots);
    this.router.post('/add', this.addPlayer);
    this.router.get('/', this.getAll);
  }

  public getAll = (_: Request, res: Response) => {
    this.playerDb
      .queryAllPlayers()
      .then((players: Player[]) => {
        res.send(players);
      })
      .catch((error: any) => {
        res.send({ error: 'Error fetching players: ' + error });
      });
  };

  public addPlayer = (req: Request, res: Response) => {
    const adminPassword = req.headers[AdminPasswordKey];
    const newPlayer = req.body as NewPlayer;
    if (newPlayer.isBot && adminPassword !== this.config.adminPassword) {
      res.send({ error: 'You do not have permission to create a bot' });
      return;
    }
    this.playerDb
      .queryAllPlayers()
      .then((players: Player[]) => {
        const existing = players.filter((player: Player) => {
          return (
            player.firstName.toLowerCase() ===
              newPlayer.firstName.toLowerCase() &&
            player.lastName.toLowerCase() === newPlayer.lastName.toLowerCase()
          );
        });
        if (existing.length) {
          throw Error(
            `Player "${newPlayer.firstName} ${newPlayer.lastName}" already exists!`
          );
        } else {
          return this.playerDb.insertPlayer(newPlayer);
        }
      })
      .then((insertedPlayer: Player) => {
        res.send(insertedPlayer);
      })
      .catch((error: Error) => {
        res.send({ error: error.message });
      });
  };
}
