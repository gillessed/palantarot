/*
 * Simple query builders that should do most things need. If need more, implement more.
 */
export const QueryBuilder = {
  insert: (table: string) => new InsertBuilder(table),
  update: (table: string) => new UpdateBuilder(table),
  delete: (table: string) => new DeleteBuilder(table),
  select: (table: string) => new SelectBuilder(table),
  join: (table: string, condition: ConditionBuilder) => new JoinBuilder(table, condition),
  where: (condition: ConditionBuilder) => new WhereBuilder(condition),
  condition: () => new ConditionBuilder(),
}

export interface QueryBuilder {
  getQueryString: () => string;
  getValues: () => any[];
}

export interface UpsertBuilder extends QueryBuilder {
  v: (column: string, value: any) => UpsertBuilder;
}

class InsertBuilder implements UpsertBuilder {
  private columns: string[] = [];
  private values: any[] = [];

  public constructor(private readonly table: string) {}

  public v(column: string, value: any): InsertBuilder {
    this.columns.push(column);
    this.values.push(value);
    return this;
  }

  public getQueryString(): string {
    let queryString = 'INSERT INTO ';
    queryString += this.table;
    queryString += ' (';
    queryString += this.columns.join(', ');
    queryString += ') VALUES (';
    queryString += this.values.map(() => '?').join(', ');
    queryString += ')';
    return queryString;
  }

  public getValues(): any[] {
    return this.values;
  }
}

class UpdateBuilder implements UpsertBuilder {
  private _columns: string[] = [];
  private _values: any[] = [];
  private _where?: WhereBuilder;

  public constructor(private readonly table: string) {}

  public v(column: string, value: any): UpdateBuilder {
    this._columns.push(column);
    this._values.push(value);
    return this;
  }

  public where(condition: ConditionBuilder): UpdateBuilder {
    this._where = new WhereBuilder(condition);
    return this;
  }

  public getQueryString(): string {
    let queryString = 'UPDATE ';
    queryString += this.table;
    queryString += ' SET ';
    queryString += this._columns.map((column) => column + '=?').join(', ')
    if (this._where) {
      queryString += ' ';
      queryString += this._where.getQueryString();
    }
    return queryString;
  }

  public getValues(): any[] {
    const allValues = Array.from(this._values);
    if (this._where) {
      allValues.push(...this._where.getValues());
    }
    return allValues;
  }
}

class DeleteBuilder implements QueryBuilder {
  private _where?: WhereBuilder;
  constructor(
    private readonly _table: string,
  ) {}

  public where(condition: ConditionBuilder): DeleteBuilder {
    this._where = new WhereBuilder(condition);
    return this;
  }

  public getQueryString(): string {
    let queryString = 'DELETE FROM ';
    queryString += this._table;
    if (this._where) {
      queryString += ' ';
      queryString += this._where.getQueryString();
    }
    return queryString;
  }

  public getValues(): any[] {
    if (this._where) {
      return this._where.getValues();
    } else {
      return [];
    }
  }
}

class SelectBuilder implements QueryBuilder {
  private _columns: string[] = [];
  private _star: boolean = false;
  private _where?: WhereBuilder;
  private _offset?: number;
  private _limit?: number;
  private _join?: JoinBuilder;
  private _orderBy?: string;
  private _orderDirection?: 'desc';

  constructor(private readonly _table: string) {};

  public star(): SelectBuilder {
    this._star = true;
    return this;
  }

  public c(column: string): SelectBuilder {
    this._columns.push(column);
    return this;
  }

  public columns(newColunn: string[]): SelectBuilder {
    this._columns.push(...newColunn);
    return this;
  }

  public join(table: string, condition: ConditionBuilder): SelectBuilder {
    this._join = new JoinBuilder(table, condition);
    return this;
  }

  public where(condition: ConditionBuilder): SelectBuilder {
    this._where = new WhereBuilder(condition);
    return this;
  }

  public orderBy(column: string, direction?: 'desc') {
    this._orderBy = column;
    this._orderDirection = direction;
  }

  public limit(limit: number, offset?: number): SelectBuilder {
    this._limit = limit;
    this._offset = offset;
    return this;
  }

  public getQueryString(): string {
    let queryString = 'SELECT ';
    if (this._star) {
      queryString += '*';
    } else {
      queryString += '(';
      queryString += this._columns.join(', ');
      queryString += ')';
    }
    queryString += ' FROM ';
    queryString += this._table;
    if (this._join) {
      queryString += ' ';
      queryString += this._join.getQueryString();
    }
    if (this._where) {
      queryString += ' ';
      queryString += this._where.getQueryString();
    }
    if (this._orderBy) {
      queryString += ' ORDER BY ';
      queryString += this._orderBy;
      if (this._orderDirection === 'desc') {
        queryString += ' DESC';
      }
    }
    if (this._limit) {
      queryString += ' LIMIT ';
      queryString += this._limit;
      if (this._offset) {
        queryString += ' OFFSET ';
        queryString += this._offset;
      }
    }
    return queryString;
  }

  public getValues(): any[] {
    const values: any[] = [];
    if (this._join) {
      values.push(...this._join.getValues());
    }
    if (this._where) {
      values.push(...this._where.getValues());
    }
    return values;
  }
}

class JoinBuilder implements QueryBuilder {
  constructor(
    private readonly _table: string,
    private readonly _condition: ConditionBuilder
  ) {}

  public getQueryString(): string {
    let queryString = 'JOIN ';
    queryString += this._table;
    queryString += ' ON ';
    queryString += this._condition.getQueryString();
    return queryString;
  }

  public getValues(): any[] {
    return this._condition.getValues();
  }
}

class WhereBuilder implements QueryBuilder {
  constructor(private readonly conditionBuilder: ConditionBuilder) {}

  public getQueryString(): string {
    let queryString = 'WHERE ';
    queryString += this.conditionBuilder.getQueryString();
    return queryString;
  }

  public getValues(): any[] {
    return this.conditionBuilder.getValues();
  }
}

export type Comparator = '=' | '>' | '<' | '>=' | '<=';

class ConditionBuilder implements QueryBuilder {
  private clauses: string[] = [];
  private values: any[] = [];

  public equals(column: string, comparator: Comparator, value: any): ConditionBuilder {
    let clause = column;
    clause += comparator;
    clause += '?';
    this.clauses.push(clause);
    this.values.push(value);
    return this;
  }

  public equalsColumn(column1: string, comparator: Comparator, column2: string): ConditionBuilder {
    let clause = column1;
    clause += comparator;
    clause += column2;
    this.clauses.push(clause);
    return this;
  }

  public getQueryString(): string {
    return this.clauses.join(' AND ');
  }

  public getValues(): any[] {
    return this.values;
  }
}