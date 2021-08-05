import moment from 'moment-timezone';
import {integerComparator, SortOrder, Comparator} from '../utils/index';

export interface Month {
  year: number;
  month: number;
}

const _months: Map<string, IMonth> = new Map();

export class IMonth implements Month {
  year: number;
  month: number;

  private constructor(m: Month) {
    this.year = m.year;
    this.month = m.month;
  }

  public getHumanReadableString() {
    const zeroPadMonth = `00${this.month + 1}`.slice(-2);
    return `${this.year}/${zeroPadMonth}`;
  }

  public static get(m: Month): IMonth {
    const key = `${m.year},${m.month}`;
    if (_months.has(key)) {
      return _months.get(key)!;
    } else {
      const month = new IMonth(m);
      _months.set(key, month);
      return month;
    }
  }

  public isValid(options?: {inPast: boolean}): {
    valid: boolean;
    error?: string;
  } {
    if (this.month < 0 || this.month > 11) {
      return {valid: false, error: `Month must be between 0-11: ${this.month}`};
    }
    if (options && options.inPast && this.year > moment().year()) {
      return {valid: false, error: `Year must be less than ${moment().year()}`};
    }
    return {valid: true};
  }

  public previous(): IMonth {
    const previous = (this.month + 11) % 12;
    return IMonth.get({
      month: previous,
      year: previous === 11 ? this.year - 1 : this.year,
    });
  }

  public next(): IMonth {
    const nextMonth = (this.month + 1) % 12;
    return IMonth.get({
      month: nextMonth,
      year: nextMonth === 0 ? this.year + 1 : this.year,
    });
  }

  public simpleObject(): Month {
    return {month: this.month, year: this.year};
  }

  public static n(m: number, y: number) {
    return IMonth.get(new IMonth({month: m, year: y}));
  }

  public static m(m: Month) {
    return IMonth.get(m);
  }

  public static now() {
    return IMonth.get({month: moment().month(), year: moment().year()});
  }

  public static toString(month: Month): string {
    return JSON.stringify(month);
  }

  public static fromString(string: string): Month {
    return JSON.parse(string);
  }

  public static comparator<T>(
    map: (t: T) => IMonth,
    order: SortOrder
  ): Comparator<T> {
    return (t1: T, t2: T): number => {
      return integerComparator<IMonth>(
        (m: IMonth) => m.year,
        order,
        integerComparator<IMonth>((m: IMonth) => m.month, order)
      )(map(t1), map(t2));
    };
  }

  public static convertToSql(date: Month): string {
    const month = `00${date.month + 1}`.slice(-2);
    const dateString = `${date.year}-${month}-01`;
    // Lock months to Western time.
    return moment
      .tz(dateString, IMonth.westernTimezone)
      .format('YYYY-MM-DDThh:mm:ssZ');
  }

  public static westernTimezone = 'America/Los_Angeles';
}
