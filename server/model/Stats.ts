
export type Stats = Stat[];

export interface Stat {
  month: number;
  year: number;
  playerId: string;
  totalGames: number;
  totalScore: number;
  wonGames: number;
  wonScore: number;
  wasBidder: boolean;
  wasPartner: boolean;
}
export interface StatEntry {
  key: string;
  allRoles?: StatAverage;
  bidder?: StatAverage;
  partner?: StatAverage;
  opposition?: StatAverage;
}

export interface StatAverage {
  averageWinScore?: number;
  winRate: number;
  totalCount: number;
  statRate?: number;
}
