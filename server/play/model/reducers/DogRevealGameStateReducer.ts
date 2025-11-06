import { isEqual } from "lodash";
import { cardsWithout, getPlayerNum } from "../CardUtils";
import { GameErrors } from "../GameErrors";
import { type GameStartTransition, type PlayerEvent, type SetDogAction } from "../GameEvents";
import {
  type DogRevealAndExchangeBoardState,
  type DogRevealStateActions,
  type DogRevealStates,
  GameplayState,
  type PlayingBoardState,
  type ReducerResult,
} from "../GameState";
import { declareSlamActionReducer, showTrumpActionReducer } from "./CommonReducers";
import { getNewTrick } from "./Utils";

const handleSetDogAction = (
  state: DogRevealAndExchangeBoardState,
  action: SetDogAction
): ReducerResult<DogRevealStates> => {
  if (action.player !== state.bidder) {
    throw GameErrors.cannotSetDogIfNotBidder(action.player, state.bidder);
  }
  if (!isEqual(action.player, action.privateTo)) {
    throw GameErrors.setDogActionShouldBePrivate(action);
  }
  if (action.dog.length !== state.dog.length) {
    throw GameErrors.newDogWrongSize(action.dog, state.dog.length);
  }

  const playerNum = getPlayerNum(state.players, state.bidder);
  const playerHand = state.hands[playerNum];
  const cards = [...playerHand, ...state.dog];
  const newPlayerHand = cardsWithout(cards, ...action.dog);

  if (newPlayerHand.length !== playerHand.length) {
    throw GameErrors.newDogDoesntMatchHand(action.dog, cards);
  }

  const newState: PlayingBoardState = {
    ...state,
    name: GameplayState.Playing,
    dog: action.dog,
    hands: {
      ...state.hands,
      [playerNum]: newPlayerHand,
    },
    current_trick: getNewTrick(state.players, state.players[0], 0),
    past_tricks: [],
  };
  const gameStartedTransition: GameStartTransition = {
    type: "game_started",
    first_player: state.players[0],
    privateTo: undefined,
  };
  const events: PlayerEvent[] = [action, gameStartedTransition];
  const { publicHands } = state;
  if (publicHands) {
    const setDogForObservers: SetDogAction = {
      player: action.player,
      time: action.time,
      type: "set_dog",
      dog: action.dog,
      exclude: state.players,
    };
    events.push(setDogForObservers);
  }
  return { state: newState, events };
};

export const DogRevealGameStateReducer = (
  state: DogRevealAndExchangeBoardState,
  action: DogRevealStateActions
): ReducerResult<DogRevealStates> => {
  switch (action.type) {
    case "declare_slam":
      return declareSlamActionReducer(state, action);
    case "show_trump":
      return showTrumpActionReducer(state, action);
    case "set_dog":
      return handleSetDogAction(state, action);
    default:
      throw GameErrors.invalidActionForGameState(action, state.name);
  }
};
