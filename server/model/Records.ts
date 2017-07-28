import { Game } from './Game';
export interface Records {
  scores: MonthlyScore[];
  slamGames: Game[];
}

export interface MonthlyScore {
  playerId: string;
  score: number;
  month: number;
  year: number;
  gameCount: number;
}
