import { type Bid, type PlayerId } from "../GameState.ts";

export const getTrickPlayerOrder = (players: PlayerId[], firstPlayer: PlayerId) => {
  const trickOrder = [...players];
  while (trickOrder[0] !== firstPlayer) {
    trickOrder.push(trickOrder.shift() as PlayerId);
  }
  return trickOrder;
};

export const getNewTrick = (players: PlayerId[], first_player: PlayerId, trick_num: number) => ({
  trick_num,
  cards: [],
  players: getTrickPlayerOrder(players, first_player),
  current_player: 0,
});

export const getStringForBid = (bid: Bid) => {
  if (bid.calls.indexOf("russian") >= 0) {
    return `bid Russian ${bid.bid}`;
  } else if (bid.bid === 0) {
    return "passed";
  } else return `bid ${bid.bid}`;
};
