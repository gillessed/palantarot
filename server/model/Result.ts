export type Role = "bidder" | "partner" | "opposition";

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
