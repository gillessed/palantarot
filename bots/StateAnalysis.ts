import _ from "lodash";
import { ClientGame } from "../app/services/room/ClientGame";
import { Suit, TrumpSuit, TrumpValue } from "../server/play/model/Card";
import { AllSuits, createCardsOfSuit, getLeadCard } from "../server/play/model/CardUtils";
import { getTrickCardList } from "./BotUtils";
import { CardList } from "./CardList";

export interface StateAnalysis {
  onePlayed: boolean;
  hands: { [key: string]: HandAnalysis};
  suits: { [key: string]: SuitAnalysis};
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
  }
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
      const isOne = cardSuit === TrumpSuit && cardValue === TrumpValue._1;
      const isJoker = cardSuit === TrumpSuit && cardValue === TrumpValue.Joker;
      stateAnalysis.suits[cardSuit].playedCards.add(card);
      stateAnalysis.suits[cardSuit].remainingCards.remove(card);
      if (isOne) {
        stateAnalysis.onePlayed = true;
      }
      if (cardSuit === TrumpSuit && !isJoker) {
        highestTrump = +cardValue;
      }
      if (leadCard && !_.isEqual(card, leadCard)) {
        if (card[0] !== leadCard[0] && !isJoker) {
          stateAnalysis.hands[playerList[i]].knownVoids.add(leadCard[0]);
          if (card[0] !== TrumpSuit) {
            stateAnalysis.hands[playerList[i]].knownVoids.add(TrumpSuit);
          }
        }
        if (card[0] === TrumpSuit && !isJoker && highestTrump !== null && (+card[1]) < highestTrump) {
          stateAnalysis.hands[playerList[i]].highestTrump = highestTrump;
        }
      }
    }
  }
  return stateAnalysis;
}
