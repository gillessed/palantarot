import { ReduxState } from '../rootReducer';
import { ClientRoom } from './RoomTypes';

const getRoom = (state: ReduxState): ClientRoom | null => {
  return state.room;
}

const getAutoplay = (state: ReduxState) => {
  return getRoom(state)?.autoplay;
}

export const RoomSelectors = {
  getRoom,
  getAutoplay,
}
