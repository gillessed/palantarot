import { Database } from './dbConnector';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { QueryResult } from 'pg';
import { Tarothon, NewTarothon } from '../model/Tarothon';

export class TarothonQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public getTarothon = (id: string): Promise<Tarothon> => {
    const sqlQuery = QueryBuilder.select('tarothon')
      .star()
      .where(QueryBuilder.compare().compareValue('id', '=', id));

    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.toTarothon(result.rows[0]);
    });
  }

  public getTarothons = (): Promise<Tarothon[]> => {
    const sqlQuery = QueryBuilder.select('tarothon').star();

    return this.db.query(sqlQuery.getIndexedQueryString()).then((result: QueryResult) => {
      return result.rows.map(this.toTarothon);
    });
  }

  public insertTarothon = (data: NewTarothon): Promise<string> => {
    const sqlQuery = QueryBuilder.insert('tarothon')
      .v('begin_date', data.begin)
      .v('end_date', data.end)
      .return('id');
    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return result.rows[0].id.toString();
    });
  }

  public editTarothon = (data: Tarothon): Promise<any> => {
    const sqlQuery = QueryBuilder.update('tarothon')
      .v('begin_date', data.begin)
      .v('end_date', data.end)
      .where(QueryBuilder.compare().compareValue('id', '=', data.id));
    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues());
  }

  public deleteTarothon = (id: string): Promise<any> => {
    const sqlQuery = QueryBuilder.delete('tarothon')
      .where(QueryBuilder.compare().compareValue('id', '=', id));
    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues());
  }

  // Helpers

  private toTarothon = (result: {[key: string]: any}): Tarothon => {
    const id = result['id'];
    const begin = result['begin_date'];
    const end = result['end_date'];
    return { id, begin, end };
  };
}
