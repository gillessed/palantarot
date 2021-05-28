import { getArrayRandom, getArrayRandoms, getCardsAllowedToPlay, isBout } from "../app/play/cardUtils";
import { Bid, Card, RegValue, TrumpSuit } from "../app/play/common";
import { InGameState } from "../app/services/ingame/InGameTypes";
import { getNonSelfCalls, getPossibleBidValues } from './BotUtils';
import { TarotBot } from "./TarotBot";

export const RandomBotType = 'Random Bot';

/**
 * Random bot will do everything randomly. However, there are a few restriction. See each method for more details.
 */
export class RandomBot implements TarotBot {
  type: string = RandomBotType;

  /**
   * Will pick a random bid uniformly spread across passing and bid choices. However, it will never declare a slam or bid russian.
   */
  public bid(gameState: InGameState): Bid {
    const availableBidValues = getPossibleBidValues(gameState);
    const bidValue = getArrayRandom(availableBidValues);
    return { bid: bidValue, player: gameState.player, calls: [] };
  }
  
  /**
   * Will pick the partner randomly, from available choices not it its own hand.
   */
  public pickPartner(gameState: InGameState): Card {
    const bidSet = getNonSelfCalls(gameState);
    const finalCard = getArrayRandom(bidSet);
    return finalCard;
  }

  /**
   * Will pick any 6 allowed cards.
   */
  public dropDog(gameState: InGameState): Card[] {
    const hand = gameState.state.hand;
    const nonTrumpNonKing = hand.filter(([suit, value]) => suit !== TrumpSuit && value !== RegValue.R);
    const dogCount = gameState.state.playerOrder.length === 5 ? 3 : 6;
    if (nonTrumpNonKing.length === 0) {
      const nonBoutNonKing = hand.filter((c) => !isBout(c) && c[1] !== RegValue.R);
      return getArrayRandoms(nonBoutNonKing, dogCount);
    } else {
      return getArrayRandoms(nonTrumpNonKing, dogCount);
    }
  }

  /**
   * Will play any card that is possible.
   */
  public playCard(gameState: InGameState): Card {
    const { hand, trick, anyPlayerPlayedCard, partnerCard } = gameState.state;
    const trickCards = trick.order.map((playerId) => trick.cards.get(playerId)).filter((c) => c) as Card[];
    const cards = getCardsAllowedToPlay(hand, trickCards, !!anyPlayerPlayedCard, partnerCard);
    const finalCard = getArrayRandom(cards);

    return finalCard;
  }
}
