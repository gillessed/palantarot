import { ApisauceInstance, create } from "apisauce";
import { DeltasRequest } from "../../server/api/StatsService";
import { RecentGameQuery } from "../../server/db/GameRecordQuerier";
import { AdminPasswordKey } from "../../server/headers";
import { BidRequest, BidStats } from "../../server/model/Bid";
import { Deltas } from "../../server/model/Delta";
import { GameRecord } from "../../server/model/GameRecord";
import { Records } from "../../server/model/Records";
import { SearchQuery } from "../../server/model/Search";
import { Stats } from "../../server/model/Stats";
import { Streak } from "../../server/model/Streak";
import { NewTarothon, Tarothon, TarothonData } from "../../server/model/Tarothon";
import { GameSettings } from "../../server/play/model/GameSettings";
import { NewRoomArgs } from "../../server/play/room/NewRoomArgs";
import { RoomDescriptions } from "../../server/play/room/RoomDescription";
import { mapFromCollection } from "../../server/utils";
import { pTimeout } from "../../server/utils/index";
import { getAdminPassword } from "../admin";
import { AuthRequest } from "../services/auth/index";
import { Month } from "./../../server/model/Month";
import { NewPlayer, Player } from "./../../server/model/Player";
import { Result } from "./../../server/model/Result";
import { StaticRoutes } from "../../shared/routes";

export class ServerApi {
  private api: ApisauceInstance;

  constructor(baseURL: string) {
    this.api = create({
      baseURL,
    });
  }

  // API

  public login = (request: AuthRequest): Promise<void> => {
    return pTimeout(250).then(() => {
      return this.wrapPost<void>("/login", request);
    });
  };

  public getPlayers = (): Promise<Map<string, Player>> => {
    return this.wrapGet<Player[]>("/players").then((players) => {
      return mapFromCollection(players, "id");
    });
  };

  public getRecentGames = (query: RecentGameQuery): Promise<GameRecord[]> => {
    return this.wrapPost<GameRecord[]>("/game/recent", query);
  };

  public getMonthGames = (month: Month): Promise<GameRecord[]> => {
    return this.wrapPost<GameRecord[]>(`/game/month/all`, month);
  };

  public loadGame = (gameId: string): Promise<GameRecord> => {
    return this.wrapGet<GameRecord>(`/game/${gameId}`);
  };

  public saveGame = (newGame: GameRecord): Promise<void> => {
    return this.wrapPost<void>(`/game/save`, newGame);
  };

  public getResults = (month: Month): Promise<Result[]> => {
    return this.wrapPost<Result[]>(`/game/month`, month);
  };

  public addPlayer = (newPlayer: NewPlayer): Promise<Player> => {
    return this.wrapPost<Player>("/players/add", newPlayer);
  };

  public deleteGame = (gameId: string): Promise<void> => {
    return this.wrapPost<void>("/game/delete", { gameId });
  };

  public getRecords = (): Promise<Records> => {
    return this.wrapGet<Records>("/game/records");
  };

  public getStats = (): Promise<Stats> => {
    return this.wrapGet<Stats>("/stats");
  };

  public getDeltas = (request: DeltasRequest) => {
    return this.wrapPost<Deltas>("/stats/deltas", request);
  };

  public getBids = (request: BidRequest) => {
    return this.wrapPost<BidStats>("/stats/bids", request);
  };

  public getTarothon = (id: string): Promise<TarothonData> => {
    return this.wrapGet(`/tarothon/data/${id}`);
  };

  public getTarothons = (): Promise<Tarothon[]> => {
    return this.wrapGet("/tarothon/get");
  };

  public addTarothon = (request: NewTarothon): Promise<{ id: string }> => {
    return this.wrapPost("/tarothon/add", request);
  };

  public deleteTarothon = (request: string): Promise<void> => {
    return this.wrapPost("/tarothon/delete", { id: request });
  };

  public getStreaks = (): Promise<Streak[]> => {
    return this.wrapGet("/stats/streaks");
  };

  public search = (searchQuery: SearchQuery): Promise<GameRecord[]> => {
    return this.wrapPost("/search", searchQuery);
  };

  public playNewGame = (settings: GameSettings): Promise<string> => {
    return this.wrapPost("/play/new_game", settings);
  };

  public createNewRoom = (settings: NewRoomArgs): Promise<string> => {
    return this.wrapPost("/play/new_room", settings);
  };

  public listRooms = (): Promise<RoomDescriptions> => {
    return this.wrapGet("/play/rooms");
  };

  // Helpers

  public wrapGet = <RESP>(url: string) => {
    return this.api.get<RESP | { error: string }>(url, { headers: this.getHeaders() }).then((response: any): RESP => {
      if (response.ok) {
        const data = response.data! as any;
        if (data.error) {
          throw new Error(data.error);
        } else {
          return data;
        }
      } else if (response.status === 403) {
        history.push(StaticRoutes.login());
        throw new Error("Unauthorized");
      } else {
        throw new Error(response.problem);
      }
    });
  };

  public wrapPost = <RESP>(url: string, body: any) => {
    return this.api
      .post<RESP | { error: string }>(url, body, {
        headers: { [AdminPasswordKey]: getAdminPassword() },
      })
      .then((response: any): RESP => {
        if (response.ok) {
          const data = response.data! as any;
          if (data.error) {
            throw new Error(data.error);
          } else {
            return data;
          }
        } else if (response.status === 403) {
          history.push(StaticRoutes.login());
          throw new Error("Unauthorized");
        } else {
          throw new Error(response.problem);
        }
      });
  };

  private getHeaders() {
    const headers: Record<string, string> = {};
    const adminPassword = getAdminPassword();
    if (adminPassword != null && adminPassword.length > 0) {
      headers[AdminPasswordKey] = adminPassword;
    }
    return headers;
  }
}
