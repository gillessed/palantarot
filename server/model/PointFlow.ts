import { GameRecord } from './GameRecord';
import { Month } from './Month';

export interface PointFlowRequest {
  player: string;
  month: Month;
}

export interface PointFlow {
  player: string;
  pointDeltas: PointDelta[];
}

export interface PointDelta {
  player: string;
  points: number;
}

export function getPointDeltas(player: string, game: GameRecord): PointDelta[] {
  if (game.handData.bidder.id === player) {
    return game.handData.opposition.map(data => ({
      player: data.id,
      points: game.handData.bidder.pointsEarned / 3,
    }));
  } else if (game.handData.partner && game.handData.partner.id === player) {
    const partner = game.handData.partner;
    return game.handData.opposition.map(data => ({
      player: data.id,
      points: partner.pointsEarned / 3,
    }));
  } else {
    if (game.handData.partner) {
      return [
        {
          player: game.handData.bidder.id,
          points: (game.handData.opposition[0].pointsEarned * 2) / 3,
        },
        {
          player: game.handData.partner.id,
          points: (game.handData.opposition[0].pointsEarned * 1) / 3,
        },
      ];
    } else {
      return [
        {
          player: game.bidderId,
          points: game.handData.opposition[0].pointsEarned,
        },
      ];
    }
  }
}
