import { Database } from './../db/dbConnector';
import { Router, Request, Response } from 'express';
import { StatsQuerier } from '../db/StatsQuerier';
import { Stats } from '../model/Stats';

export class StatsService {
  public router: Router;
  private statsDb: StatsQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.statsDb = new StatsQuerier(db);
    this.router.get('/', this.getStats);
  }

  // API
  public getStats = (_: Request, res: Response) => {
    this.statsDb.getStats().then((stats: Stats) => {
      res.send(stats);
    }).catch((error: any) => {
      res.send({ error: `Error getting stats: ${error}` });
    });
  }
}