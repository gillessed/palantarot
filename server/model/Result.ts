export enum Role {
  BIDDER = 'BIDDER',
  PARTNER = 'PARTNER',
  OPPOSITION = 'OPPOSITION',
}

export interface RoleResult {
  id: string;
  points: number;
  gamesPlayed: number;
  delta?: number;
}

export interface RoleResultRankChange extends RoleResult {
  rankDelta?: number;
}

export interface Result {
  id: string;
  all: RoleResult;
  bidder?: RoleResult;
  partner?: RoleResult;
  opposition?: RoleResult;
}
