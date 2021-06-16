
export enum RegSuit {
  Spade = 'S',
  Heart = 'H',
  Diamond = 'D',
  Club = 'C',
}
export type TrumpSuit = 'T'
export const TrumpSuit: TrumpSuit = 'T';

export type Suit = RegSuit.Spade | RegSuit.Heart | RegSuit.Club | RegSuit.Diamond | TrumpSuit

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
  [RegSuit.Club, RegValue.R],
  [RegSuit.Diamond, RegValue.R],
  [RegSuit.Heart, RegValue.R],
  [RegSuit.Spade, RegValue.R],
];
export const AllDs: Card[] = [
  [RegSuit.Club, RegValue.D],
  [RegSuit.Diamond, RegValue.D],
  [RegSuit.Heart, RegValue.D],
  [RegSuit.Spade, RegValue.D],
];
export const AllCs: Card[] = [
  [RegSuit.Club, RegValue.C],
  [RegSuit.Diamond, RegValue.C],
  [RegSuit.Heart, RegValue.C],
  [RegSuit.Spade, RegValue.C],
];
export const AllVs: Card[] = [
  [RegSuit.Club, RegValue.V],
  [RegSuit.Diamond, RegValue.V],
  [RegSuit.Heart, RegValue.V],
  [RegSuit.Spade, RegValue.V],
];

export const TheJoker: [TrumpSuit, TrumpValue.Joker] = [TrumpSuit, TrumpValue.Joker];
export const TheOne: [TrumpSuit, TrumpValue._1] = [TrumpSuit, TrumpValue._1];
export const The21: [TrumpSuit, TrumpValue._21] = [TrumpSuit, TrumpValue._21];

export type RegCard = [RegSuit, RegValue];

export type TrumpCard = [TrumpSuit, TrumpValue];

export type Card = RegCard | TrumpCard

export type Bout = typeof TheJoker | typeof TheOne | typeof The21;

export function parseCard(card: string): Card {
  const suit = card[card.length - 1];
  const value = parseInt(card.slice(1, card.length - 1)) || card.slice(1, card.length - 1);
  return [suit, value] as Card;
}

export function toCardString(card: Card): string {
  return `#${card[1] === "Joker" ? "J" : card[1]}${card[0]}`
}
