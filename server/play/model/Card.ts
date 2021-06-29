export enum Suit {
  Spade = 'S',
  Heart = 'H',
  Diamond = 'D',
  Club = 'C',
  Trump = 'T',
}

export type RegSuit = Suit.Spade | Suit.Heart | Suit.Club | Suit.Diamond;

export enum RegValue {
  _1 = 1,
  _2 = 2,
  _3 = 3,
  _4 = 4,
  _5 = 5,
  _6 = 6,
  _7 = 7,
  _8 = 8,
  _9 = 9,
  _10 = 10,
  V = 'V',
  C = 'C',
  D = 'D',
  R = 'R',
}

export enum TrumpValue {
  Joker = 'Joker',
  _1 = 1,
  _2 = 2,
  _3 = 3,
  _4 = 4,
  _5 = 5,
  _6 = 6,
  _7 = 7,
  _8 = 8,
  _9 = 9,
  _10 = 10,
  _11 = 11,
  _12 = 12,
  _13 = 13,
  _14 = 14,
  _15 = 15,
  _16 = 16,
  _17 = 17,
  _18 = 18,
  _19 = 19,
  _20 = 20,
  _21 = 21,
}

export const AllRs: Card[] = [
  [Suit.Club, RegValue.R],
  [Suit.Diamond, RegValue.R],
  [Suit.Heart, RegValue.R],
  [Suit.Spade, RegValue.R],
];
export const AllDs: Card[] = [
  [Suit.Club, RegValue.D],
  [Suit.Diamond, RegValue.D],
  [Suit.Heart, RegValue.D],
  [Suit.Spade, RegValue.D],
];
export const AllCs: Card[] = [
  [Suit.Club, RegValue.C],
  [Suit.Diamond, RegValue.C],
  [Suit.Heart, RegValue.C],
  [Suit.Spade, RegValue.C],
];
export const AllVs: Card[] = [
  [Suit.Club, RegValue.V],
  [Suit.Diamond, RegValue.V],
  [Suit.Heart, RegValue.V],
  [Suit.Spade, RegValue.V],
];

export const TheJoker: [Suit.Trump, TrumpValue.Joker] = [Suit.Trump, TrumpValue.Joker];
export const TheOne: [Suit.Trump, TrumpValue._1] = [Suit.Trump, TrumpValue._1];
export const The21: [Suit.Trump, TrumpValue._21] = [Suit.Trump, TrumpValue._21];

export type RegCard = [RegSuit, RegValue];

export type TrumpCard = [Suit.Trump, TrumpValue];

export type Card = RegCard | TrumpCard;

export type Bout = typeof TheJoker | typeof TheOne | typeof The21;

export function parseCard(card: string): Card {
  const suit = card[card.length - 1];
  const value = parseInt(card.slice(1, card.length - 1)) || card.slice(1, card.length - 1);
  return [suit, value] as Card;
}

export function toCardString(card: Card): string {
  return `#${card[1] === "Joker" ? "J" : card[1]}${card[0]}`
}
