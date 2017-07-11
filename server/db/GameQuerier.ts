import { Database } from './dbConnector';
import { HandData, PlayerHand, Game } from './../model/Game';
import moment from 'moment-timezone';
import { QueryBuilder, UpsertBuilder } from './queryBuilder/QueryBuilder';

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
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand',
        QueryBuilder.condition().equalsColumn('hand.id', '=', 'player_hand.hand_fk_id'),
      )
      .where(
        QueryBuilder.condition().equals('hand.id', '=', gameId),
      );
    
    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: any[]) => {
      return this.getGameFromResults(result);
    });
  }

  public queryRecentGames = (query: RecentGameQuery): Promise<Game[]> => {
    const sqlQuery = QueryBuilder.select('hand').star();
    if (query.player) {
      sqlQuery.join('player_hand',
        QueryBuilder.condition()
          .equalsColumn('hand.id', '=', 'player_hand.hand_fk_id')
          .equals('player_hand.player_fk_id', '=', query.player),
      );
    }
    sqlQuery.orderBy('hand.timestamp', 'desc');
    sqlQuery.limit(query.count, query.offset);

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: any[]) => {
      return result.map(this.getGameData);
    });
  }

  public queryGamesBetweenDates = (startDate: string, endDate: string): Promise<Game[]> => {
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand',
        QueryBuilder.condition().equalsColumn('hand.id', '=', 'player_hand.hand_fk_id')
      )
      .where(
        QueryBuilder.condition()
          .equals('hand.timestamp', '>=', startDate)
          .equals('hand.timestamp', '<', endDate)
      );

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((handEntries: any[]) => {
      return this.getGamesFromResults(handEntries);
    });
  }

  public saveGame = (game: Game): Promise<any> => {
    if (!game.handData) {
      throw new Error('Cannot create a new game without hand data.');
    }
    const handData = game.handData;
    let upsertHandSqlQuery: UpsertBuilder;
    let timestamp: string;
    if (game.id) {
      timestamp = moment(game.timestamp).format('YYYY-MM-DD HH:mm:ss');
      upsertHandSqlQuery = QueryBuilder.update('hand')
        .where(QueryBuilder.condition().equals('id', '=', game.id));
    } else {
      timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
      upsertHandSqlQuery = QueryBuilder.insert('hand')
        .v('timestamp', timestamp);
    }

    upsertHandSqlQuery
      .v('players', game.numberOfPlayers)
      .v('bidder_fk_id', game.bidderId)
      .v('partner_fk_id', game.partnerId || null)
      .v('bid_amt', game.bidAmount)
      .v('points', game.points);

    return this.db.beginTransaction().then((transaction): Promise<any> => {
      let maybeDelete: Promise<any>;
      if (game.id) {
        // If the game has an id, we are updating, so delete the old hands so we can add the new ones.
        const deleteOldHandsSqlQuery = QueryBuilder.delete('player_hand')
          .where(
            QueryBuilder.condition().equals('hand_fk_id', '=', game.id),
          );
        maybeDelete = transaction.query(deleteOldHandsSqlQuery.getQueryString(), deleteOldHandsSqlQuery.getValues());
      } else {
        maybeDelete = Promise.resolve();
      }
      return maybeDelete.then((): Promise<any> => {
        return transaction.query(upsertHandSqlQuery.getQueryString(), upsertHandSqlQuery.getValues());
      }).then((results: { insertId?: number }) => {
        let gameId: string;
        if (game.id) {
          gameId = game.id;
        } else if (results.insertId !== undefined) {
          gameId = results.insertId.toString()
        } else {
          throw Error('Error: could not determine game idea to insert game.');
        }
        const insertPlayerHandsSqlQueries: QueryBuilder[] = [];
        insertPlayerHandsSqlQueries.push(this.createInsertHandQuery(handData.bidder, gameId, timestamp, true, false));
        if (game.partnerId) {
          insertPlayerHandsSqlQueries.push(this.createInsertHandQuery(handData.partner!, gameId, timestamp, false, true));
        }
        handData.opposition.forEach((hand) => {
          insertPlayerHandsSqlQueries.push(this.createInsertHandQuery(hand, gameId, timestamp, false, false));
        });
        return Promise.all(insertPlayerHandsSqlQueries.map((sqlQuery): Promise<any> => {
          return transaction.query(sqlQuery.getQueryString(), sqlQuery.getValues());
        }));
      }).then((): Promise<any> => {
        return transaction.commit();
      });
    });
  }

  public deleteGame = (gameId: string): Promise<any> => {
    const deleteHandSqlQuery = QueryBuilder.delete('hand')
      .where(
        QueryBuilder.condition().equals('id', '=', gameId),
      );
    const deletePlayerHandsSqlQuery = QueryBuilder.delete('player_hand')
      .where(
        QueryBuilder.condition().equals('hand_fk_id', '=', gameId),
      );

    return this.db.beginTransaction().then((transaction) => {
      return transaction.query(deleteHandSqlQuery.getQueryString(), deleteHandSqlQuery.getValues()).then(() => {
          return transaction.query(deletePlayerHandsSqlQuery.getQueryString(), deletePlayerHandsSqlQuery.getValues());
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

  private createInsertHandQuery(
    playerHand: PlayerHand,
    gameId: string,
    timestamp: string,
    isBidder: boolean,
    isPartner: boolean
  ): QueryBuilder {
    return QueryBuilder.insert('player_hand')
      .v('timestamp', timestamp)
      .v('hand_fk_id', gameId)
      .v('player_fk_id', playerHand.id)
      .v('was_bidder', isBidder ? 1 : 0)
      .v('was_partner', isPartner ? 1 : 0)
      .v('showed_trump', playerHand.showedTrump)
      .v('one_last', playerHand.oneLast)
      .v('points_earned', playerHand.pointsEarned);
  }
}