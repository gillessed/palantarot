import {Store} from 'redux';
import {ReduxState} from '../rootReducer';
import {GamePlayerActions} from './GamePlayerActions';
import {GamePlayer} from './GamePlayerTypes';

export class GamePlayerDispatcher {
  constructor(private readonly store: Store<ReduxState>) {}

  public set(gamePlayer: GamePlayer | null) {
    this.store.dispatch(GamePlayerActions.set(gamePlayer));
  }
}
