
import type { Card, TrumpCard } from "../../server/play/model/Card.ts";
import type {  Bid, CompletedGameState, GameplayState, PlayerId } from "../../server/play/model/GameState.ts";

// const { isEqual, without } = pkg;

export interface TrickCards {
  order: string[];
  cards: Map<string, Card>;
  completed: boolean;
  winner?: string;
}

export interface PlayState {
  readonly state: GameplayState;
  readonly hand: Card[];
  readonly dog: Card[];
  readonly playerOrder: PlayerId[];
  readonly readiedPlayers: Set<PlayerId>;
  readonly toPlay?: PlayerId;
  readonly toBid?: number;
  readonly playerBids: Map<PlayerId, Bid>;
  readonly winningBid?: Bid;
  readonly partner?: PlayerId;
  readonly partnerCard?: Card;
  readonly anyPlayerPlayedCard?: boolean;
  readonly trick: TrickCards;
  readonly completedTricks: TrickCards[];
  readonly endState?: CompletedGameState;
  readonly shows: ShowDetails[];
  readonly showIndex: number | null;
  readonly allHands: Map<PlayerId, Card[]>;
  readonly allowNotifyPlayer: PlayerId | null;
}

export interface ShowDetails {
  player: PlayerId;
  trumpCards: TrumpCard[];
}

export const BlankState: PlayState = {
  state: "new_game",
  hand: [],
  dog: [],
  playerOrder: [],
  readiedPlayers: new Set(),
  playerBids: new Map(),
  trick: {
    order: [],
    cards: new Map(),
    completed: false,
  },
  completedTricks: [],
  shows: [],
  showIndex: null,
  allHands: new Map(),
  allowNotifyPlayer: null,
};