import { ApisauceInstance, create } from 'apisauce';
import { DeltasRequest } from '../../server/api/StatsService';
import { RecentGameQuery } from '../../server/db/GameQuerier';
import { AdminPasswordKey } from '../../server/headers';
import { BidRequest, BidStats } from '../../server/model/Bid';
import { Deltas } from '../../server/model/Delta';
import { Records } from '../../server/model/Records';
import { SearchQuery } from '../../server/model/Search';
import { Stats } from '../../server/model/Stats';
import { Streak } from '../../server/model/Streak';
import { NewTarothon, Tarothon, TarothonData } from '../../server/model/Tarothon';
import { GameDescription } from '../../server/play/GameDescription';
import { mapFromCollection } from '../../server/utils';
import { pTimeout } from '../../server/utils/index';
import { getAdminPassword } from '../admin';
import history from '../history';
import { GameSettings } from '../play/server';
import { StaticRoutes } from '../routes';
import { AuthRequest } from '../services/auth/index';
import { Game } from './../../server/model/Game';
import { Month } from './../../server/model/Month';
import { NewPlayer, Player } from './../../server/model/Player';
import { Result } from './../../server/model/Result';

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

  public getBids = (request: BidRequest) => {
    return this.wrapPost<BidStats>('/stats/bids', request);
  }

  public getTarothon = (id: string): Promise<TarothonData> => {
    return this.wrapGet(`/tarothon/data/${id}`);
  }

  public getTarothons = (): Promise<Tarothon[]> => {
    return this.wrapGet('/tarothon/get');
  }

  public addTarothon = (request: NewTarothon): Promise<{ id: string }> => {
    return this.wrapPost('/tarothon/add', request);
  }

  public deleteTarothon = (request: string): Promise<void> => {
    return this.wrapPost('/tarothon/delete', { id: request });
  }

  public getStreaks = (): Promise<Streak[]> => {
    return this.wrapGet('/stats/streaks');
  }

  public search = (searchQuery: SearchQuery): Promise<Game[]> => {
    return this.wrapPost('/search', searchQuery);
  }

  public playNewGame = (settings: GameSettings): Promise<string> => {
    return this.wrapPost("/play/new_game", settings);
  }

  public listPlayableGames = (): Promise<{ [id: string]: GameDescription }> => {
    return this.wrapGet("/play/games");
  }
  
  // Helpers

  public wrapGet = <RESP>(url: string) => {
    return this.api.get<RESP | { error: string }>(url, { headers: { [AdminPasswordKey]: getAdminPassword() }}).then((response: any): RESP => {
      if (response.ok) {
        const data = response.data! as any;
        if (data.error) {
          throw new Error(data.error);
        } else {
          return data;
        }
      } else if (response.status === 403) {
        history.push(StaticRoutes.login());
        throw new Error('Unauthorized');
      } else {
        throw new Error(response.problem);
      }
    });
  }

  public wrapPost = <RESP>(url: string, body: any) => {
    return this.api.post<RESP | { error: string }>(url, body, { headers: { [AdminPasswordKey]: getAdminPassword() }}).then((response: any): RESP => {
      if (response.ok) {
        const data = response.data! as any;
        if (data.error) {
          throw new Error(data.error);
        } else {
          return data;
        }
      } else if (response.status === 403) {
        history.push(StaticRoutes.login());
        throw new Error('Unauthorized');
      } else {
        throw new Error(response.problem);
      }
    });
  }
}
