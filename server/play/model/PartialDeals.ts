import { RegValue, Suit } from './Card';
import { DealtCards } from './CardUtils';


const FourKings: DealtCards = {
  hands: [[
    [Suit.Club, RegValue.R],
    [Suit.Diamond, RegValue.R],
    [Suit.Heart, RegValue.R],
    [Suit.Spade, RegValue.R],
  ]],
  dog: [],
}

export const PartialDeals = {
  FourKings,
};
