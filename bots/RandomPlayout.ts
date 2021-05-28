import { PlayerEvent } from "../app/play/common";
import { buildReducer, ReducerMap } from "../app/play/server";
import { BoardState, PlayingBoardState } from "../app/play/state";
import { RandomBot } from "../bots/RandomBot";

export class RandomPlayout {
  private reducers: ReducerMap = buildReducer();
  public state: BoardState;
  constructor(state: PlayingBoardState) {
    this.state = state;
  }

  public doAction(event: PlayerEvent) {
    const reducer = this.reducers[this.state.name];
    const [newState] = reducer(this.state, event);
    this.state = newState;
  }
}

export function randomPlayout(state: PlayingBoardState) {
  const game = new RandomPlayout(state);
  const randomBot = new RandomBot();
}
