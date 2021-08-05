import {GameRecord} from './GameRecord';

export interface Records {
  scores: MonthlyScore[];
  slamGames: GameRecord[];
}

export interface MonthlyScore {
  playerId: string;
  score: number;
  month: number;
  year: number;
  gameCount: number;
}
