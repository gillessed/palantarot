import { type ClientGame } from "../../../app/services/room/ClientGame.ts";
import {
  BlankState,
  type PlayState,
  type ShowDetails,
  type TrickCards,
} from "../../../app/services/room/ClientGameEventHandler";
import { type TarotBot } from "../../../bots/TarotBot.ts";
import { Game } from "../game/Game.ts";
import { type Card } from "../model/Card.ts";
import {
  type Action,
  type BidAction,
  type CallPartnerAction,
  type PlayCardAction,
  type SetDogAction,
  type ShowTrumpAction,
} from "../model/GameEvents";
import {
  type Bid,
  type BiddingBoardState,
  type CompletedTrick,
  type DogRevealAndExchangeBoardState,
  GameplayState,
  type PartnerCallBoardState,
  type PlayerId,
  type PlayingBoardState,
  type Trick,
} from "../model/GameState";

export function getNextPlayer(game: Game): PlayerId | null {
  const state = game.getState();
  switch (state.name) {
    case GameplayState.NewGame:
      return null;
    case GameplayState.Completed:
      return null;
    case GameplayState.Bidding:
      const bidState = state as BiddingBoardState;
      return bidState.bidding.bidders[0];
    case GameplayState.PartnerCall:
      const callState = state as PartnerCallBoardState;
      return callState.bidder;
    case GameplayState.DogReveal:
      const dogState = state as DogRevealAndExchangeBoardState;
      return dogState.bidder;
    case GameplayState.Playing:
      const playState = state as PlayingBoardState;
      const currentTrick = playState.current_trick;
      return currentTrick.players[currentTrick.current_player];
  }
}

export function playForBot(game: Game, botId: string, bot: TarotBot): Action | null {
  const clientGame = convertStateToInGame(game, botId);
  switch (clientGame.playState.state) {
    case GameplayState.NewGame:
      return null;
    case GameplayState.Completed:
      return null;
    case GameplayState.Bidding:
      const bid = bot.bid(clientGame);
      const bidAction: BidAction = {
        ...bid,
        player: botId,
        type: "bid",
        time: Date.now(),
      };
      return bidAction;
    case GameplayState.PartnerCall:
      const call = bot.pickPartner(clientGame);
      const callAction: CallPartnerAction = {
        type: "call_partner",
        player: botId,
        time: Date.now(),
        card: call,
      };
      return callAction;
    case GameplayState.DogReveal:
      const dogCards = bot.dropDog(clientGame);
      const setDogAction: SetDogAction = {
        type: "set_dog",
        player: botId,
        privateTo: botId,
        time: Date.now(),
        dog: dogCards,
      };
      return setDogAction;
    case GameplayState.Playing:
      const card = bot.playCard(clientGame);
      const playCardAction: PlayCardAction = {
        type: "play_card",
        player: botId,
        time: Date.now(),
        card,
      };
      return playCardAction;
  }
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
    case GameplayState.Bidding:
      const bidState = state as BiddingBoardState;
      playState = convertBidBoardState(playerIndex, bidState);
      break;
    case GameplayState.PartnerCall:
      const callState = state as PartnerCallBoardState;
      playState = convertCallBoardState(playerIndex, callState);
      break;
    case GameplayState.DogReveal:
      const dogState = state as DogRevealAndExchangeBoardState;
      playState = convertDogBoardState(playerIndex, dogState);
      break;
    case GameplayState.Playing:
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
    state: GameplayState.Bidding,
    hand: state.hands[playerIndex],
    playerBids: getPlayerBids(state.bidding.bids),
    toBid: playerIndex,
  };
  return playState;
}

function convertCallBoardState(playerIndex: number, state: PartnerCallBoardState): PlayState {
  const playState: PlayState = {
    ...BlankState,
    state: GameplayState.PartnerCall,
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
    state: GameplayState.DogReveal,
    dog: state.dog,
  };
}

function convertPlayBoardState(game: Game, botId: string, playerIndex: number, state: PlayingBoardState): PlayState {
  const currentTrick = state.current_trick;
  return {
    ...convertDogBoardState(playerIndex, state as unknown as DogRevealAndExchangeBoardState),
    state: GameplayState.Playing,
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
