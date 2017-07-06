import { push } from 'react-router-redux';
import { Store } from 'redux';
import { ReduxState } from '../rootReducer';
export class NavigationDispatcher {
  constructor(public readonly store: Store<ReduxState>) {}

  public push(path: string) {
    this.store.dispatch(push(path));
  }
}