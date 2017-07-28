import { Database } from './dbConnector';
import { Player } from './../model/Player';
import { NewPlayer } from '../model/Player';
import { QueryBuilder } from './queryBuilder/QueryBuilder';

export class PlayerQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public queryAllPlayers = (): Promise<Player[]> => {
    
    const query = QueryBuilder.select('players').star();

    return this.db.query(query.getQueryString()).then((players: any[]) => {
      return players.map((player: any) => {
        return {
          id: player['id'] + '',
          firstName: player['first_name'],
          lastName: player['last_name'],
        } as Player;
      });
    });
  }

  // Inserts

  public insertPlayer = (player: NewPlayer): Promise<Player> => {

    const query = QueryBuilder
      .insert('players')
      .v('first_name', player.firstName)
      .v('last_name', player.lastName)
      .v('email', player.email);
      
    return this.db.query(query.getQueryString(), query.getValues()).then((results: {insertId: number}) => {
      return {
        ...player,
        id: `${results.insertId}`,
      };
    });
  }
}