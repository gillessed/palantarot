import type { Card } from "../../server/play/model/Card";
import { SuitMap } from "./SuitMap";

export function getCardUrl(card: Card) {
  const [suit, number] = card;
  return `/images/cards/${SuitMap[suit]} ${number}.png`;
}

export const CardBackUrls = {
  Red: "/images/cards/Card Back Red.png",
  Green: "/images/cards/Card Back Green.png",
  Blue: "/images/cards/Card Back Blue.png",
  Black: "/images/cards/Card Back Black.png",
};
