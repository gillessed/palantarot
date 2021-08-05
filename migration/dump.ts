import {Player} from '../server/model/Player';

export interface SqlConfig {
  hostname: string;
  pasword: string;
  user: string;
  database: string;
  port: number;
}

export interface Dump {
  players: Player[];
  hands: Hand[];
  playerHands: PlayerHand[];
}

export interface Hand {
  id: number;
  timestamp: string;
  players: number;
  bidder: number;
  partner?: number;
  bidAmount: number;
  points: number;
  slam: boolean;
}

export interface PlayerHand {
  id: number;
  timestamp: string;
  hand: number;
  player: number;
  isBidder: boolean;
  isPartner: boolean;
  showed: boolean;
  oneLast: boolean;
  points: number;
}
