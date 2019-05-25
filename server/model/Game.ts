export interface GamePartial {
  id: string;
  bidderId: string;
  partnerId?: string;
  timestamp: string;
  numberOfPlayers: number;
  bidAmount: number;
  points: number;
  slam: boolean;
}

export interface Game extends GamePartial {
  handData: HandData;
}

export interface HandData {
  bidder: PlayerHand;
  partner?: PlayerHand;
  opposition: PlayerHand[];
}

export interface PlayerHand {
  id: string;
  handId: string;
  pointsEarned: number;
  showedTrump: boolean;
  oneLast: boolean;
}

export function playerInGame(playerId: string, game: Game): boolean {
  return game.handData.bidder.id === playerId ||
    (game.handData.partner && game.handData.partner.id === playerId) ||
    !!game.handData.opposition.find((handData) => handData.id === playerId);
}
