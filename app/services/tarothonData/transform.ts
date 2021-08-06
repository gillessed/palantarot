import moment from 'moment';
import { Tarothon } from '../../../server/model/Tarothon';

export enum Time {
  UPCOMING = 'UPCOMING',
  NOW = 'NOW',
  DONE = 'DONE',
}

/**
 * A tarothon converted to moment and with a few extra useful properties.
 */
export interface Momenthon {
  id: string;
  start: moment.Moment;
  end: moment.Moment;
  length: number;
  isWhen: Time;
}

export function convertToMomenthon(tarothon: Tarothon): Momenthon {
  const now = moment();
  const start = moment(tarothon.begin);
  const end = moment(tarothon.end);
  let isWhen: Time;
  if (now > end) {
    isWhen = Time.DONE;
  } else if (now < start) {
    isWhen = Time.UPCOMING;
  } else {
    isWhen = Time.NOW;
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
  };
}
