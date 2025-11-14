import type { TarotBot } from "../../../shared/bots/TarotBot.ts";
import type { ClientGame } from "../../../shared/types/ClientGame.ts";
import {
  BlankState,
  type PlayState,
  type ShowDetails,
  type TrickCards,
} from "../../../shared/types/ClientGameTypes.ts";
import { Game } from "../game/Game.ts";
import { type Card } from "../model/Card.ts";
import {
  type Action,
  type BidAction,
  type CallPartnerAction,
  type PlayCardAction,
  type SetDogAction,
  type ShowTrumpAction,
} from "../model/GameEvents.ts";
import {
  type Bid,
  type BiddingBoardState,
  type CompletedTrick,
  type DogRevealAndExchangeBoardState,
  type PartnerCallBoardState,
  type PlayerId,
  type PlayingBoardState,
  type Trick,
} from "../model/GameState.ts";

export function getNextPlayer(game: Game): PlayerId | null {
  const state = game.getState();
  switch (state.name) {
    case "new_game":
      return null;
    case "completed":
      return null;
    case "bidding":
      const bidState = state as BiddingBoardState;
      return bidState.bidding.bidders[0];
    case "partner_call":
      const callState = state as PartnerCallBoardState;
      return callState.bidder;
    case "dog_reveal":
      const dogState = state as DogRevealAndExchangeBoardState;
      return dogState.bidder;
    case "playing":
      const playState = state as PlayingBoardState;
      const currentTrick = playState.current_trick;
      return currentTrick.players[currentTrick.current_player];
  }
}

export function playForBot(game: Game, botId: string, bot: TarotBot): Action | null {
  const clientGame = convertStateToInGame(game, botId);
  switch (clientGame.playState.state) {
    case "new_game":
      return null;
    case "completed":
      return null;
    case "bidding":
      const bid = bot.bid(clientGame);
    const bidAction: BidAction = {
        ...bid,
        player: botId,
        type: "bid",
        time: Date.now(),
      };
      return bidAction;
    case "partner_call":
      const call = bot.pickPartner(clientGame);
      const callAction: CallPartnerAction = {
        type: "call_partner",
        player: botId,
        time: Date.now(),
        card: call,
      };
      return callAction;
    case "dog_reveal":
      const dogCards = bot.dropDog(clientGame);
      const setDogAction: SetDogAction = {
        type: "set_dog",
        player: botId,
        privateTo: botId,
        time: Date.now(),
        dog: dogCards,
      };
      return setDogAction;
    case "playing":
      const card = bot.playCard(clientGame);
      const playCardAction: PlayCardAction = {
        type: "play_card",
        player: botId,
        time: Date.now(),
        card,
      };
      return playCardAction;
  }
  return null;
}

function getPlayerBids(bids: Bid[]) {
  const playerBids = new Map<PlayerId, Bid>();
  for (const bid of bids) {
    playerBids.set(bid.player, bid);
  }
  return playerBids;
}

function convertStateToInGame(game: Game, botId: string): ClientGame {
  const state = game.getState();
  const playerIndex = state.players.indexOf(botId);
  let playState: PlayState = { ...BlankState };
  switch (state.name) {
    case "bidding":
      const bidState = state as BiddingBoardState;
      playState = convertBidBoardState(playerIndex, bidState);
      break;
    case "partner_call":
      const callState = state as PartnerCallBoardState;
      playState = convertCallBoardState(playerIndex, callState);
      break;
    case "dog_reveal":
      const dogState = state as DogRevealAndExchangeBoardState;
      playState = convertDogBoardState(playerIndex, dogState);
      break;
    case "playing":
      const playingState = state as PlayingBoardState;
      playState = convertPlayBoardState(game, botId, playerIndex, playingState);
      break;
  }
  return {
    playerId: botId,
    id: game.id,
    events: game.getEvents(botId).events,
    playState,
    settings: game.settings,
  };
}

function convertBidBoardState(playerIndex: number, state: BiddingBoardState): PlayState {
  const playState: PlayState = {
    ...BlankState,
    playerOrder: state.players,
    state: "bidding",
    hand: state.hands[playerIndex],
    playerBids: getPlayerBids(state.bidding.bids),
    toBid: playerIndex,
  };
  return playState;
}

function convertCallBoardState(playerIndex: number, state: PartnerCallBoardState): PlayState {
  const playState: PlayState = {
    ...BlankState,
    state: "partner_call",
    playerOrder: state.players,
    hand: state.hands[playerIndex],
    winningBid: state.bidding.winningBid,
    playerBids: getPlayerBids(state.allBids),
  };
  return playState;
}

function convertDogBoardState(playerIndex: number, state: DogRevealAndExchangeBoardState): PlayState {
  return {
    ...convertCallBoardState(playerIndex, state as unknown as PartnerCallBoardState),
    state: "dog_reveal",
    dog: state.dog,
  };
}

function convertPlayBoardState(game: Game, botId: string, playerIndex: number, state: PlayingBoardState): PlayState {
  const currentTrick = state.current_trick;
  return {
    ...convertDogBoardState(playerIndex, state as unknown as DogRevealAndExchangeBoardState),
    state: "playing",
    toPlay: currentTrick.players[currentTrick.current_player],
    partner: state.partner,
    partnerCard: state.called,
    anyPlayerPlayedCard: currentTrick.trick_num > 0 || currentTrick.cards.length > 0,
    trick: convertTrick(state.current_trick),
    completedTricks: state.past_tricks.map(convertCompletedTrick),
    shows: getShows(game, botId),
  };
}

function getShows(game: Game, botId: string) {
  const showDetails: ShowDetails[] = [];
  game.getEvents(botId).events.forEach((event) => {
    if (event.type === "show_trump") {
      const trumpEvent = event as ShowTrumpAction;
      showDetails.push({
        player: trumpEvent.player,
        trumpCards: trumpEvent.cards,
      });
    }
  });
  return showDetails;
}

function convertCompletedTrick(trick: CompletedTrick): TrickCards {
  const cards = new Map<string, Card>();
  for (let i = 0; i < trick.cards.length; i++) {
    cards.set(trick.players[i], trick.cards[i]);
  }
  return {
    order: trick.players,
    cards,
    completed: true,
    winner: trick.winner,
  };
}

function convertTrick(trick: Trick): TrickCards {
  const cards = new Map<string, Card>();
  for (let i = 0; i < trick.cards.length; i++) {
    cards.set(trick.players[i], trick.cards[i]);
  }
  return {
    order: trick.players,
    cards,
    completed: true,
  };
}
