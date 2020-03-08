const createAllCards = function(): Card[] {
    const cards: Card[] = [];
    for (const suit in RegSuit) {
        for (const value in RegValue) {
            cards.push({
                suit: RegSuit[suit as keyof typeof RegSuit],
                value: RegValue[value as keyof typeof RegValue] })
        }
    }
    for (const value in TrumpValue) {
        cards.push({ suit: TrumpSuit, value: TrumpValue[value as keyof typeof TrumpValue]})
    }
    return cards
};

const dealCards = function(players: Player[]): {dog: Card[], hands: Map<Player, Card[]>} {
    const cards = _.shuffle<Card>(createAllCards());
    const dogSize = players.length > 4 ? 3 : 6;
    const [dog, ...hands] = _.chunk(cards, (cards.length - dogSize) / players.length);
    return { dog, hands: new Map(_.zip(players, hands) as unknown as [Player, Card[]][]) };
};

