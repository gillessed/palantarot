import type { Suit } from "../../server/play/model/Card";

export const SuitMap: Record<Suit, string> = {
  ["T"]: "Trump",
  ["C"]: "Club",
  ["D"]: "Diamond",
  ["H"]: "Heart",
  ["S"]: "Spade",
};
