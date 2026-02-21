import type { Card, TrumpCard } from "../../server/play/model/Card.ts";
import type {
  Bid,
  CompletedGameState,
  GamePhase,
  PlayerId,
} from "../../server/play/model/GameState.ts";

export interface ClientTrickCards {
  readonly order: string[];
  readonly cards: ReadonlyMap<string, Card>;
}

export interface ClientCompletedTrick extends ClientTrickCards {
  readonly completed: true;
  readonly winner: string;
}

export interface ClientShowDetails {
  readonly player: PlayerId;
  readonly trumpCards: ReadonlyArray<TrumpCard>;
}

export interface ClientGame {
  readonly gamePhase: GamePhase;
  readonly hand: ReadonlyArray<Card>;
  readonly dog: ReadonlyArray<Card>;
  readonly playerOrder: ReadonlyArray<PlayerId>;
  readonly readiedPlayers: ReadonlySet<PlayerId>;
  readonly toPlay?: PlayerId;
  readonly toBid?: number;
  readonly playerBids: ReadonlyMap<PlayerId, Bid>;
  readonly winningBid?: Bid;
  readonly partner?: PlayerId;
  readonly partnerCard?: Card;
  readonly anyPlayerPlayedCard?: boolean;
  readonly trick: ClientTrickCards;
  readonly completedTricks: ReadonlyArray<ClientTrickCards>;
  readonly endState?: CompletedGameState;
  readonly shows: ReadonlyArray<ClientShowDetails>;
  readonly showIndex: number | null;
  readonly allHands: ReadonlyMap<PlayerId, ReadonlyArray<Card>>;
  readonly notifyPlayer: PlayerId | null;
}

export const EmptyClientGame: ClientGame = {
  gamePhase: "new_game",
  hand: [],
  dog: [],
  playerOrder: [],
  readiedPlayers: new Set(),
  playerBids: new Map(),
  trick: {
    order: [],
    cards: new Map(),
  },
  completedTricks: [],
  shows: [],
  showIndex: null,
  allHands: new Map(),
  notifyPlayer: null,
};
