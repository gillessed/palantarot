import { type ClientGame } from "../types/ClientGame.ts";
import { type Card } from "../../server/play/model/Card.ts";
import { getArrayRandom, getArrayRandoms, getCardsAllowedToPlay, isBout } from "../../server/play/model/CardUtils.ts";
import { type Bid, type BidValue } from "../../server/play/model/GameState.ts";
import { getNonSelfCalls, getPossibleBidValues } from "./BotUtils.ts";
import { type TarotBot } from "./TarotBot.ts";

export const RandomBotType = "Random Bot";

/**
 * Random bot will do everything randomly. However, there are a few restriction. See each method for more details.
 */
export class RandomBot implements TarotBot {
  type: string = RandomBotType;

  /**
   * Will pick a random bid the bid is weighted towards passing and lower bids. However, it will never declare a slam or bid russian.
   */
  public bid(game: ClientGame): Bid {
    const availableBidValues = getPossibleBidValues(game);
    let bid: BidValue = 0;
    const random = Math.random();
    if (random > 0.95) {
      bid = 160;
    } else if (random > 0.87) {
      bid = 80;
    } else if (random > 0.75) {
      bid = 40;
    } else if (random > 0.6) {
      bid = 20;
    } else if (random > 0.4) {
      bid = 10;
    } else {
      bid = 0;
    }
    if (availableBidValues.indexOf(bid) < 0) {
      bid = 0;
    }
    return { bid, player: game.playerId, calls: [] };
  }

  /**
   * Will pick the partner randomly, from available choices not it its own hand.
   */
  public pickPartner(game: ClientGame): Card {
    const bidSet = getNonSelfCalls(game);
    const finalCard = getArrayRandom(bidSet);
    return finalCard;
  }

  /**
   * Will pick any 6 allowed cards.
   */
  public dropDog(game: ClientGame): Card[] {
    const hand = game.playState.hand;
    const nonTrumpNonKing = hand.filter(([suit, value]) => suit !== "T" && value !== "R");
    const dogCount = game.playState.playerOrder.length === 5 ? 3 : 6;
    if (nonTrumpNonKing.length === 0) {
      const nonBoutNonKing = hand.filter((c) => !isBout(c) && c[1] !== "R");
      return getArrayRandoms(nonBoutNonKing, dogCount);
    } else {
      return getArrayRandoms(nonTrumpNonKing, dogCount);
    }
  }

  /**
   * Will play any card that is possible.
   */
  public playCard(game: ClientGame): Card {
    const { hand, trick, anyPlayerPlayedCard, partnerCard } = game.playState;
    const trickCards = trick.order.map((playerId) => trick.cards.get(playerId)).filter((c) => c) as Card[];
    const cards = getCardsAllowedToPlay(hand, trickCards, !!anyPlayerPlayedCard, partnerCard);
    const finalCard = getArrayRandom(cards);

    return finalCard;
  }
}
