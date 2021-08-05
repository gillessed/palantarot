import {Request, Response, Router} from 'express';
import {PlayerQuerier} from '../db/PlayerQuerier';
import {StatsQuerier} from '../db/StatsQuerier';
import {BidRequest, BidStats} from '../model/Bid';
import {Deltas} from '../model/Delta';
import {Stats} from '../model/Stats';
import {Streak} from '../model/Streak';
import {Database} from './../db/dbConnector';

export class StatsService {
  public router: Router;
  private statsDb: StatsQuerier;
  private playerDb: PlayerQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.statsDb = new StatsQuerier(db);
    this.playerDb = new PlayerQuerier(db);
    this.router.get('/', this.getStats);
    this.router.post('/deltas', this.getDeltas);
    this.router.post('/bids', this.getBids);
    this.router.get('/streaks', this.getStreaks);
  }

  // API
  public getStats = (_: Request, res: Response) => {
    this.statsDb
      .getStats()
      .then((stats: Stats) => {
        res.send(stats);
      })
      .catch((error: any) => {
        res.send({error: `Error getting stats: ${error}`});
      });
  };

  public getDeltas = (req: Request, res: Response) => {
    const body = req.body as DeltasRequest;
    let promise: Promise<Deltas>;
    if (body.playerId) {
      promise = this.statsDb.getPlayerDeltas(body.length, body.playerId);
    } else {
      promise = this.statsDb.getAllDeltas(body.length);
    }
    promise
      .then((deltas: Deltas) => {
        res.send(deltas);
      })
      .catch((error: any) => {
        res.send({error: `Error getting deltas: ${error}`});
      });
  };

  public getBids = (req: Request, res: Response) => {
    const body = req.body as BidRequest;
    this.statsDb
      .getPlayerBids(body.playerId)
      .then((bids: BidStats) => {
        res.send(bids);
      })
      .catch((error: any) => {
        res.send({error: `Error getting bid stats: ${error}`});
      });
  };

  public getStreaks = (_: Request, res: Response) => {
    this.playerDb
      .getPlayerWithNGames(100)
      .then((playerIds: string[]) => {
        const promises: Promise<Streak>[] = [];
        for (const id of playerIds) {
          promises.push(this.statsDb.getStreak(id, true));
          promises.push(this.statsDb.getStreak(id, false));
        }
        return Promise.all(promises);
      })
      .then((streaks: Streak[]) => {
        res.send(streaks);
      })
      .catch((error: any) => {
        res.send({error: `Error getting streaks: ${error}`});
      });
  };
}

export interface DeltasRequest {
  playerId?: string;
  length: number;
}
