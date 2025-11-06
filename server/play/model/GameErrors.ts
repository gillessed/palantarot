import { type Card, toCardString, type TrumpCard } from "./Card.ts";
import { type Action, type SetDogAction, type ShowTrumpAction } from "./GameEvents.ts";
import { type Bid, BidValue, type PlayerId } from "./GameState.ts";

export const GameErrors = {
  invalidActionForGameState: (action: Action, state: string) => {
    return new Error(`Cannot ${action.type} as we're currently in game state ${state}!`);
  },
  actionAlreadyHappened: (action: Action, state: PlayerId[]) => {
    return new Error(`Cannot ${action.type} as it has already happened! Existing state: ${state}`);
  },
  tooManyPlayers: (player: PlayerId, players: PlayerId[]) => {
    return new Error(`Cannot add ${player} as there are already too many players: ${players}`);
  },
  playerNotInGame: (player: PlayerId, players: PlayerId[]) => {
    return new Error(`Cannot find ${player}! Existing players: ${players}`);
  },
  playerMarkedReady: (player: PlayerId) => {
    return new Error(`Player ${player} cannot currently leave the game! They must unmark themselves as ready first.`);
  },
  playerNotReady: (player: PlayerId, players: PlayerId[]) => {
    return new Error(
      `Player ${player} cannot unmark themselves as ready, because they weren't ready to start! ${players}`
    );
  },
  biddingOutOfTurn: (player: PlayerId, current: PlayerId) => {
    return new Error(`${player} cannot bid because it is currently ${current}'s turn.`);
  },
  canOnlyCallRussianOnTwenties: (bid: Bid) => {
    return new Error(`${bid.player} illegally tried to bid a Russian ${bid.bid}!`);
  },
  bidTooLow: (action: BidValue, current: BidValue) => {
    return new Error(`Bid value of ${action} is too low! Need to either pass or exceed ${current}.`);
  },
  onlyBidderCanDeclareSlam: (player: PlayerId, bidder: PlayerId) => {
    return new Error(`Player ${player} cannot declare a slam, only ${bidder} can!`);
  },
  cannotShowTwice: (player: PlayerId) => {
    return new Error(`${player} cannot show trump twice!`);
  },
  invalidTrumpShow: (action: ShowTrumpAction, expected: TrumpCard[]) => {
    return new Error(
      `Invalid trump show: Got ${action.cards.map(toCardString)}, expected ${expected.map(toCardString)}.`
    );
  },
  notEnoughTrump: (trumps: number, needed: number) => {
    return new Error(`Not enough trump to show! You have ${trumps} but need ${needed}.`);
  },
  cannotCallPartnerIfNotBidder: (player: PlayerId, bidder: PlayerId) => {
    return new Error(`${player} cannot call a partner because they are not the the bidder, ${bidder}!`);
  },
  cannotCallTrump: (card: Card) => {
    return new Error(`You cannot call a trump card as your partner call! ${toCardString(card)}`);
  },
  cannotSetDogIfNotBidder: (taker: PlayerId, bidder: PlayerId) => {
    return new Error(`Player ${taker} cannot exchange with the dog, as they are not ${bidder}!`);
  },
  setDogActionShouldBePrivate: (action: SetDogAction) => {
    return new Error(
      `Setting dog should have 'privateTo' attribute set to the player, instead got ${action.privateTo}`
    );
  },
  newDogWrongSize: (dog: Card[], expected: number) => {
    return new Error(`Proposed dog ${dog.map(toCardString)} does not have the expected number of cards, ${expected}.`);
  },
  newDogDoesntMatchHand: (dog: Card[], possible: Card[]) => {
    return new Error(
      `Proposed dog ${dog.map(toCardString)} contains cards that are not in your hand or the dog: ${possible.map(
        toCardString
      )}.`
    );
  },
  afterFirstTurn: (action: Action) => {
    return new Error(`Cannot ${action.type}, as it is after this player's first turn.`);
  },
  playingOutOfTurn: (player: PlayerId, current: PlayerId) => {
    return new Error(`${player} cannot play a card because it is currently ${current}'s turn.`);
  },
  cardNotInHand: (action: Action & { card: Card }, hand: Card[]) => {
    return new Error(
      `Cannot conduct ${action.type} with ${toCardString(
        action.card
      )}, as requested card is not in the players hand! Hand contains ${hand.map(toCardString)}`
    );
  },
  cannotPlayCard: (card: Card, trick: Card[], allowable: Card[]) => {
    return new Error(
      `Cannot play card ${toCardString(card)} into played cards ${trick.map(
        toCardString
      )}. You must play one of ${allowable.map(toCardString)}.`
    );
  },
  cannotLeadCalledSuit: (card: Card, called: Card) => {
    return new Error(`Cannot play card ${toCardString(card)} first turn because you called ${toCardString(called)}.`);
  },
};
