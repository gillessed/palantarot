import mysql, { IPool, IConnection } from 'mysql';

interface ConnectionOptions {
  host: string;
  port: number;
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
          console.log(err);
          reject(err);
          return;
        }
        if (values && values.length) {
          connection.query(query, values, (queryError, result) => {
            connection.release();
            if (queryError) {
              console.log('Rolling back transaction', queryError);
              reject(queryError);
            } else {
              resolve(result);
            }
          });
        } else {
          connection.query(query, (queryError, result) => {
            connection.release();
            if (queryError) {
              console.log('Rolling back transaction', queryError);
              reject(queryError);
            } else {
              resolve(result);
            }
          });
        }
      });
    })
  }

  public beginTransaction = (): Promise<Transaction> => {
    return new Promise((resolve: (result: Transaction) => void, reject: (reason: any) => void) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Transaction(connection));
        }
      });
    });
  }
}

export class Transaction {
  constructor(private readonly connection: IConnection) {}

  public query = (query: string, values?: any[]): Promise<any> => {
    return new Promise((resolve: (result: any) => void, reject: (reason: any) => void) => {
      if (values && values.length) {
        this.connection.query(query, values, (queryError, result) => {
          if (queryError) {
            console.log('Rolling back transaction', queryError);
            this.connection.rollback(() => {
              reject(queryError)
            });
          } else {
            resolve(result);
          }
        });
      } else {
        this.connection.query(query, (queryError, result) => {
          if (queryError) {
            console.log('Rolling back transaction', queryError);
            this.connection.rollback(() => {
              reject(queryError)
            });
          } else {
            resolve(result);
          }
        });
      }
    });
  }

  public commit = (): Promise<void> => {
    return new Promise((resolve: (result: void) => void, reject: (reason: any) => void) => {
      this.connection.commit((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(undefined);
        }
      });
    });
  }
}

export function connect(options: ConnectionOptions, callback: (db: Database) => void) {
  const db = new Database(options);
  callback(db);
}