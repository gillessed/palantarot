import { Month } from './../../server/model/Month';
import { Result } from './../../server/model/Result';
import { Game } from './../../server/model/Game';
import { Player, NewPlayer } from './../../server/model/Player';
import { ApisauceInstance, create } from 'apisauce';
import { mapFromCollection } from '../../server/utils';
import { RecentGameQuery } from '../../server/db/GameQuerier';
import { AuthRequest } from '../services/auth/index';
import { pTimeout } from '../../server/utils/index';
import { StaticRoutes } from '../routes';
import { Records } from '../../server/model/Records';
import { Stats } from '../../server/model/Stats';
import { DeltasRequest } from '../../server/api/StatsService';
import { Deltas } from '../../server/model/Delta';
import history from '../history';

export class ServerApi {
  private api: ApisauceInstance;

  constructor(
    baseURL: string,
  ) {
    this.api = create({
      baseURL
    });
  }

  // API

  public login = (request: AuthRequest): Promise<void> => {
    // Timeout for login time to feel natural
    return pTimeout(250).then(() => {
      return this.wrapPost<void>('/login', request);
    })
  }

  public getPlayers = (): Promise<Map<string, Player>> => {
    return this.wrapGet('/players').then((players: Player[]) => {
      return mapFromCollection(players, 'id');
    });
  }

  public getRecentGames = (query: RecentGameQuery): Promise<Game[]> => {
    return this.wrapPost<Game[]>('/game/recent', query);
  }

  public getMonthGames = (month: Month): Promise<Game[]> => {
    return this.wrapPost<Game[]>(`/game/month/all`, month);
  }

  public loadGame = (gameId: string): Promise<Game> => {
    return this.wrapGet<Game>(`/game/${gameId}`);
  }

  public saveGame = (newGame: Game): Promise<void> => {
    return this.wrapPost<void>(`/game/save`, newGame);
  }

  public getResults = (month: Month): Promise<Result[]> => {
    return this.wrapPost<Result[]>(`/game/month`, month);
  }

  public addPlayer = (newPlayer: NewPlayer): Promise<Player> => {
    return this.wrapPost<Player>('/players/add', newPlayer);
  }

  public deleteGame = (gameId: string): Promise<void> => {
    return this.wrapPost<void>('/game/delete', { gameId });
  }

  public getRecords = (): Promise<Records> => {
    return this.wrapGet<Records>('/game/records');
  }
  
  public getStats = (): Promise<Stats> => {
    return this.wrapGet<Stats>('/stats');
  }

  public getDeltas = (request: DeltasRequest) => {
    return this.wrapPost<Deltas>('/stats/deltas', request);
  }

  // Helpers

  public wrapGet = <RESP>(url: string) => {
    return this.api.get<RESP | { error: string }>(url).then((response): RESP => {
      if (response.ok) {
        const data = response.data! as any;
        if (data.error) {
          throw new Error(data.error);
        } else {
          return data;
        }
      } else if (response.status === 403) {
        history.push(StaticRoutes.login());
        throw new Error('Unauthaurized');
      } else {
        throw new Error(response.problem);
      }
    });
  }

  public wrapPost = <RESP>(url: string, body: any) => {
    return this.api.post<RESP | { error: string }>(url, body).then((response): RESP => {
      if (response.ok) {
        const data = response.data! as any;
        if (data.error) {
          throw new Error(data.error);
        } else {
          return data;
        }
      } else if (response.status === 403) {
        history.push(StaticRoutes.login());
        throw new Error('Unauthaurized');
      } else {
        throw new Error(response.problem);
      }
    });
  }
}