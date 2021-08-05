import {indexFlags} from './indexFlags';
/*
 * Simple query builders that should do most things need. If need more, implement more.
 */
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'OUTER';

export const QueryBuilder = {
  insert: (table: string) => new InsertBuilder(table),
  update: (table: string) => new UpdateBuilder(table),
  delete: (table: string) => new DeleteBuilder(table),
  select: (table: string) => new SelectBuilder(table),
  subselect: (table: string, name: string) => new SelectBuilder(table, name),
  join: (table: string, type: JoinType, condition: ComparisonBuilder) =>
    new JoinBuilder(table, type, condition),
  where: (condition: ComparisonBuilder) => new WhereBuilder(condition),
  compare: (conjunction?: 'AND' | 'OR') => new ComparisonBuilder(conjunction),
  contains: (column: string, value: string) =>
    new ContainsBuilder(column, value),
};

export interface QueryBuilder {
  getQueryString: () => string;
  getIndexedQueryString: () => string;
  getValues: () => any[];
}

//const convertTimestamp = "CONVERT_TZ(timestamp, '+00:00', '-08:00')";
const convertTimestamp = "timestamp AT TIME ZONE 'UTC' AT TIME ZONE '-8'";

export const Queries = {
  selectYear: (name = 'h_year') =>
    `EXTRACT(YEAR FROM (${convertTimestamp})) AS ${name}`,
  selectMonth: (name = 'h_month') =>
    `EXTRACT(MONTH FROM (${convertTimestamp})) AS ${name}`,
  selectDay: (name = 'h_day') =>
    `EXTRACT(DAY FROM (${convertTimestamp})) AS ${name}`,
};

export interface UpsertBuilder extends QueryBuilder {
  v: (column: string, value: any) => UpsertBuilder;
}

class InsertBuilder implements UpsertBuilder {
  private columns: string[] = [];
  private values: any[] = [];
  private returning?: string;

  public constructor(private readonly table: string) {}

  public v(column: string, value: any): InsertBuilder {
    this.columns.push(column);
    this.values.push(value);
    return this;
  }

  public return(value: string): InsertBuilder {
    this.returning = value;
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
    if (this.returning) {
      queryString += ' RETURNING ';
      queryString += this.returning;
    }
    return queryString;
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
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

  public where(condition: ComparisonBuilder): UpdateBuilder {
    this._where = new WhereBuilder(condition);
    return this;
  }

  public getQueryString(): string {
    let queryString = 'UPDATE ';
    queryString += this.table;
    queryString += ' SET ';
    queryString += this._columns.map(column => column + '=?').join(', ');
    if (this._where) {
      queryString += ' ';
      queryString += this._where.getQueryString();
    }
    return queryString;
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
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
  constructor(private readonly _table: string) {}

  public where(condition: ComparisonBuilder): DeleteBuilder {
    this._where = new WhereBuilder(condition);
    return this;
  }

  public getQueryString(): string {
    let queryString = 'DELETE FROM ';
    queryString += this._table;
    if (this._where) {
      queryString += ' ';
      queryString += this._where.getIndexedQueryString();
    }
    return queryString;
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
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
  private _star = false;
  private _where?: WhereBuilder;
  private _offset?: number;
  private _limit?: number;
  private _joins: JoinBuilder[];
  private _orderBy?: string;
  private _orderDirection?: 'asc' | 'desc';
  private _groupBy?: string[];
  private _name: string;

  constructor(private readonly _table: string, name?: string) {
    this._name = name || 'no name set';
    this._joins = [];
  }

  public getName(): string | undefined {
    return this._name;
  }

  public name(name: string): SelectBuilder {
    this._name = name;
    return this;
  }

  public star(): SelectBuilder {
    this._star = true;
    return this;
  }

  public c(column: string): SelectBuilder {
    this._columns.push(column);
    return this;
  }

  public cs(...newColunn: string[]): SelectBuilder {
    this._columns.push(...newColunn);
    return this;
  }

  public join(
    table: string | SelectBuilder,
    type: JoinType,
    condition: ConditionBuilder
  ): SelectBuilder {
    this._joins.push(new JoinBuilder(table, type, condition));
    return this;
  }

  public where(condition: ComparisonBuilder): SelectBuilder {
    this._where = new WhereBuilder(condition);
    return this;
  }

  public orderBy(column: string, direction?: 'asc' | 'desc'): SelectBuilder {
    this._orderBy = column;
    this._orderDirection = direction;
    return this;
  }

  public limit(limit: number, offset?: number): SelectBuilder {
    this._limit = limit;
    this._offset = offset;
    return this;
  }

  public groupBy(...columns: string[]) {
    this._groupBy = columns;
    return this;
  }

  public getQueryString(): string {
    let queryString = 'SELECT ';
    if (this._star) {
      queryString += '*';
    } else {
      queryString += this._columns.join(', ');
    }
    queryString += ' FROM ';
    queryString += this._table;
    for (const join of this._joins) {
      queryString += ' ';
      queryString += join.getQueryString();
    }
    if (this._where) {
      queryString += ' ';
      queryString += this._where.getQueryString();
    }
    if (this._groupBy) {
      queryString += ' GROUP BY ';
      queryString += this._groupBy.join(', ');
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

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
  }

  public getValues(): any[] {
    const values: any[] = [];
    for (const join of this._joins) {
      values.push(...join.getValues());
    }
    if (this._where) {
      values.push(...this._where.getValues());
    }
    return values;
  }
}

class JoinBuilder implements QueryBuilder {
  constructor(
    private readonly _table: string | SelectBuilder,
    private readonly _type: JoinType,
    private readonly _condition: ConditionBuilder
  ) {}

  public getQueryString(): string {
    let queryString = this._type;
    queryString += ' JOIN ';
    if (this._table instanceof SelectBuilder) {
      queryString += '(';
      queryString += this._table.getQueryString();
      queryString += ') ';
      queryString += this._table.getName();
      queryString += ' ';
    } else {
      queryString += this._table;
    }
    queryString += ' ON ';
    queryString += this._condition.getQueryString();
    return queryString;
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
  }

  public getValues(): any[] {
    const values: any[] = [];
    if (this._table instanceof SelectBuilder) {
      values.push(...this._table.getValues());
    }
    values.push(...this._condition.getValues());
    return values;
  }
}

class WhereBuilder implements QueryBuilder {
  constructor(private readonly conditionBuilder: ComparisonBuilder) {}

  public getQueryString(): string {
    let queryString = 'WHERE ';
    queryString += this.conditionBuilder.getQueryString();
    return queryString;
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
  }

  public getValues(): any[] {
    return this.conditionBuilder.getValues();
  }
}

type ConditionBuilder = QueryBuilder;

export type Comparator = '=' | '>' | '<' | '>=' | '<=' | '!=' | '<>';

class ComparisonBuilder implements ConditionBuilder {
  private clauses: string[] = [];
  private values: any[] = [];
  private conjunction: string;

  constructor(conjunction?: 'AND' | 'OR') {
    this.conjunction = conjunction ?? 'AND';
  }

  public compareValue(
    column: string,
    comparator: Comparator,
    value: any
  ): ComparisonBuilder {
    let clause = column;
    clause += ' ';
    clause += comparator;
    clause += ' ? ';
    this.clauses.push(clause);
    this.values.push(value);
    return this;
  }

  public compareColumn(
    column1: string,
    comparator: Comparator,
    column2: string
  ): ComparisonBuilder {
    let clause = column1;
    clause += ' ';
    clause += comparator;
    clause += ' ';
    clause += column2;
    this.clauses.push(clause);
    return this;
  }

  public columnIn(column: string, subselect: SelectBuilder): ComparisonBuilder {
    this.clauses.push(`${column} IN (${subselect.getIndexedQueryString()})`);
    this.values.push(...subselect.getValues());
    return this;
  }

  public valueIn(value: any, subselect: SelectBuilder): ComparisonBuilder {
    this.clauses.push(`? IN (${subselect.getIndexedQueryString()})`);
    this.values.push(value);
    this.values.push(...subselect.getValues());
    return this;
  }

  public getQueryString(): string {
    return this.clauses.join(` ${this.conjunction} `);
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
  }

  public getValues(): any[] {
    return this.values;
  }
}

class ContainsBuilder implements ConditionBuilder {
  constructor(
    private readonly column: string,
    private readonly values: string
  ) {}

  public getQueryString(): string {
    let query = this.column;
    query += ' IN (';
    query += this.values;
    query += ') ';
    return query;
  }

  public getIndexedQueryString(): string {
    return indexFlags(this.getQueryString());
  }

  public getValues(): any[] {
    return [];
  }
}
