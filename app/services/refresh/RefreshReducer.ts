import { TypedReducer } from 'redoodle';
import { RefreshState, InitialRefreshState, RefreshActions } from './RefreshTypes';

export const refreshReducer = TypedReducer.builder<RefreshState>()
  .withDefaultHandler((state = InitialRefreshState) => state)
  .withHandler(RefreshActions.increment.TYPE, (state) => {
    return {
      refreshCounter: state.refreshCounter + 1,
    };
  })
  .build();
