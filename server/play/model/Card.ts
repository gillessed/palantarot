import pkg from "lodash";

const { isEqual } = pkg;

export type Suit = "S" | "H" | "D" | "C" | "T";

export type RegSuit = "S" | "H" | "D" | "C";

export type RegValue = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "V" | "C" | "D" | "R";

export type TrumpValue =
  | "Joker"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21";

export const AllRs: Card[] = [
  ["C", "R"],
  ["D", "R"],
  ["H", "R"],
  ["S", "R"],
];
export const AllDs: Card[] = [
  ["C", "D"],
  ["D", "D"],
  ["H", "D"],
  ["S", "D"],
];
export const AllCs: Card[] = [
  ["C", "C"],
  ["D", "C"],
  ["H", "C"],
  ["S", "C"],
];
export const AllVs: Card[] = [
  ["C", "V"],
  ["D", "V"],
  ["H", "V"],
  ["S", "V"],
];

export const TheJoker: ["T", "Joker"] = ["T", "Joker"];
export const TheOne: ["T", "1"] = ["T", "1"];
export const The21: ["T", "21"] = ["T", "21"];

export function isBout(card: Card) {
  return isEqual(card, TheJoker) || isEqual(card, TheOne) || isEqual(card, The21);
}

export type RegCard = [RegSuit, RegValue];

export type TrumpCard = ["T", TrumpValue];

export type Card = RegCard | TrumpCard;

export type Bout = typeof TheJoker | typeof TheOne | typeof The21;

export function parseCard(card: string): Card {
  const suit = card[card.length - 1];
  const value = parseInt(card.slice(1, card.length - 1)) || card.slice(1, card.length - 1);
  return [suit, value] as Card;
}

export function toCardString(card: Card): string {
  return `#${card[1] === "Joker" ? "J" : card[1]}${card[0]}`;
}
