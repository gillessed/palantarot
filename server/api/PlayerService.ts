import { NewPlayer } from './../model/Player';
import { PlayerQuerier } from './../db/PlayerQuerier';
import { Database } from './../db/dbConnector';
import { Router, Request, Response } from 'express';
import { Player } from '../model/Player';

export class PlayerService {
  public router: Router;
  private playerDb: PlayerQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.playerDb = new PlayerQuerier(db);
    this.router.post('/add', this.addPlayer);
    this.router.get('/', this.getAll);
  }

  public getAll = (_: Request, res: Response) => {
    this.playerDb.queryAllPlayers().then((players: Player[]) => {
      res.send(players);
    }).catch((error: any) => {
      res.send({error: 'Error fetching players: ' + error});
    });
  }

  public addPlayer = (req: Request, res: Response) => {
    const newPlayer = req.body as NewPlayer;
    this.playerDb.queryAllPlayers().then((players: Player[]) => {
      const existing = players.filter((player: Player) => {
        return player.firstName.toLowerCase() === newPlayer.firstName.toLowerCase()
          && player.lastName.toLowerCase() === newPlayer.lastName.toLowerCase();
      });
      if (existing.length) {
        throw Error(`Player "${newPlayer.firstName} ${newPlayer.lastName}" already exists!`);
      } else {
        return this.playerDb.insertPlayer(newPlayer);
      }
    }).then((insertedPlayer: Player) => {
      res.send(insertedPlayer);
    }).catch((error: Error) => {
      res.send({error: error.message});
    });
  }
}