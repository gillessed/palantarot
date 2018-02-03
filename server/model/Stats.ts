import { IMonth } from './Month';
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

export type AggregatedStats = AggregatedStat[];

export interface AggregatedStat {
  playerId: string;
  month: IMonth;
  allStats: RoleStats;
  bidderStats: RoleStats;
  partnerStats: RoleStats;
  oppositionStats: RoleStats;
}

export interface RoleStats {
  totalGames: number;
  totalScore: number;
  wonGames: number;
  wonScore: number;
}

export interface StatAverages {
  allRoles?: StatAverage;
  bidder?: StatAverage;
  partner?: StatAverage;
  opposition?: StatAverage;
}

export interface StatAverage {
  per: number;
  win?: number;
  rate?: number;
  totalCount: number;
}
