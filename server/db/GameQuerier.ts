import { Database } from './dbConnector';
import { HandData, PlayerHand, Game } from './../model/Game';
import moment from 'moment-timezone';

const selectHand = 'SELECT * FROM hand';
const orderLimit = 'ORDER BY hand.timestamp DESC LIMIT ? ';
const offset = 'OFFSET ?';
const joinPlayerHand = 'JOIN player_hand ON hand.id=player_hand.hand_fk_id';
const joinPlayerId = 'AND player_hand.player_fk_id=?';
const whereId = 'WHERE hand.id=?';
const whereTimestamp = 'WHERE hand.timestamp >= ? AND hand.timestamp < ?';
const insertHand = 'INSERT INTO hand (timestamp, players, bidder_fk_id, partner_fk_id, bid_amt, points, slam) VALUES (?, ?, ?, ?, ?, ?, ?)';
const insertPlayerHand = 'INSERT INTO player_hand (timestamp, hand_fk_id, player_fk_id, was_bidder, was_partner, showed_trump, one_last, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

export interface RecentGameQuery {
  count: number;
  player?: string;
  offset?: number;
}

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

  public queryRecentGames = (query: RecentGameQuery): Promise<Game[]> => {
    let queryString = `${selectHand}`;
    const queryParams: any[] = [];
    if (query.player) {
      queryString += ` ${joinPlayerHand} ${joinPlayerId}`;
      queryParams.push(+query.player);
    }
    queryString += ` ${orderLimit}`;
    queryParams.push(query.count);
    if (query.offset) {
      queryString += ` ${offset}`;
      queryParams.push(query.offset);
    }
    return this.db.query(queryString, queryParams).then((result: any[]) => {
      return result.map(this.getGameData);
    });
  }

  public queryGamesBetweenDates = (startDate: string, endDate: string): Promise<Game[]> => {
    return this.db.query(`${selectHand} ${joinPlayerHand} ${whereTimestamp}`, [startDate, endDate]).then((handEntries: any[]) => {
      return this.getGamesFromResults(handEntries);
    });
  }

  public saveGame = (game: Game) => {
    if (!game.handData) {
      throw new Error('Cannot create a new game without hand data.');
    }
    const handData = game.handData;
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const gameValues = [
      timestamp,
      game.numberOfPlayers,
      game.bidderId,
      game.partnerId || null,
      game.bidAmount,
      game.points,
      game.slam,
    ];

    return this.db.beginTransaction().then((transaction) => {
      return transaction.query(insertHand, gameValues).then((results: {insertId: number}) => {
        const gameId = results.insertId.toString();
        const playerHands = [[
          timestamp,
          gameId,
          game.bidderId,
          1,
          0,
          handData.bidder.showedTrump,
          handData.bidder.oneLast,
          handData.bidder.pointsEarned,
        ]];
        if (game.partnerId) {
          const partner = handData.partner!;
          playerHands.push([
            timestamp,
            gameId,
            partner.id,
            0,
            1,
            partner.showedTrump,
            partner.oneLast,
            partner.pointsEarned,
          ]);
        }
        handData.opposition.forEach((hand) => {
          playerHands.push([
            timestamp,
            gameId,
            hand.id,
            0,
            0,
            hand.showedTrump,
            hand.oneLast,
            hand.pointsEarned,
          ]);
        });
        return Promise.all(playerHands.map((data) => {
          return transaction.query(insertPlayerHand, data);
        }));
      }).then(() => {
        return transaction.commit();
      });
    });
  }

  // Helpers

  private getGamesFromResults(handEntries: any[]): Game[] {
      const gameHands = new Map<string, any[]>();
      handEntries.forEach((hand: any) => {
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
  }

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