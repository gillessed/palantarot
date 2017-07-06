import moment from 'moment-timezone';

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

  public isValid(options?: { inPast: boolean }): { valid: boolean, error?: string } {
    if (this.month < 0 || this.month > 11) {
      return { valid: false, error: `Month must be between 0-11: ${this.month}` };
    }
    if (options && options.inPast && this.year > moment().year()) {
      return { valid: false, error: `Year must be less than ${moment().year()}` };
    }
    return { valid: true };
  }

  public previous(): IMonth {
    const previous = (this.month + 11) % 12;
    return IMonth.get({ month: previous, year: previous == 11 ? this.year - 1 : this.year });
  }

  public next(): IMonth {
    const nextMonth = (this.month + 1) % 12;
    return IMonth.get({ month: nextMonth, year: nextMonth == 0 ? this.year + 1 : this.year });
  }

  public static m(m: Month) {
    return IMonth.get(m);
  }

  public static now() {
    return IMonth.get({ month: moment().month(), year: moment().year() });
  }

  public static toString(month: Month): string {
    return JSON.stringify(month);
  }

  public static fromString(string: string): Month {
    return JSON.parse(string);
  }
}