import mysql, { IPool } from 'mysql';

interface ConnectionOptions {
  host: string;
  user: string;
  password: string;
  database: string;
}

export class Database {
  private pool: IPool;

  constructor(options: ConnectionOptions) {
    this.pool = mysql.createPool(options);
  }

  public query = (query: string, values?: any[]): Promise<any> => {
    return new Promise((resolve: (result: any[]) => void, reject: (reason: any) => void) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        if (values) {
          connection.query(query, values, (queryError, result) => {
            connection.release();
            if (queryError) {
              reject(queryError);
            } else {
              resolve(result);
            }
          });
        } else {
          connection.query(query, (queryError, result) => {
            connection.release();
            if (queryError) {
              reject(queryError);
            } else {
              resolve(result);
            }
          });
        }
      });
    })
  }
}

export function connect(options: ConnectionOptions, callback: (db: Database) => void) {
  const db = new Database(options);
  callback(db);
}