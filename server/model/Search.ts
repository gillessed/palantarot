export interface SearchQuery {
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
export const PlayerPredicates: PlayerPredicate[] = [
  "in_game",
  "bidder",
  "partner",
  "opponent",
];
export const PlayerPredicateSelectData = [
  { value: "in_game", label: "In game" },
  { value: "bidder", label: "Bidder" },
  { value: "partner", label: "Partner" },
  { value: "opponent", label: "Opponent" },
];
export const isPlayerPredicate = (
  predicateString: string | null | undefined
): predicateString is PlayerPredicate => {
  return PlayerPredicates.indexOf(predicateString as PlayerPredicate) >= 0;
};

export type PlayerOperator = "is" | "is not";
export const PlayerOperators: PlayerOperator[] = ["is", "is not"];
export const isPlayerOperator = (
  operatorString: string | null | undefined
): operatorString is PlayerOperator => {
  return PlayerOperators.indexOf(operatorString as PlayerOperator) >= 0;
};

export interface PlayerQuery {
  player: string;
  operator: PlayerOperator;
  predicate: PlayerPredicate;
}

export type ScoreOperator = "=" | ">" | "<" | ">=" | "<=";
export const ScoreOperators = ["=", ">", "<", ">=", "<="];
export const isScoreOperator = (
  operatorString: string | null | undefined
): operatorString is ScoreOperator => {
  return ScoreOperators.indexOf(operatorString as ScoreOperator) >= 0;
};

export interface ScoreQuery {
  value: number;
  operator: ScoreOperator;
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
