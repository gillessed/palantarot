import { Request, Response, Router } from 'express';
import { GameQuerier } from '../db/GameQuerier';
import { Player } from '../model/Player';
import { Database } from './../db/dbConnector';
import { NewPlayer } from './../model/Player';
import { SearchQuery } from '../model/Search';

export class SearchService {
  public router: Router;
  private gameDb: GameQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.gameDb = new GameQuerier(db);
    this.router.post('/', this.search);
  }

  public search = async (req: Request, res: Response) => {
    const searchQuery = req.body as SearchQuery;
    try {
      const games = await this.gameDb.search(searchQuery);
      res.send(games);
    } catch (error) {
      res.send({ error: `Error performing search: ${error}` });
    }
  }
}
