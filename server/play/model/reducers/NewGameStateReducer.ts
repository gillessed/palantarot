import _ from "lodash";
import { Card } from "../Card";
import { dealCards } from '../CardUtils';
import { GameErrors } from '../GameErrors';
import { DealtHandTransition, EnterGameAction, LeaveGameAction, PlayerEvent, PlayerNotReadyAction, PlayerReadyAction, PlayersSetTransition, ShowDogToObservers } from "../GameEvents";
import { BiddingBoardState, BidValue, DummyPlayer, GameplayState, NewGameActions, NewGameBoardState, NewGameStates, ReducerResult } from "../GameState";
import { simpleResult } from './CommonReducers';

const handleEnterGameAction = (state: NewGameBoardState, action: EnterGameAction): ReducerResult<NewGameStates> => {
  if (state.players.indexOf(action.player) >= 0) {
    throw GameErrors.actionAlreadyHappened(action, state.players);
  }
  if (state.players.length > 5) {
    throw GameErrors.tooManyPlayers(action.player, state.players);
  }
  const newState: NewGameBoardState = {
    ...state,
    players: [...state.players, action.player],
  };
  return simpleResult(newState, action);
}

const handleLeaveGameAction = (state: NewGameBoardState, action: LeaveGameAction): ReducerResult<NewGameStates> => {
  if (state.players.indexOf(action.player) < 0) {
    throw GameErrors.playerNotInGame(action.player, state.players);
  }
  if (state.ready.indexOf(action.player) >= 0) {
    throw GameErrors.playerMarkedReady(action.player);
  }
  const newState: NewGameBoardState = {
    ...state,
    players: _.without(state.players, action.player),
  };
  return simpleResult(newState, action); 
}

const handleMarkPlayerReadyAction = (state: NewGameBoardState, action: PlayerReadyAction): ReducerResult<NewGameStates> => {
  if (state.ready.indexOf(action.player) >= 0) {
    throw GameErrors.actionAlreadyHappened(action, state.ready)
  } 
  if (state.players.indexOf(action.player) < 0) {
    throw GameErrors.playerNotInGame(action.player, state.players);
  }
  if (state.ready.length + 1 !== state.players.length || state.players.length < 3) {
    const newState: NewGameBoardState = {
      ...state,
      ready: [...state.ready, action.player],
    };
    return simpleResult(newState, action);
  } else {
    const { publicHands } = state;
    const { dog, hands } = dealCards(state.players.length);
    const playerOrder = _.shuffle(state.players);

    // For debugging shows - give player Greg Cole a hand that can show.
    // const { dog, hands } = SampleDeal;
    // const playerOrder = _.shuffle(_.without(state.players, "Greg Cole"));
    // playerOrder.push("Greg Cole");

    const bidState: BiddingBoardState = {
      publicHands: state.publicHands,
      name: GameplayState.Bidding,
      players: playerOrder,
      hands,
      dog,
      bidding: {
        bids: [],
        bidders: playerOrder,
        current_high: {
          player: DummyPlayer,
          bid: BidValue.PASS,
          calls: []
        },
      },
      shows: [],
    };

    const setPlayersTransition: PlayersSetTransition = {
      type: 'players_set',
      playerOrder,
      privateTo: undefined,
    };

    const dealTransitions: DealtHandTransition[] = _.map(hands).map((hand: Card[], player: number) => {
      const transition: DealtHandTransition = {
        type: 'dealt_hand',
        hand,
        privateTo: undefined,
        playerId: playerOrder[player],
      };
      if (state.publicHands) {
        const exclude = [...playerOrder];
        exclude.splice(player, 1);
        return { ...transition, exclude };
      } else {
        return {
          ...transition,
          privateTo: playerOrder[player],
        };
      }
    })

    const events: PlayerEvent[] = [
      action,
      setPlayersTransition,
      ...dealTransitions,
    ];

    if (publicHands) {
      const showDogEvent: ShowDogToObservers = {
        type: 'show_dog_to_observers',
        dog,
        exclude: state.players,
      };
      events.push(showDogEvent);
    }
    return { state: bidState, events };
  }
}

export const handleUnmarkPlayerReadyAction = (state: NewGameBoardState, action: PlayerNotReadyAction): ReducerResult<NewGameStates> => {
  if (state.players.indexOf(action.player) < 0) {
    throw GameErrors.playerNotInGame(action.player, state.players);
  } 
  if (state.ready.indexOf(action.player) < 0) {
    throw GameErrors.playerNotReady(action.player, state.ready);
  } 
  const newState: NewGameBoardState = {
    ...state,
    ready: _.without(state.ready, action.player),
  };
  return simpleResult(newState, action);
}

export const NewGameStateReducer = (state: NewGameBoardState, action: NewGameActions): ReducerResult<NewGameStates> => {
  switch (action.type) {
    case 'enter_game': return handleEnterGameAction(state, action);
    case 'leave_game': return handleLeaveGameAction(state, action);
    case 'mark_player_ready': return handleMarkPlayerReadyAction(state, action);
    case 'unmark_player_ready': return handleUnmarkPlayerReadyAction(state, action);
    default: throw GameErrors.invalidActionForGameState(action, state.name);
  }
};
