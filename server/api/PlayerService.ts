import { PlayerQuerier } from './../db/PlayerQuerier';
import { Database } from './../db/dbConnector';
import { Router, Request, Response } from 'express';

export class PlayerService {
  public router: Router;
  private playerDb: PlayerQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.playerDb = new PlayerQuerier(db);
    this.router.get('/', this.getAll);
  }

  public getAll = (_: Request, res: Response) => {
    this.playerDb.queryAllPlayers().then((players: any[]) => {
      res.send(players);
    }).catch((error: any) => {
      res.send({error: 'Error fetching players: ' + error});
    });
  }
}