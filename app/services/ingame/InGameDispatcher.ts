import { Store } from 'redux';
import { Action, PlayerId } from '../../play/common';
import { ReduxState } from '../rootReducer';
import { DebugInGameActions, InGameActions } from './InGameActions';
import { PlayDispatcher } from './PlayDispatcher';

export class InGameDispatcher {
  constructor(
    private readonly store: Store<ReduxState>,
  ) {}

  // Game Actions

  public joinGame(player: PlayerId, game: string) {
    this.store.dispatch(InGameActions.joinGame({ player, game }));
  }

  public playAction(action: Action, debug?: boolean) {
    debug
      ? this.store.dispatch(DebugInGameActions.debugPlayAction(action))
      : this.store.dispatch(InGameActions.playAction(action));
  }

  public actionError(error: Error) {
    this.store.dispatch(InGameActions.playError(error.message));
  }

  public exitGame() {
    this.store.dispatch(InGameActions.exitGame());
  }

  public play(player: string, debug?: boolean) {
    return new PlayDispatcher(this, player, debug);
  }

  // Debug

  public debugJoinGame(player: PlayerId, game: string) {
    this.store.dispatch(DebugInGameActions.debugJoinGame({ player, game }));
  }

  public debugPlayAction(action: Action) {
    this.store.dispatch(DebugInGameActions.debugPlayAction(action));
  }

  public autoplay() {
    this.store.dispatch(DebugInGameActions.autoplay());
  }
}