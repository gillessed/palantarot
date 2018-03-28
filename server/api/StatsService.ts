import { Database } from './../db/dbConnector';
import { Router, Request, Response } from 'express';
import { StatsQuerier } from '../db/StatsQuerier';
import { Stats } from '../model/Stats';
import { Deltas } from '../model/Delta';

export class StatsService {
  public router: Router;
  private statsDb: StatsQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.statsDb = new StatsQuerier(db);
    this.router.get('/', this.getStats);
    this.router.post('/deltas', this.getDeltas);
  }

  // API
  public getStats = (_: Request, res: Response) => {
    this.statsDb.getStats().then((stats: Stats) => {
      res.send(stats);
    }).catch((error: any) => {
      res.send({ error: `Error getting stats: ${error}` });
    });
  }

  public getDeltas = (req: Request, res: Response) => {
    const body = req.body as DeltasRequest;
    this.statsDb.getAllDeltas(body.length).then((deltas: Deltas) => {
      res.send(deltas);
    }).catch((error: any) => {
      res.send({ error: `Error getting stats: ${error}` });
    });
  }
}

export interface DeltasRequest {
  playerId?: string;
  length: number;
}