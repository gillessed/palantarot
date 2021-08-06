import { PlayerEvent } from '../server/play/model/GameEvents';
import { BoardState, PlayingBoardState } from '../server/play/model/GameState';
import {
  buildGameStateReducer,
  GameReducerMap,
} from '../server/play/model/reducers/GameStateReducers';

export class RandomPlayout {
  private reducers: GameReducerMap = buildGameStateReducer();
  public state: BoardState;
  constructor(state: PlayingBoardState) {
    this.state = state;
  }

  public doAction(event: PlayerEvent) {
    const reducer = this.reducers[this.state.name];
    const { state: newState } = reducer(this.state, event);
    this.state = newState;
  }
}
