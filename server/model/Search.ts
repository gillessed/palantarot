import { generateId } from '../utils/randomString';
export interface SearchQuery {
  id: string;
  playerQueries: PlayerQuery[];
  scoreQueries: ScoreQuery[];
  bidQuery: number[];
  numberOfPlayers: number[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export enum PlayerPredicate {
  inGame = 'in game',
  bidder = 'bidder',
  partner = 'partner',
  opponent = 'opponent',
}

export enum PlayerOperator {
  is = 'is',
  isNot = 'is not',
}

export interface PlayerQuery {
  player: string;
  operator: PlayerOperator;
  predicate: PlayerPredicate;
}

export enum ScoreOperator {
  equals = '=',
  greaterThan = '>',
  lessThan = '<',
  greaterThanOrEqual = '>=',
  lessThanOrEqual = '<=',
}

export interface ScoreQuery {
  value: number;
  operator: ScoreOperator;
}

export function emptySearchQuery(): SearchQuery {
  return {
    id: generateId(),
    playerQueries: [],
    scoreQueries: [],
    bidQuery: [],
    numberOfPlayers: [],
  };
}

export function emptyPlayerQuery(playerId: string): PlayerQuery {
  return {
    player: playerId,
    operator: PlayerOperator.is,
    predicate: PlayerPredicate.inGame,
  };
}

export function emptyScoreQuery(): ScoreQuery {
  return {
    value: 0,
    operator: ScoreOperator.equals,
  };
}

export function isQueryEmpty(query: SearchQuery) {
  const { playerQueries, numberOfPlayers, scoreQueries, bidQuery, dateRange } =
    query;
  return (
    playerQueries.length === 0 &&
    numberOfPlayers.length === 0 &&
    scoreQueries.length === 0 &&
    bidQuery.length === 0 &&
    dateRange === undefined
  );
}
