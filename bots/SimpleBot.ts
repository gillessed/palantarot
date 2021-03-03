import _ from 'lodash';
import { CardList } from '../app/play/CardList';
import { cardsWithout, getLeadCard, getTrumps, RegSuits } from "../app/play/cardUtils";
import { Bid, BidValue, Call, Card, RegSuit, RegValue, TrumpSuit, TrumpValue } from "../app/play/common";
import { InGameState } from "../app/services/ingame/InGameTypes";
import { dropValueSortComparator, getNonSelfCalls, getTrickCardList, lambdaMin } from "./BotUtils";
import { RandomBot } from './RandomBot';
import { analyseGameState } from "./StateAnalysis";
import { TarotBot } from "./TarotBot";

export const SimpleBotType = 'Simple Bot';

/**
 * This bot has some very simple heuristics on what to bid, drop and play.
 * This only plays 5 players. If it is in a 3 or 4 player game, it will revert to random bot.
 */
export class SimpleBot implements TarotBot {
  type: string = SimpleBotType;
  private randomBot = new RandomBot();

  /**
   * Simple bid heuristics. [5 player only]
   * 160 -> 3 bout 7 trump; 2 bout, 8 trump; 1 bout, 10 trump; 13 trump | each void or king counts as trump, having the one and no void is -1 trump
   *        [R20] corresponding russian with 21, or a 40 hand without the 1, or a 40 hand with 1 and void
   * 80 -> 160 bid, but 1 less trump each
   * 40 -> 3 bout, 4 trump; 2 bout, 6 trump; 1 bout, 9 trump; 11 trump | kings count as trump
   *        [R20] ten hand, with a king
   * R20 -> any hand that doesn't qualify for the above
   * 20 -> 40 bid, but 1 less trump each
   * 10 -> 1 bout, 6 trump; 1 bout, five trump and a king; 8 trump;
   */
  public bid(gameState: InGameState): Bid {
    if (gameState.state.playerOrder.length < 5) {
      return this.randomBot.bid(gameState);
    }
    const { state, player } = gameState;
    const { hand } = state;
    const maxBid = Math.max(...[...state.playerBids.values()].map((bid) => bid.bid));
    const russianOnTable = !![...state.playerBids.values()].find((bid) => bid.calls.indexOf(Call.RUSSIAN) >= 0);

    const hasOne = hand.find((c) => _.isEqual(c, [TrumpSuit, TrumpValue._1]));
    const hasJoker = hand.find((c) => _.isEqual(c, [TrumpSuit, TrumpValue.Joker]));
    const hasTwentyOne = hand.find((c) => _.isEqual(c, [TrumpSuit, TrumpValue._21]));
    const kingCount = hand.filter(([_, value]) => value === RegValue.R).length;
    const boutCount = [hasOne, hasJoker, hasTwentyOne].reduce((acc, b) => b ? acc : acc + 1, 0);
    const voidCount = [RegSuit.Club, RegSuit.Diamond, RegSuit.Heart, RegSuit.Spade]
      .map((voidSuit) => hand.filter(([suit, _]) => suit === voidSuit).length)
      .reduce((acc, s) => s === 0 ? acc + 1 : acc, 0);
    const trumps = getTrumps(hand);
    const trumpCount = trumps.length;
    const trumpKingCount = kingCount + trumpCount;
    const trumpKingVoidCount = trumpKingCount + voidCount;
    const countWithVoidSmudge = trumpKingVoidCount - (hasOne && voidCount === 0 ? 1 : 0);
    const hasRussian = kingCount >= 2 && boutCount >= 1;
    let bidValue: BidValue = BidValue.PASS;

    const bid160 = (
      (boutCount === 3 && countWithVoidSmudge >= 7) ||
      (boutCount === 2 && countWithVoidSmudge >= 8) ||
      (boutCount === 1 && countWithVoidSmudge >= 10) ||
      (boutCount === 0 && countWithVoidSmudge >= 13)
    );
    const bid80 = (
      (boutCount === 3 && countWithVoidSmudge >= 6) ||
      (boutCount === 2 && countWithVoidSmudge >= 7) ||
      (boutCount === 1 && countWithVoidSmudge >= 9) ||
      (boutCount === 0 && countWithVoidSmudge >= 12)
    );
    const bid40 = (
      (boutCount === 3 && trumpCount >= 4) ||
      (boutCount === 2 && trumpKingCount >= 6) ||
      (boutCount === 1 && trumpKingCount >= 9) ||
      (boutCount === 0 && trumpKingCount >= 11)
    );
    const bidRussian = hasRussian;
    const bid20 = (
      (boutCount === 3 && trumpCount >= 3) ||
      (boutCount === 2 && trumpKingCount >= 5) ||
      (boutCount === 1 && trumpKingCount >= 8) ||
      (boutCount === 0 && trumpKingCount >= 10)
    );
    const bid10 = (
      (boutCount === 1 && trumpCount >= 6) ||
      (boutCount === 1 && trumpCount >= 5 && kingCount >= 1) ||
      (boutCount === 0 && trumpCount >= 8)
    );

    const bid160r = (
      (bid160) ||
      (bid80) ||
      (bid40 && !hasOne) ||
      (hasRussian && hasTwentyOne)
    );

    const bid40r = (
      (bid40 && hasOne) ||
      (bid20) ||
      (bid10 && kingCount >= 1)
    );

    if (russianOnTable) {
      if (bid160r) {
        bidValue = BidValue.ONESIXTY;
      } else if (BidValue.FORTY > maxBid && bid40r) {
        bidValue = BidValue.FORTY;
      }
    } else {
      if (bid160) {
        bidValue = BidValue.ONESIXTY;
      } else if (BidValue.EIGHTY > maxBid && bid80) {
        bidValue = BidValue.EIGHTY;
      } else if (BidValue.FORTY > maxBid && bid40) {
        bidValue = BidValue.FORTY;
      } else if (BidValue.TWENTY > maxBid && bidRussian) {
        return { bid: BidValue.TWENTY, player, calls: [Call.RUSSIAN] };
      } else if (BidValue.TWENTY > maxBid) {
        bidValue = BidValue.TWENTY;
      } else if (BidValue.TEN > maxBid && bid10) {
        bidValue = BidValue.TEN;
      }
    }

    return { bid: bidValue, player, calls: [] };
  }

  /**
   * Simple bot picks its longest suit as its partner suit. If there is a tie, it is randomly broken. It will never call itself on purpose.
   */
  public pickPartner(gameState: InGameState): Card {
    const { hand } = gameState.state;
    const bidSet = getNonSelfCalls(gameState);
    const suitLengths: [number, RegSuit][] = bidSet.map(([callSuit, _]) => {
      const suitLength = hand.filter(([suit, _]) => suit === callSuit).length;
      return [suitLength, callSuit as RegSuit];
    });
    const finalSuit: RegSuit = suitLengths.reduce(([maxLength, maxSuit], [suitLength, suit]) => suitLength >= maxLength ? [suitLength, suit] : [maxLength, maxSuit])[1];
    const finalCard = bidSet.filter(([suit, _]) => finalSuit === suit)[0];
    return finalCard;
  }

  /**
   * Simple bot prioritizes dropping for a void first, then dropping its highest face cards.
   */
  public dropDog(gameState: InGameState): Card[] {
    if (gameState.state.playerOrder.length < 5) {
      return this.randomBot.dropDog(gameState);
    }

    const { state } = gameState;
    const { hand } = state;
    let unDroppedHand = [...hand];
    const dogCards: Card[] = [];
    const partnerCard = gameState.state.partnerCard;
    if (!partnerCard) {
      return this.randomBot.dropDog(gameState);
    }
    const partnerSuit = partnerCard[0];

    const suitCount = [RegSuit.Club, RegSuit.Diamond, RegSuit.Heart, RegSuit.Spade]
      .map((voidSuit) => [voidSuit, hand.filter(([suit, _]) => suit === voidSuit).length])
      .filter(([pSuit, _]) => pSuit !== partnerSuit) as [RegSuit, number][];
    const shortestSuit = lambdaMin(([_, count]) => count, ...suitCount)[0];
    
    if (shortestSuit.length > 0 && shortestSuit.length <= 3) {
      const cardsOfShortSuit = hand.filter(([suit, _]) => suit === shortestSuit);
      dogCards.push(...cardsOfShortSuit);
      unDroppedHand = cardsWithout(unDroppedHand, ...cardsOfShortSuit);
    }

    unDroppedHand.sort(dropValueSortComparator);
    while (dogCards.length < 3) {
      const card = unDroppedHand.pop();
      if (!card) {
        throw Error('How did you get here?');
      }
      dogCards.push(card);
    }
    return dogCards;
  }

  /**
   * - If has joker, and second to last trick, player joker
   * if leading
   *   - picking emptiest non-king suit
   *   - lead king of fullest king suit
   *   - lead lowest trump
   *   - lead random
   * else 
   *   - see if any determination can be made on who can win the trick after you
   *   - if you can win, win
   *   - if your team wins, feed
   *   - dump
   */
  public playCard(gameState: InGameState): Card {
    if (gameState.state.playerOrder.length < 5) {
      return this.randomBot.playCard(gameState);
    }
    const { state } = gameState;
    const { hand, trick: currentTrick, completedTricks } = state;

    const handList = new CardList(...hand);

    const trickCardList = getTrickCardList(currentTrick);
    const leadCard = getLeadCard(trickCardList);
    const stateAnalysis = analyseGameState(gameState);
    const hasJoker = !!hand.find(([s, v]) => s === TrumpSuit && v === TrumpValue.Joker);
    const has1 = !!hand.find(([s, v]) => s === TrumpSuit && v === TrumpValue._1);
    const has21 = !!hand.find(([s, v]) => s === TrumpSuit && v === TrumpValue._21);

    const suitRemaining: [RegSuit, number, boolean][] = RegSuits.map((suit) => {
      const remaining = stateAnalysis.suits[suit].remainingCards.size() - handList.suitFilter(suit).size();
      const hasKing = handList.has([suit, RegValue.R]);
      return [suit, remaining, hasKing];
    });
    // const emptiestNonKingSuit: [RegSuit, number, boolean] | null = suitRemaining
    //   .filter(([suit, remaining, hasKing]) => !hasKing)
    //   .reduce((result, next) => {
    //     if (!result) {
    //       return next;
    //     }
    //     const [resultSuit, resultRemaining] = result;
    //     const [nextSuit, nextRemaining] = next;
    //     if (resultRemaining < nextRemaining) {
    //       return result;
    //     } else {
    //       return next;
    //     }
    //   }, null);

    if (completedTricks.length === 13 && hasJoker) {
      return [TrumpSuit, TrumpValue.Joker];
    }
    if (leadCard) {
      // Bot to follow suit
    } else {
      // Bot to lead new suit
      if (has21 && !has1 && !stateAnalysis.onePlayed) {
        return [TrumpSuit, TrumpValue._21];
      }
      
    }

    // const { hand, trick } = gameState.state;
    // const trickCards = trick.order.map((playerId) => trick.cards.get(playerId)).filter((c) => c) as Card[];
    // const cards = getCardsAllowedToPlay(hand, trickCards);
    // const finalCard = getArrayRandom(cards);

    // return finalCard;

    return this.randomBot.playCard(gameState);
  }
}
