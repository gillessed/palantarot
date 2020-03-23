import {Comparator} from "../server/utils";
import _ from "lodash";

/*
 * This file contains game code which is useful for both client and server.
 */

function createAllCards(): Card[] {
    const cards: Card[] = [];
    for (const suit in RegSuit) {
        for (const value in RegValue) {
            cards.push([
                RegSuit[suit as keyof typeof RegSuit],
                RegValue[value as keyof typeof RegValue]
            ])
        }
    }
    for (const value in TrumpValue) {
        cards.push([TrumpSuit, TrumpValue[value as keyof typeof TrumpValue]])
    }
    return cards
}

function invalidDeal(hands: Card[][]): boolean {
    for (const hand of hands) {
        const trumps = _.filter(hand, (card) => card[0] === TrumpSuit);
        if (trumps.length === 1 && trumps[0][1] === TrumpValue._1) {
            return true;
        }
    }
    return false;
}

export const dealCards = function(players: Player[]): {dog: Card[], hands: { [player: number]: Card[] }} {
    while (true) {
        const cards = _.shuffle<Card>(createAllCards());
        const dogSize = players.length > 4 ? 3 : 6;
        const [dog, ...hands] = _.chunk(cards, (cards.length - dogSize) / players.length);
        if (invalidDeal(hands)) {
            continue; // Invalid hand, deal again!
        }
        return {dog, hands};
    }
};

export const getTrumps = function(cards?: Card[]): TrumpCard[] {
    return cards?.filter((card: Card): card is TrumpCard => card[0] == TrumpSuit) || [];
};

export const cardsEqual = function(one: Card[], two: Card[]): boolean {
    return _.isEqual(one.sort(), two.sort());
};

export const getPlayerNum = function(players: Player[], player: Player) {
    const index = players.indexOf(player);
    if (index < 0) {
        throw errorPlayerNotInGame(player, players);
    } else {
        return index;
    }
};

function getLeadSuit(trick: Card[]): Suit | undefined {
    for (const card of trick) {
        if (card[1] !== TrumpValue.Joker) {
            return card[0];
        }
    }
    return undefined;
}

function getLowestAllowableTrump(trick: Card[]): TrumpValue {
    let lowest_allowed = TrumpValue._1;
    for (const card of trick) {
        if (card[0] === TrumpSuit && card[1] !== TrumpValue.Joker && lowest_allowed < card[1]) {
            lowest_allowed = card[1]
        }
    }
    return lowest_allowed;
}

export const getCardsAllowedToPlay = function(hand: Card[], trick: Card[]): Card[] {
    const lead_suit = getLeadSuit(trick);
    if (lead_suit === undefined) {
        return hand // new trick, lead whatever
    }

    const joker = _.filter(hand, TheJoker);
    const hand_in_suit = _.filter(hand, (card) => card[0] === lead_suit);
    if (lead_suit !== TrumpSuit && hand_in_suit.length > 0) {
        return [...hand_in_suit, ...joker] // can follow non-trump suit
    }

    const lowest_allowed = getLowestAllowableTrump(trick);
    const allowed_trump = _.filter(hand, (card) =>
        card[0] === TrumpSuit && card[1] !== TrumpValue.Joker && card[1] >= lowest_allowed);
    if (allowed_trump.length > 0) {
        return [...allowed_trump, ...joker] // can over-trump
    }
    const trump = _.filter(hand, (card) =>
       card[0] === TrumpSuit && card[1] !== TrumpValue.Joker);
    if (trump.length > 0) {
        return [...trump, ...joker] // need to play some trump
    } else {
        return hand; // play whatever
    }
};

function getCardValueAsNumber(value: RegValue | TrumpValue): number {
    switch (value) {
        case RegValue._1:
        case RegValue._2:
        case RegValue._3:
        case RegValue._4:
        case RegValue._5:
        case RegValue._6:
        case RegValue._7:
        case RegValue._8:
        case RegValue._9:
        case RegValue._10:
            return value.valueOf();
        case RegValue.V:
            return 11;
        case RegValue.C:
            return 12;
        case RegValue.D:
            return 13;
        case RegValue.R:
            return 14;
        case TrumpValue.Joker:
            return 0;
        case TrumpValue._1:
        case TrumpValue._2:
        case TrumpValue._3:
        case TrumpValue._4:
        case TrumpValue._5:
        case TrumpValue._6:
        case TrumpValue._7:
        case TrumpValue._8:
        case TrumpValue._9:
        case TrumpValue._10:
        case TrumpValue._11:
        case TrumpValue._12:
        case TrumpValue._13:
        case TrumpValue._14:
        case TrumpValue._15:
        case TrumpValue._16:
        case TrumpValue._17:
        case TrumpValue._18:
        case TrumpValue._19:
        case TrumpValue._20:
        case TrumpValue._21:
            return value.valueOf();
    }
}

export const compareCards = function(lead_suit: Suit | undefined): Comparator<Card> {
    return (left: Card, right: Card) => {
        if (_.isEqual(left, right)) {
            return 0;
        } else if (left[1] === TrumpValue.Joker) {
            return -1;
        } else if (right[1] === TrumpValue.Joker) {
            return 1;
        } else if (left[0] === right[0]) {
            return getCardValueAsNumber(left[1]) - getCardValueAsNumber(right[1]);
        } else if (left[0] === TrumpSuit) {
            return 1;
        } else if (right[0] === TrumpSuit) {
            return -1;
        } else if (left[0] === lead_suit) {
            return 1;
        } else if (right[0] === lead_suit) {
            return -1;
        } else {
            return left[0].charCodeAt(0) - right[0].charCodeAt(0); // at this point, whatever.
        }
    }
};

export const getWinner = function(trick: Card[], players: Player[]): [Card, Player] {
    let [card, player] = [trick[0], players[0]];
    const comparer = compareCards(getLeadSuit(trick));
    for (const index in trick) {
        if (comparer(trick[index], card) > 0) {
            [card, player] = [trick[index], players[index]]
        }
    }
    return [card, player];
};
