import { Database } from './dbConnector';
import { HandData, PlayerHand, Game } from './../model/Game';

const selectHand = `SELECT * FROM hand`;
const joinPlayerHand = `JOIN player_hand ON hand.id=player_hand.hand_fk_id`;
const whereId = `WHERE hand.id=?`;
const whereTimestamp = `WHERE hand.timestamp >= ? AND hand.timestamp < ?`;

export class GameQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public queryGameWithId = (gameId: string): Promise<Game> => {
    return this.db.query(`${selectHand} ${joinPlayerHand} ${whereId}`, [gameId]).then((result: any[]) => {
      return this.getGameFromResults(result);
    });
  }

  public queryRecentGames = (count: number): Promise<Game[]> => {
    return this.db.query('SELECT * FROM hand ORDER BY timestamp DESC LIMIT ? ', [count]).then((result: any[]) => {
      return result.map(this.getGameData);
    });
  }

  public queryGamesBetweenDates = (startDate: string, endDate: string): Promise<Game[]> => {
    return this.db.query(`${selectHand} ${joinPlayerHand} ${whereTimestamp}`, [startDate, endDate]).then((playerHands: any[]) => {
      const gameHands = new Map<string, any[]>();
      playerHands.forEach((hand: any) => {
        const gameId = hand['hand_fk_id'];
        if (!gameHands.has(gameId)) {
          gameHands.set(gameId, []);
        }
        const currentGameHands: any[] = gameHands.get(gameId)!;
        currentGameHands.push(hand);
        gameHands.set(gameId, currentGameHands);
      });
      const games: Game[] = [];
      gameHands.forEach((currentPlayerHands: any[]) => {
        games.push(this.getGameFromResults(currentPlayerHands));
      });
      return games;
    });
  }

  // Helpers

  private getGameFromResults(playerHands: any[]): Game {
    const gameData = this.getGameData(playerHands[0]);
    return {
      ...gameData,
      handData: this.getPlayerHands(playerHands),
    };
  }

  private getGameData(hand: any): Game {
    let id;
    if (hand['hand_fk_id']) {
      id = hand['hand_fk_id'] + '';
    } else {
      id = hand['id'] + '';
    }
    const game: Game = {
      id,
      bidderId: hand['bidder_fk_id'] + '',
      partnerId: hand['partner_fk_id'] ? hand['partner_fk_id'] + '' : undefined,
      timestamp: hand['timestamp'],
      numberOfPlayers: hand['players'],
      bidAmount: hand['bid_amt'],
      points: hand['points'],
      slam: hand['slam'],
    };
    return game;
  }

  private getPlayerHands(hands: any[]): HandData {
    const bidderData = this.getHandData(hands.find((hand: any) => hand['was_bidder']));
    const partner = hands.find((hand: any) => hand['was_partner']);
    const partnerData = partner ? this.getHandData(partner) : undefined;
    const oppositionData = hands
      .filter((hand: any) => !hand['was_bidder'] && !hand['was_partner'])
      .map(this.getHandData);
    return {
      bidder: bidderData,
      partner: partnerData,
      opposition: oppositionData,
    }
  }

  private getHandData(playerHand: any): PlayerHand {
    return {
      id: playerHand['player_fk_id'] + '',
      handId: playerHand['hand_fk_id'] + '',
      pointsEarned: playerHand['points_earned'],
      showedTrump: playerHand['showed_trump'],
      oneLast: playerHand['one_last'],
    };
  }
}