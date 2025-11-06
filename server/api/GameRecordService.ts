import { Request, type Response, Router } from "express";
import moment from "moment-timezone";
import { Database } from "../db/dbConnector.ts";
import { GameRecordQuerier, type RecentGameQuery } from "../db/GameRecordQuerier.ts";
import { type GameRecord, type GameRecordPartial } from "../model/GameRecord.ts";
import { IMonth, Month } from "../model/Month.ts";
import { Records } from "../model/Records.ts";
import { Result, Role, RoleResult } from "../model/Result.ts";
import { WebsocketManager } from "../websocket/WebsocketManager.ts";

export class GameRecordService {
  public router: Router;
  private gameDb: GameRecordQuerier;

  constructor(db: Database, websocketManager: WebsocketManager) {
    this.router = Router();
    this.gameDb = new GameRecordQuerier(db);
    this.router.get("/records", this.getRecords);
    this.router.post("/month", this.getMonthResults);
    this.router.post("/month/all", this.getMonthGames);
    this.router.post("/range", this.getGamesInRange);
    this.router.post("/recent", this.getRecentGames);
    this.router.get("/:id", this.getGame);
    this.router.post("/save", this.saveGame);
    this.router.post("/delete", this.deleteGame);
  }

  // API

  public getMonthResults = async (req: Request, res: Response) => {
    const body = req.body as Month;
    const month = IMonth.m(body);

    const { valid, error } = month.isValid({ inPast: true });
    if (!valid) {
      res.send({ error });
    }

    const startDate = IMonth.convertToSql(month);
    const endDate = IMonth.convertToSql(month.next());
    const deltaCutoff = moment.tz(IMonth.westernTimezone).startOf("day").utc().format("YYYY-MM-DD HH:mm:ss");

    try {
      const allResults = await this.getMonthResultsForRole(startDate, endDate, deltaCutoff);
      const bidderResults = await this.getMonthResultsForRole(startDate, endDate, deltaCutoff, Role.BIDDER);
      const partnerResults = await this.getMonthResultsForRole(startDate, endDate, deltaCutoff, Role.PARTNER);
      const oppositionResults = await this.getMonthResultsForRole(startDate, endDate, deltaCutoff, Role.OPPOSITION);
      const resultMap: Map<string, Partial<Result>> = new Map();
      for (const result of allResults) {
        resultMap.set(result.id, { id: result.id, all: result });
      }
      bidderResults.forEach(this.mapRoleResult(resultMap, Role.BIDDER));
      partnerResults.forEach(this.mapRoleResult(resultMap, Role.PARTNER));
      oppositionResults.forEach(this.mapRoleResult(resultMap, Role.OPPOSITION));
      const results = Array.from(resultMap.values());
      res.send(results);
    } catch (error) {
      res.send({ error: `Error getting results for month: ${error}` });
    }
  };

  private getMonthResultsForRole = async (startDate: string, endDate: string, deltaCutoff: string, role?: Role) => {
    const allResults = await this.gameDb.queryResultsBetweenDates(startDate, endDate, role);
    const deltaResults = await this.gameDb.queryResultsBetweenDates(deltaCutoff, endDate, role);
    const fullResults: Map<string, RoleResult> = new Map();
    allResults.forEach((result) => {
      fullResults.set(result.id, result);
    });
    deltaResults.forEach((result) => {
      if (fullResults.has(result.id)) {
        fullResults.set(result.id, {
          ...fullResults.get(result.id)!,
          delta: result.points,
        });
      }
    });
    return Array.from(fullResults.values());
  };

  private getRoleResultSetter = (role: Role) => {
    return (partial: Partial<Result>, roleResult: RoleResult) => {
      switch (role) {
        case Role.BIDDER:
          return { ...partial, bidder: roleResult };
        case Role.PARTNER:
          return { ...partial, partner: roleResult };
        case Role.OPPOSITION:
          return { ...partial, opposition: roleResult };
      }
    };
  };

  private mapRoleResult = (resultMap: Map<string, Partial<Result>>, role: Role) => {
    const setter = this.getRoleResultSetter(role);
    return (result: RoleResult) => {
      const partial = resultMap.get(result.id);
      if (partial) {
        const newPartial = setter(partial, result);
        resultMap.set(result.id, newPartial);
      }
    };
  };

  public getGamesInRange = (req: Request, res: Response) => {
    const body = req.body as {
      startDateString: string;
      endDateString: string;
    };

    const startDate = moment.tz(body.startDateString, IMonth.westernTimezone).format("YYYY-MM-DDThh:mm:ssZ");
    const endDate = moment.tz(body.endDateString, IMonth.westernTimezone).format("YYYY-MM-DDThh:mm:ssZ");

    this.gameDb
      .queryGamesBetweenDates(startDate, endDate)
      .then((results: GameRecord[]) => {
        res.send(results);
      })
      .catch((error: any) => {
        res.send({ error: `Error loading games between ${startDate} and ${endDate}: ${error}` });
      });
  };

  public getMonthGames = (req: Request, res: Response) => {
    const body = req.body as Month;
    const month = IMonth.m(body);

    const { valid, error } = month.isValid({ inPast: true });
    if (!valid) {
      res.send({ error });
    }

    const startDate = IMonth.convertToSql(month);
    const endDate = IMonth.convertToSql(month.next());

    this.gameDb
      .queryGamesBetweenDates(startDate, endDate)
      .then((results: GameRecord[]) => {
        res.send(results);
      })
      .catch((error: any) => {
        res.send({ error: `Error loading month games for ${startDate}: ${error}` });
      });
  };

  public getRecentGames = (req: Request, res: Response) => {
    const query = req.body as RecentGameQuery;
    this.gameDb
      .queryRecentGames(query)
      .then((games: GameRecordPartial[] | GameRecord[]) => {
        res.send(games);
      })
      .catch((error: any) => {
        res.send({ error: "Error loading recent games: " + error });
      });
  };

  public getGame = (req: Request, res: Response) => {
    const id = req.params["id"];
    this.gameDb
      .queryGameWithId(id)
      .then((game: GameRecord) => {
        res.send(game);
      })
      .catch(() => {
        res.send({ error: "Could not find game with id " + id });
      });
  };

  public saveGame = (req: Request, res: Response) => {
    const newGame = req.body as GameRecord;
    this.gameDb
      .saveGame(newGame)
      .then(() => {
        res.sendStatus(200);
        // TODO: add refresh
        //this.refreshSocketManager.sendRefreshMessage();
      })
      .catch((e) => {
        res.send({ error: "Could not save game: " + e });
      });
  };

  public deleteGame = (req: Request, res: Response) => {
    const { gameId } = req.body;
    this.gameDb
      .deleteGame(gameId)
      .then(() => {
        res.sendStatus(200);
        // TODO: add refresh
        //this.refreshSocketManager.sendRefreshMessage();
      })
      .catch((e) => {
        res.send({ error: "Could not delete game: " + e });
      });
  };

  public getRecords = (_: Request, res: Response) => {
    let records: Partial<Records> = {};
    this.gameDb
      .getAllMonthlyTotals()
      .then((scores) => {
        records = { ...records, scores };
        return this.gameDb.getSlamGames();
      })
      .then((slamGames: GameRecord[]) => {
        records = { ...records, slamGames };
        res.send(records);
      })
      .catch((e) => {
        res.send({ error: "Could not get scores: " + e });
      });
  };

  // Helpers
}
