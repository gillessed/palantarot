import { ReduxState } from '../rootReducer';
import { ClientRoom } from './RoomTypes';

const getRoom = (state: ReduxState): ClientRoom | null => {
  return state.room;
}

const getAutoplay = (state: ReduxState) => {
  return getRoom(state)?.autoplay;
}

const getAutopass = (state: ReduxState) => {
  return getRoom(state)?.autopass;
}

export const RoomSelectors = {
  getRoom,
  getAutoplay,
  getAutopass,
}
