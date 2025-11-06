import { generateId } from "../utils/randomString.ts";
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

export type PlayerPredicate = "in_game" | "bidder" | "partner" | "opponent";

export type PlayerOperator = "is" | "is not";

export interface PlayerQuery {
  player: string;
  operator: PlayerOperator;
  predicate: PlayerPredicate;
}

export type ScoreOperator = "=" | ">" | "<" | ">=" | "<=";

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
    operator: "is",
    predicate: "in_game",
  };
}

export function emptyScoreQuery(): ScoreQuery {
  return {
    value: 0,
    operator: "=",
  };
}

export function isQueryEmpty(query: SearchQuery) {
  const { playerQueries, numberOfPlayers, scoreQueries, bidQuery, dateRange } = query;
  return (
    playerQueries.length === 0 &&
    numberOfPlayers.length === 0 &&
    scoreQueries.length === 0 &&
    bidQuery.length === 0 &&
    dateRange === undefined
  );
}
