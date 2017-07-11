import { Result, BaseResult } from './../model/Result';
import { Game, PlayerHand } from './../model/Game';
import { PlayerQuerier } from './../db/PlayerQuerier';
import { GameQuerier } from './../db/GameQuerier';
import { Database } from './../db/dbConnector';
import { Router, Request, Response } from 'express';
import { Month, IMonth } from '../model/Month';
import moment from 'moment-timezone';
import { RecentGameQuery } from '../db/GameQuerier';

const westernTimezone = 'America/Los_Angeles';

export class GameService {
  public router: Router;
  private playerDb: PlayerQuerier;
  private gameDb: GameQuerier;

  constructor(db: Database) {
    this.router = Router();
    this.playerDb = new PlayerQuerier(db);
    this.gameDb = new GameQuerier(db);
    this.router.post('/month', this.getMonthResults);
    this.router.post('/month/all', this.getMonthGames);
    this.router.post('/recent', this.getRecentGames);
    this.router.get('/:id', this.getGame);
    this.router.post('/save', this.saveGame);
    this.router.post('/delete', this.deleteGame);
  }

  // API

  public getMonthResults = (req: Request, res: Response) => {
    const body = req.body as Month;
    const month = IMonth.m(body);

    const { valid, error } = month.isValid({ inPast: true });
    if (!valid) {
      res.send({ error });
    }

    const startDate = this.convertToSql(month);
    const endDate = this.convertToSql(month.next());

    this.gameDb.queryGamesBetweenDates(startDate, endDate).then((results: Game[]) => {
      const games = results;
      const baseResult = this.computeScoresForGames(games);
      const deltaCutoff = moment.tz(westernTimezone).startOf('day');
      const deltaGames = games.filter((game: Game) => {
        return moment(game.timestamp).isAfter(deltaCutoff);
      });
      const deltaResult = this.computeScoresForGames(deltaGames);
      const finalResult = this.combineBaseAndDelta(baseResult, deltaResult);
      res.send(finalResult);
    }).catch((error: any) => {
      res.send({ error: `Error loading games for ${startDate}: ${error}` });
    });
  }

  public getMonthGames = (req: Request, res: Response) => {
    const body = req.body as Month;
    const month = IMonth.m(body);

    const { valid, error } = month.isValid({ inPast: true });
    if (!valid) {
      res.send({ error });
    }

    const startDate = this.convertToSql(month);
    const endDate = this.convertToSql(month.next());

    this.gameDb.queryGamesBetweenDates(startDate, endDate).then((results: Game[]) => {
      res.send(results);
    }).catch((error: any) => {
      res.send({ error: `Error loading month games for ${startDate}: ${error}` });
    });
  }

  public getRecentGames = (req: Request, res: Response) => {
    const query = req.body as RecentGameQuery;
    this.gameDb.queryRecentGames(query).then((games: Game[]) => {
      res.send(games);
    }).catch((error: any) => {
      res.send({ error: 'Error loading recent games: ' + error });
    });
  }

  public getGame = (req: Request, res: Response) => {
    const id = req.params['id'];
    this.gameDb.queryGameWithId(id).then((game: Game) => {
      res.send(game);
    }).catch(() => {
      res.send({ error: 'Could not find game with id ' + id });
    });
  }

  public saveGame = (req: Request, res: Response) => {
    const newGame = req.body as Game;
    this.gameDb.saveGame(newGame).then(() => {
      res.sendStatus(200);
    }).catch((e) => {
      res.send({ error: 'Could not save game: ' + e});
    });
  }

  public deleteGame = (req: Request, res: Response) => {
    const { gameId } = req.body;
    this.gameDb.deleteGame(gameId).then(() => {
      res.sendStatus(200);
    }).catch((e) => {
      res.send({ error: 'Could not delete game: ' + e});
    });
  }

  // Helpers

  private convertToSql(date: Month): string {
    const month = `00${date.month + 1}`.slice(-2);
    const dateString = `${date.year}-${month}-01`;
    // Lock months to Mountain time.
    return moment.tz(dateString, westernTimezone).format('YYYY-MM-DDThh:mm:ssZ');
  }

  private computeScoresForGames(games: Game[]): BaseResult[] {
    var results = new Map<string, BaseResult>();
    const hands: PlayerHand[] = [];
    games.forEach((game: Game) => {
      if (game.handData) {
        hands.push(game.handData.bidder);
        if (game.handData.partner) {
          hands.push(game.handData.partner);
        }
        game.handData.opposition.forEach((hand: PlayerHand) => {
          hands.push(hand);
        });
      }
    });
    hands.forEach((hand: PlayerHand) => {
      if (!results.has(hand.id)) {
        results.set(hand.id, {
          id: hand.id,
          points: 0,
          gamesPlayed: 0,
        });
      }
      const result = results.get(hand.id)!;
      results.set(hand.id, {
        id: result.id,
        points: result.points + hand.pointsEarned,
        gamesPlayed: result.gamesPlayed + 1,
      });
    });
    return Array.from(results.values());
  }

  private combineBaseAndDelta(results: BaseResult[], deltas: BaseResult[]): Result[] {
    const deltaMap = new Map<string, BaseResult>(
      deltas.map((result: Result) => [result.id, result] as [string, BaseResult])
    );
    const finalResults: Result[] = results.map((result: BaseResult) => {
      if (deltaMap.has(result.id)) {
        return {
          ...result,
          delta: deltaMap.get(result.id)!.points,
        }
      } else {
        return {
          ...result,
          delta: 0,
        };
      }
    });
    return finalResults;
  }
}