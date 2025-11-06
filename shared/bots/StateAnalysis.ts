import pkg from "lodash";
import { type Suit } from "../../server/play/model/Card.ts";
import { AllSuits, createCardsOfSuit, getLeadCard } from "../../server/play/model/CardUtils.ts";
import { getTrickCardList } from "./BotUtils.ts";
import { CardList } from "./CardList.ts";
import type { ClientGame } from "../types/ClientGame.ts";

const { isEqual } = pkg;

export interface StateAnalysis {
  onePlayed: boolean;
  hands: { [key: string]: HandAnalysis };
  suits: { [key: string]: SuitAnalysis };
}

export interface HandAnalysis {
  knownVoids: Set<Suit>;
  highestTrump: number | null;
}

export interface SuitAnalysis {
  playedCards: CardList;
  remainingCards: CardList;
}

export function analyseGameState(clientGame: ClientGame): StateAnalysis {
  const { trick: currentTrick, completedTricks, playerOrder } = clientGame.playState;
  const stateAnalysis: StateAnalysis = {
    onePlayed: false,
    hands: {},
    suits: {},
  };
  for (const player of playerOrder) {
    if (player !== clientGame.playerId) {
      stateAnalysis.hands[player] = {
        knownVoids: new Set(),
        highestTrump: null,
      };
    }
  }
  for (const suit of AllSuits) {
    stateAnalysis.suits[suit] = {
      playedCards: new CardList(),
      remainingCards: new CardList(...createCardsOfSuit(suit)),
    };
  }
  for (const trick of [...completedTricks, currentTrick]) {
    const trickCardList = getTrickCardList(trick);
    const playerList = trick.order;
    const leadCard = getLeadCard(trickCardList);
    let highestTrump: number | null = null;
    for (let i = 0; i < trickCardList.length; i++) {
      const card = trickCardList[i];
      const [cardSuit, cardValue] = card;
      const isOne = cardSuit === "T" && cardValue === "1";
      const isJoker = cardSuit === "T" && cardValue === "Joker";
      stateAnalysis.suits[cardSuit].playedCards.add(card);
      stateAnalysis.suits[cardSuit].remainingCards.remove(card);
      if (isOne) {
        stateAnalysis.onePlayed = true;
      }
      if (cardSuit === "T" && !isJoker) {
        highestTrump = +cardValue;
      }
      if (leadCard && !isEqual(card, leadCard)) {
        if (card[0] !== leadCard[0] && !isJoker) {
          stateAnalysis.hands[playerList[i]].knownVoids.add(leadCard[0]);
          if (card[0] !== "T") {
            stateAnalysis.hands[playerList[i]].knownVoids.add("T");
          }
        }
        if (card[0] === "T" && !isJoker && highestTrump !== null && +card[1] < highestTrump) {
          stateAnalysis.hands[playerList[i]].highestTrump = highestTrump;
        }
      }
    }
  }
  return stateAnalysis;
}
