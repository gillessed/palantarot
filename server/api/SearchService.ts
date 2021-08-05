import {Request, Response, Router} from 'express';
import {GameRecordQuerier} from '../db/GameRecordQuerier';
import {SearchQuery} from '../model/Search';
import {Database} from './../db/dbConnector';

export class SearchService {
  public router: Router;
  private gameDb: GameRecordQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.gameDb = new GameRecordQuerier(db);
    this.router.post('/', this.search);
  }

  public search = async (req: Request, res: Response) => {
    const searchQuery = req.body as SearchQuery;
    try {
      const games = await this.gameDb.search(searchQuery);
      res.send(games);
    } catch (error) {
      res.send({error: `Error performing search: ${error}`});
    }
  };
}
