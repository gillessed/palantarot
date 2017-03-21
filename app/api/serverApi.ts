import { Month } from './../../server/model/Month';
import { Result } from './../../server/model/Result';
import { Game } from './../../server/model/Game';
import { Player } from './../../server/model/Player';
import { ApisauceInstance, create } from 'apisauce';
import { mapFromCollection, encodeQueryData } from '../../server/utils';

export class ServerApi {
  private api: ApisauceInstance;

  constructor(baseURL: string) {
    this.api = create({
      baseURL
    });
  }

  // API

  public getPlayers = (): Promise<Map<string, Player>> => {
    return this.wrapGet('/players').then((players: Player[]) => {
      return mapFromCollection(players, 'id');
    });
  }

  public getRecentGames = (count: number | undefined): Promise<Game[]> => {
    const url = '/game/recent' + encodeQueryData({ count: count });
    return this.wrapGet<Game[]>(url);
  }

  public loadGame = (gameId: string): Promise<Map<string, Game>> => {
    return this.wrapGet<Game>(`/game/${gameId}`).then((game: Game) => {
      return new Map<string, Game>([[game.id, game]]);
    });
  }

  public getResults = (month: Month): Promise<Result[]> => {
    return this.wrapPost<Result[]>(`/game/month`, month);
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
      } else {
        throw new Error(response.problem);
      }
    });
  }
}