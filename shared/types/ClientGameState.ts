import type { Card } from "../../server/play/model/Card.ts";
import type {
  Bid,
  GamePhase,
  PlayerId,
} from "../../server/play/model/GameState.ts";
import type { ClientCompletedTrick, ClientShowDetails, ClientTrickCards } from "./ClientGameTypes.ts";

interface BaseClientGameState {
  readonly phase: GamePhase;
}

export interface ShowTrumpClientGameState {
  readonly shows: ReadonlyArray<ClientShowDetails>;
  readonly showIndex: number | null;
}

export interface NewGameClientGameState extends BaseClientGameState {
  readonly phase: "new_game";
  readonly playerOrder: ReadonlyArray<PlayerId>;
  readonly readiedPlayers: ReadonlySet<PlayerId>;
}

export interface BiddingClientGameState
  extends BaseClientGameState,
    ShowTrumpClientGameState {
  readonly phase: "bidding";
  readonly playerOrder: ReadonlyArray<PlayerId>;
  readonly playerBids: ReadonlyMap<PlayerId, Bid>;
  readonly toBid: number;
  readonly hand: ReadonlyArray<Card>;
}

export interface PartnerCallClientGameState
  extends BaseClientGameState,
    ShowTrumpClientGameState {
  readonly phase: "partner_call";
  readonly playerOrder: ReadonlyArray<PlayerId>;
  readonly winningBid: Bid;
  readonly hand: ReadonlyArray<Card>;
  readonly partnerCard?: Card;
}

export interface DogRevealClientGameState
  extends BaseClientGameState,
    ShowTrumpClientGameState {
  readonly phase: "dog_reveal";
  readonly playerOrder: ReadonlyArray<PlayerId>;
  readonly winningBid: Bid;
  readonly hand: ReadonlyArray<Card>;
  readonly partnerCard?: Card;
  readonly dog: ReadonlyArray<Card>;
  readonly partner?: PlayerId;
}

export interface PlayingClientGameState
  extends BaseClientGameState,
    ShowTrumpClientGameState {
  readonly phase: "playing";
  readonly playerOrder: ReadonlyArray<PlayerId>;
  readonly winningBid: Bid;
  readonly hand: ReadonlyArray<Card>;
  readonly partnerCard?: Card;
  readonly dog?: ReadonlyArray<Card>;
  readonly partner?: PlayerId;
  readonly anyPlayerPlayedCard: boolean;
  readonly trick: ClientTrickCards;
  readonly completedTricks: ReadonlyArray<ClientCompletedTrick>;
  readonly toPlay: PlayerId;
}

export type ClientGameState =
  | NewGameClientGameState
  | BiddingClientGameState
  | PartnerCallClientGameState
  | DogRevealClientGameState
  | PlayingClientGameState;

// TODO: completed game state

// export interface ClientGame {
//   readonly phase: GamePhase;
//   readonly hand: ReadonlyArray<Card>;
//   readonly dog: ReadonlyArray<Card>;
//   readonly playerOrder: ReadonlyArray<PlayerId>;
//   readonly readiedPlayers: ReadonlySet<PlayerId>;
//   readonly toBid?: number;
//   readonly playerBids: ReadonlyMap<PlayerId, Bid>;
//   readonly winningBid?: Bid;
//   readonly partner?: PlayerId;
//   readonly partnerCard?: Card;
//   readonly anyPlayerPlayedCard?: boolean;
//   readonly trick: ClientTrickCards;
//   readonly completedTricks: ReadonlyArray<ClientTrickCards>;
//   readonly endState?: CompletedGameState;
//   readonly shows: ReadonlyArray<ClientShowDetails>;
//   readonly showIndex: number | null;
//   readonly allHands: ReadonlyMap<PlayerId, ReadonlyArray<Card>>;
//   readonly notifyPlayer: PlayerId | null;
// }
