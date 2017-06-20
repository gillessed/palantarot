import { Database } from './dbConnector';
import { Player } from './../model/Player';
import { NewPlayer } from '../model/Player';

const selectPlayers = 'SELECT * FROM players';
const insertPlayer = 'INSERT INTO players (first_name, last_name, email) VALUES (?, ?, ?)';
const lastInserted = 'WHERE id = LAST_INSERT_ID()';

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

  // Inserts

  public insertPlayer = (player: NewPlayer): Promise<Player> => {
    return this.db.query(insertPlayer, [player.firstName, player.lastName, player.email]).then(() => {
      return this.db.query(`${selectPlayers} ${lastInserted}`);
    }).then((player: any[]) => {
      return {
        id: player[0]['id'] + '',
        firstName: player[0]['first_name'],
        lastName: player[0]['last_name'],
        email: player[0]['email'],
      } as Player;
    });
  }
}