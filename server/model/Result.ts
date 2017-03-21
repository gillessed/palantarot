export type Result = BaseResult & Delta;

export interface BaseResult {
  id: string;
  points: number;
  gamesPlayed: number;
}

export interface Delta {
  delta: number;
}