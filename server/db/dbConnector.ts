import { Pool, PoolClient, ConnectionConfig, QueryResult } from "pg";

export class Database {
  private pool: Pool;

  constructor(options: ConnectionConfig) {
    this.pool = new Pool(options);
  }

  public query = async (
    query: string,
    values?: any[]
  ): Promise<QueryResult> => {
    if (values && values.length) {
      return this.pool.query(query, values);
    } else {
      return this.pool.query(query);
    }
  };

  public beginTransaction = async (): Promise<Transaction> => {
    const client = await this.pool.connect();
    return new Transaction(client);
  };
}

export class Transaction {
  constructor(public readonly client: PoolClient) {}

  public query = async (
    query: string,
    values?: any[]
  ): Promise<QueryResult> => {
    try {
      if (values && values.length) {
        const result = await this.client.query(query, values);
        return result;
      } else {
        const result = await this.client.query(query);
        return result;
      }
    } catch (error) {
      await this.client.query("ROLLBACK");
      await this.client.release();
      return Promise.reject(error);
    }
  };

  public commit = async () => {
    await this.client.query("COMMIT");
    await this.client.release();
  };
}

export function connect(
  options: ConnectionConfig,
  callback: (db: Database) => void
) {
  console.log(
    `Connecting to postgres with options ${JSON.stringify(options, null, 2)}`
  );
  const db = new Database(options);
  callback(db);
}
