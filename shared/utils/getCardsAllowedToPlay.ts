import { Card, TheJoker } from "../../server/play/model/Card";
import { getLeadSuit } from "./getLeadSuit";
import { getLowestAllowableTrump } from "./getLowestAllowableTrump";
import { isCardEqual } from "./isCardEqual";

export function getCardsAllowedToPlay(
  trick: readonly Card[],
  hand: readonly Card[],
  anyPlayerPlayedCard: boolean,
  partnerCard: Card | undefined,
): readonly Card[] {
  const leadsuit = getLeadSuit(trick);
  if (leadsuit === undefined) {
    if (!anyPlayerPlayedCard) {
      return hand.filter(
        (card) =>
          card[0] !== (partnerCard ?? [])[0] || isCardEqual(card, partnerCard),
      ); // lead anything that isn't the partner suit or is the called card
    } else {
      return hand; // new trick, lead whatever
    }
  }

  const joker = hand.filter((card) => isCardEqual(card, TheJoker));
  const handInSuit = hand.filter((card) => card[0] === leadsuit);
  if (leadsuit !== "T" && handInSuit.length > 0) {
    return [...handInSuit, ...joker]; // can follow non-trump suit
  }

  const lowest_allowed = getLowestAllowableTrump(trick);
  const allowedTrump = hand.filter(
    (card) =>
      card[0] === "T" && card[1] !== "Joker" && card[1] >= lowest_allowed,
  );
  if (allowedTrump.length > 0) {
    return [...allowedTrump, ...joker]; // can over-trump
  }
  const trump = hand.filter((card) => card[0] === "T" && card[1] !== "Joker");
  if (trump.length > 0) {
    return [...trump, ...joker]; // need to play some trump
  } else {
    return hand; // play whatever
  }
}
