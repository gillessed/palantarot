import { isEqual } from 'lodash';
import { ClientGame } from '../app/services/room/ClientGame';
import {
  Card,
  RegValue,
  Suit,
  The21,
  TheJoker,
  TrumpValue,
} from '../server/play/model/Card';
import {
  cardsWithout,
  getCardValueAsNumber,
  getLeadCard,
  getTrumps,
  RegSuits,
} from '../server/play/model/CardUtils';
import { Bid, BidValue, Call } from '../server/play/model/GameState';
import {
  dropValueSortComparator,
  getNonSelfCalls,
  getTrickCardList,
  lambdaMin,
} from './BotUtils';
import { CardList } from './CardList';
import { RandomBot } from './RandomBot';
import { analyseGameState } from './StateAnalysis';
import { TarotBot } from './TarotBot';

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
  public bid(game: ClientGame): Bid {
    if (game.playState.playerOrder.length < 5) {
      return this.randomBot.bid(game);
    }
    const { playState, playerId } = game;
    const { hand } = playState;
    const maxBid = Math.max(
      ...[ ...playState.playerBids.values() ].map(bid => bid.bid)
    );
    const russianOnTable = !![ ...playState.playerBids.values() ].find(
      bid => bid.calls.indexOf(Call.RUSSIAN) >= 0
    );

    const hasOne = hand.find(c => isEqual(c, [ Suit.Trump, TrumpValue._1 ]));
    const hasJoker = hand.find(c => isEqual(c, [ Suit.Trump, TrumpValue.Joker ]));
    const hasTwentyOne = hand.find(c =>
      isEqual(c, [ Suit.Trump, TrumpValue._21 ])
    );
    const kingCount = hand.filter(([ _, value ]) => value === RegValue.R).length;
    const boutCount = [ hasOne, hasJoker, hasTwentyOne ].reduce(
      (acc, b) => (b ? acc : acc + 1),
      0
    );
    const voidCount = [ Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade ]
      .map(voidSuit => hand.filter(([ suit, _ ]) => suit === voidSuit).length)
      .reduce((acc, s) => (s === 0 ? acc + 1 : acc), 0);
    const trumps = getTrumps(hand);
    const trumpCount = trumps.length;
    const trumpKingCount = kingCount + trumpCount;
    const trumpKingVoidCount = trumpKingCount + voidCount;
    const countWithVoidSmudge =
      trumpKingVoidCount - (hasOne && voidCount === 0 ? 1 : 0);
    const hasRussian = kingCount >= 2 && boutCount >= 1;
    let bidValue: BidValue = BidValue.PASS;

    const bid160 =
      (boutCount === 3 && countWithVoidSmudge >= 7) ||
      (boutCount === 2 && countWithVoidSmudge >= 8) ||
      (boutCount === 1 && countWithVoidSmudge >= 10) ||
      (boutCount === 0 && countWithVoidSmudge >= 13);
    const bid80 =
      (boutCount === 3 && countWithVoidSmudge >= 6) ||
      (boutCount === 2 && countWithVoidSmudge >= 7) ||
      (boutCount === 1 && countWithVoidSmudge >= 9) ||
      (boutCount === 0 && countWithVoidSmudge >= 12);
    const bid40 =
      (boutCount === 3 && trumpCount >= 4) ||
      (boutCount === 2 && trumpKingCount >= 6) ||
      (boutCount === 1 && trumpKingCount >= 9) ||
      (boutCount === 0 && trumpKingCount >= 11);
    const bidRussian = hasRussian;
    const bid20 =
      (boutCount === 3 && trumpCount >= 3) ||
      (boutCount === 2 && trumpKingCount >= 5) ||
      (boutCount === 1 && trumpKingCount >= 8) ||
      (boutCount === 0 && trumpKingCount >= 10);
    const bid10 =
      (boutCount === 1 && trumpCount >= 6) ||
      (boutCount === 1 && trumpCount >= 5 && kingCount >= 1) ||
      (boutCount === 0 && trumpCount >= 8);

    const bid160r =
      bid160 || bid80 || (bid40 && !hasOne) || (hasRussian && hasTwentyOne);

    const bid40r = (bid40 && hasOne) || bid20 || (bid10 && kingCount >= 1);

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
        return { bid: BidValue.TWENTY, player: playerId, calls: [ Call.RUSSIAN ] };
      } else if (BidValue.TWENTY > maxBid) {
        bidValue = BidValue.TWENTY;
      } else if (BidValue.TEN > maxBid && bid10) {
        bidValue = BidValue.TEN;
      }
    }

    return { bid: bidValue, player: playerId, calls: [] };
  }

  /**
   * Simple bot picks its longest suit as its partner suit. If there is a tie, it is randomly broken. It will never call itself on purpose.
   */
  public pickPartner(game: ClientGame): Card {
    const { hand } = game.playState;
    const bidSet = getNonSelfCalls(game);
    const suitLengths: [number, Suit][] = bidSet.map(([ callSuit, _ ]) => {
      const suitLength = hand.filter(([ suit, _ ]) => suit === callSuit).length;
      return [ suitLength, callSuit as Suit ];
    });
    const finalSuit: Suit = suitLengths.reduce(
      ([ maxLength, maxSuit ], [ suitLength, suit ]) =>
        suitLength >= maxLength ? [ suitLength, suit ] : [ maxLength, maxSuit ]
    )[1];
    const finalCard = bidSet.filter(([ suit, _ ]) => finalSuit === suit)[0];
    return finalCard;
  }

  /**
   * Simple bot prioritizes dropping for a void first, then dropping its highest face cards.
   */
  public dropDog(game: ClientGame): Card[] {
    if (game.playState.playerOrder.length < 5) {
      return this.randomBot.dropDog(game);
    }

    const { playState } = game;
    const { hand } = playState;
    let unDroppedHand = [ ...hand ];
    const dogCards: Card[] = [];
    const partnerCard = game.playState.partnerCard;
    if (!partnerCard) {
      return this.randomBot.dropDog(game);
    }
    const partnerSuit = partnerCard[0];

    const suitCount = [ Suit.Club, Suit.Diamond, Suit.Heart, Suit.Spade ]
      .map(voidSuit => [
        voidSuit,
        hand.filter(([ suit, _ ]) => suit === voidSuit).length,
      ])
      .filter(([ pSuit, _ ]) => pSuit !== partnerSuit) as [Suit, number][];
    const shortestSuit = lambdaMin(([ _, count ]) => count, ...suitCount)[0];

    if (shortestSuit.length > 0 && shortestSuit.length <= 3) {
      const cardsOfShortSuit = hand.filter(
        ([ suit, _ ]) => suit === shortestSuit
      );
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
   *   - lead 21 is the one hasn't been seen yet
   *   - lead lowest emptiest non-king suit
   *   - lead king of fullest king suit
   *   - lead lowest trump
   *   - lead random
   * else
   *   - see if any determination can be made on who can win the trick after you
   *   - if you can win, win
   *   - if your team wins, feed
   *   - dump
   */
  public playCard(game: ClientGame): Card {
    if (game.playState.playerOrder.length < 5) {
      return this.randomBot.playCard(game);
    }
    const { playState } = game;
    const { hand, trick: currentTrick, completedTricks } = playState;

    const handList = new CardList(...hand);

    const trickCardList = getTrickCardList(currentTrick);
    const leadCard = getLeadCard(trickCardList);
    const stateAnalysis = analyseGameState(game);
    const hasJoker = !!hand.find(
      ([ s, v ]) => s === Suit.Trump && v === TrumpValue.Joker
    );
    const has1 = !!hand.find(
      ([ s, v ]) => s === Suit.Trump && v === TrumpValue._1
    );
    const has21 = !!hand.find(
      ([ s, v ]) => s === Suit.Trump && v === TrumpValue._21
    );

    const suitRemaining: [Suit, number, boolean][] = RegSuits.map(suit => {
      const remaining =
        stateAnalysis.suits[suit].remainingCards.size() -
        handList.suitFilter(suit).size();
      const hasKing = handList.has([ suit, RegValue.R ]);
      return [ suit, remaining, hasKing ];
    });
    const nonKingSuitsRemaining = suitRemaining
      .filter(([ _suit, _remaining, hasKing ]) => !hasKing)
      .sort(([ _s1, r1 ], [ _s2, r2 ]) => r1 - r2);
    const emptiestNonKingSuit =
      nonKingSuitsRemaining.length === 0 ? null : nonKingSuitsRemaining[0][0];

    if (completedTricks.length === 13 && hasJoker) {
      return TheJoker;
    }
    if (leadCard) {
      // Bot to follow suit
    } else {
      // Bot to lead new suit
      if (has21 && !has1 && !stateAnalysis.onePlayed) {
        return The21;
      }

      // Lead emptiest non-king suit
      if (emptiestNonKingSuit) {
        return hand
          .filter(([ suit ]) => suit === emptiestNonKingSuit)
          .sort(
            ([ _s1, v1 ], [ _s2, v2 ]) =>
              getCardValueAsNumber(v1) - getCardValueAsNumber(v2)
          )[0];
      }
    }

    // const { hand, trick } = gameState.state;
    // const trickCards = trick.order.map((playerId) => trick.cards.get(playerId)).filter((c) => c) as Card[];
    // const cards = getCardsAllowedToPlay(hand, trickCards);
    // const finalCard = getArrayRandom(cards);

    // return finalCard;

    return this.randomBot.playCard(game);
  }
}
