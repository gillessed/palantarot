import { ReduxState } from '../rootReducer';

export const getGamePlayer = (state: ReduxState) => {
  return state.gamePlayer;
};
