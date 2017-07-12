import { Colors } from '@blueprintjs/core';
import { Player } from '../../../server/model/Player';
import { HandData, PlayerHand, Game } from '../../../server/model/Game';
import moment from 'moment-timezone';

export interface ScorePoint {
  date: string;
  score: number;
}

export interface PlayerResult {
  player: Player;
  series: Timeseries;
}

export type Timeseries = ScorePoint[];

export const Timeseries = {
  findMaximumAndTicks: (allSeries: Timeseries[]) => {
    const combined: number[] = [];
    allSeries.forEach((timeseries) => timeseries.forEach((scorePoint: ScorePoint) => combined.push(Math.abs(scorePoint.score))));
    const max = Math.max(...combined) || 200;
    const roundedMax = 100 * (Math.round(max / 100) + 1);
    let tickDistance: number;
    if (max > 2000) {
      tickDistance = 500;
    } else if (max > 1000) {
      tickDistance = 200;
    } else if (max > 400) {
      tickDistance = 100;
    } else {
      tickDistance = 50;
    }
    return {
      max: roundedMax,
      tickDistance,
    };
  },
  createResultsFromGames: (games: Game[], playerMap: Map<string, Player>, rangeStart: string, rangeEnd: string): PlayerResult[] => {
    const playerIdSet = new Set<string>();
    games.forEach((game: Game) => {
      getHandsInGame(game).map((hand) => hand.id).forEach((playerId) => playerIdSet.add(playerId));
    });
    const players = Array.from(playerIdSet).map((playerId) => playerMap.get(playerId)).filter((player) => player) as Player[];
    const resultMap = new Map<Player, Timeseries>();
    
    const start: ScorePoint = {
      date: rangeStart,
      score: 0,
    };
    players.forEach((player: Player) => resultMap.set(player, [start]));

    games.forEach((game: Game) => {
      const hands = getHandsInGame(game);
      hands.forEach((hand: PlayerHand) => {
        const player = playerMap.get(hand.id);
        if (player) {
          const delta = hand.pointsEarned;
          const series = resultMap.get(player)!;

          const dupe = {
            date: moment(game.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            score: series[series.length - 1].score,
          };
          const scorePoint: ScorePoint = {
            date: moment(game.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            score: dupe.score + delta,
          };
          resultMap.get(player)!.push(...[dupe, scorePoint]);
        }
      });
    });

    resultMap.forEach((value: Timeseries) => value.push({
      date: rangeEnd,
      score: value[value.length - 1].score,
    }));

    const resultList: PlayerResult[] = [];
    resultMap.forEach((series: Timeseries, player: Player) => {
      resultList.push({
        player,
        series,
      });
    });

    return resultList;
  },
  colors: [
    // Colors.BLUE3,
    // Colors.GREEN3,
    // Colors.ORANGE3,
    // Colors.RED3,
    // Colors.ROSE3,
    // Colors.VIOLET3,
    // Colors.INDIGO3,
    // Colors.TURQUOISE3,
    // Colors.LIME3,
    // Colors.SEPIA3,

    // Colors.BLUE5,
    // Colors.GREEN5,
    // Colors.ORANGE5,
    // Colors.RED5,
    // Colors.ROSE5,
    // Colors.VIOLET5,
    // Colors.INDIGO5,
    // Colors.TURQUOISE5,
    // Colors.LIME5,
    // Colors.SEPIA5,

    // Colors.BLUE1,
    // Colors.GREEN1,
    // Colors.ORANGE1,
    // Colors.RED1,
    // Colors.ROSE1,
    // Colors.VIOLET1,
    // Colors.INDIGO1,
    // Colors.TURQUOISE1,
    // Colors.LIME1,
    // Colors.SEPIA1,
  ],
}

function getHandsInGame(game: Game): PlayerHand[] {
  const handData: HandData = game.handData!;
  const hands: PlayerHand[] = [
    handData.bidder,
    ...handData.opposition,
  ];
  if (handData.partner) {
    hands.push(handData.partner);
  }
  return hands;
}