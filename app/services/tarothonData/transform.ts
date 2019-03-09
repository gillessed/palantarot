import moment from 'moment';
import { Tarothon } from '../../../server/model/Tarothon';

export namespace Momenthon {
  export enum Time {
    UPCOMING = 'UPCOMING',
    NOW = 'NOW',
    DONE = 'DONE',
  }
}

/**
 * A tarothon converted to moment and with a few extra useful properties.
 */
export interface Momenthon {
  id: string;
  start: moment.Moment;
  end: moment.Moment;
  length: number;
  isWhen: Momenthon.Time;
}

export function convertToMomenthon(tarothon: Tarothon): Momenthon {
  const now = moment();
  const start = moment(tarothon.begin);
  const end = moment(tarothon.end);
  let isWhen: Momenthon.Time;
  if (now > end) {
    isWhen = Momenthon.Time.DONE;
  } else if (now < start) {
    isWhen = Momenthon.Time.UPCOMING;
  } else {
    isWhen = Momenthon.Time.NOW;
  }
  const lengthMoment = moment.duration(end.diff(start));
  const length = lengthMoment.asHours();
  return {
    id: tarothon.id,
    start,
    end,
    length,
    isWhen,
  };
}

export function getDateStrings(m: Momenthon) {
  return {
    date: m.start.format('ddd MMM DD YYYY'),
    startTime: m.start.format('HH:mm'),
  }
}
