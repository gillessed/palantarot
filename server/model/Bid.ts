export interface BidRequest {
  playerId?: string;
}

export interface BidStat {
  won: number;
  lost: number;
}

export interface BidStats {
  playerId?: string;
  ten: BidStat;
  twenty: BidStat;
  fourty: BidStat;
  eighty: BidStat;
  onesixty: BidStat;
}
