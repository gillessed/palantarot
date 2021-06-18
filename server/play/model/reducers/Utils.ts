import { PlayerId } from "../GameEvents";

export const getTrickPlayerOrder = (players: PlayerId[], firstPlayer: PlayerId) => {
  const trickOrder = [...players];
  while (trickOrder[0] !== firstPlayer) {
    trickOrder.push(trickOrder.shift() as PlayerId)
  }
  return trickOrder;
};


export const getNewTrick = (players: PlayerId[], first_player: PlayerId, trick_num: number) => ({
    trick_num,
    cards: [],
    players: getTrickPlayerOrder(players, first_player),
    current_player: 0,
});
