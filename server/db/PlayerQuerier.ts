import { Database } from './dbConnector';
import { Player } from './../model/Player';

const selectPlayers = `SELECT * FROM players`;

export class PlayerQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public queryAllPlayers = (): Promise<Player[]> => {
    return this.db.query(selectPlayers).then((players: any[]) => {
      return players.map((player: any) => {
        return {
          id: player['id'] + '',
          firstName: player['first_name'],
          lastName: player['last_name'],
          email: player['email'],
        } as Player;
      });
    });
  }
}