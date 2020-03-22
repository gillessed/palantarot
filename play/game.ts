const createAllCards = function(): Card[] {
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
};

const dealCards = function(players: Player[]): {dog: Card[], hands: { [player: number]: Card[] }} {
    const cards = _.shuffle<Card>(createAllCards());
    const dogSize = players.length > 4 ? 3 : 6;
    const [dog, ...hands] = _.chunk(cards, (cards.length - dogSize) / players.length);
    return { dog, hands };
};

const getTrumps = function(cards?: Card[]): TrumpCard[] {
    return cards?.filter((card: Card): card is TrumpCard => card[0] == TrumpSuit) || [];
};

const cardsEqual = function(one: Card[], two: Card[]): boolean {
    return _.isEqual(one.sort(), two.sort());
};

const getPlayerNum = function(players: Player[], player: Player) {
    const index = players.indexOf(player);
    if (index < 0) {
        throw errorPlayerNotInGame(player, players);
    } else {
        return index;
    }
};
