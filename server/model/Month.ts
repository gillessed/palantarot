import moment from 'moment-timezone';

export interface Month {
  year: number;
  month: number;
}

export class IMonth implements Month {
  year: number;
  month: number;

  constructor(m: Month) {
    this.year = m.year;
    this.month = m.month;
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
    return new IMonth({ month: previous, year: previous == 11 ? this.year - 1 : this.year });
  }

  public next(): IMonth {
    const nextMonth = (this.month + 1) % 12;
    return new IMonth({ month: nextMonth, year: nextMonth == 0 ? this.year + 1 : this.year });
  }

  public static m(m: Month) {
    return new IMonth(m);
  }

  public static now() {
    return new IMonth({ month: moment().month(), year: moment().year() });
  }
}