export interface GameRecordPartial {
  id: string;
  bidderId: string;
  partnerId?: string;
  timestamp: string;
  numberOfPlayers: number;
  bidAmount: number;
  points: number;
  slam: boolean;
}

export interface GameRecord extends GameRecordPartial {
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

export function playerInGame(playerId: string, game: GameRecord): boolean {
  return (
    game.handData.bidder.id === playerId ||
    (game.handData.partner && game.handData.partner.id === playerId) ||
    !!game.handData.opposition.find(handData => handData.id === playerId)
  );
}
