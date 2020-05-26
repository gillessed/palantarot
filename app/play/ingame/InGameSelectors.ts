import { defaultMemoize } from 'reselect';
import { InGameState } from './InGameService';

const isParticipant = (state: InGameState) => {
  return state.state.player_order.indexOf(state.player) >= 0;
}

const getRotatedPlayerOrder = defaultMemoize((game: InGameState) => {
  const playState = game.state;
  const isParticpant = InGameSelectors.isParticipant(game);
  const playerOrder = playState.player_order;
  if (!isParticpant || playerOrder.length === 0) {
    return playerOrder;
  }
  const startIndex = playerOrder.indexOf(game.player);
  return [
    ...playerOrder.slice(startIndex, playerOrder.length - 1),
    ...playerOrder.slice(0, startIndex),
  ];
});

export const InGameSelectors = {
  isParticipant,
  getRotatedPlayerOrder,
};
