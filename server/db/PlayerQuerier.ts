import { Database } from './dbConnector';
import { Player } from './../model/Player';
import { NewPlayer } from '../model/Player';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { QueryResult } from 'pg';

export class PlayerQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public queryAllPlayers = (): Promise<Player[]> => {
    const query = QueryBuilder.select('players').star();
    return this.db.query(query.getIndexedQueryString()).then((result: QueryResult) => {
      return result.rows.map((player: any) => {
        return {
          id: player['id'] + '',
          firstName: player['first_name'],
          lastName: player['last_name'],
        } as Player;
      });
    });
  }

  public getPlayerWithNGames = (n: number): Promise<string[]> => {
    const query = QueryBuilder
      .select('player_hand')
      .c('player_fk_id')
      .c('count(*) as n_games')
      .groupBy('player_fk_id');
    return this.db.query(query.getIndexedQueryString()).then((result: QueryResult) => {
      return result.rows.map((player: any) => {
        if (player['n_games'] > n) {
          return `${player['player_fk_id']}`;
        } else {
          return undefined;
        }
      }).filter((id) => id !== undefined) as string[];
    });
  }

  // Inserts

  public insertPlayer = (player: NewPlayer): Promise<Player> => {

    const query = QueryBuilder
      .insert('players')
      .v('first_name', player.firstName)
      .v('last_name', player.lastName)
      .return('id');
      
    return this.db.query(query.getIndexedQueryString(), query.getValues()).then((result: QueryResult) => {
      const id = result.rows[0].id;
      return { ...player, id };
    });
  }
}
