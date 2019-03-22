import { Database } from './dbConnector';
import { HandData, PlayerHand, Game } from './../model/Game';
import moment from 'moment-timezone';
import { QueryBuilder, UpsertBuilder, Queries } from './queryBuilder/QueryBuilder';
import { GamePartial } from '../model/Game';
import { MonthlyScore } from '../model/Records';
import { Result, Role, RoleResult } from '../model/Result';
import { QueryResult } from 'pg';

export interface RecentGameQuery {
  count: number;
  player?: string;
  offset?: number;
  full?: boolean;
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
      .join('player_hand', 'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'player_hand.hand_fk_id'),
      )
      .where(
        QueryBuilder.compare().compare('hand.id', '=', gameId),
      );
    
    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.getGameFromResults(result.rows);
    });
  }

  public queryResultsBetweenDates = (startDate: string, endDate: string, role?: Role): Promise<RoleResult[]> => {
    const comparison = QueryBuilder.compare()
      .compare('timestamp', '>=', startDate)
      .compare('timestamp', '<', endDate);
    switch (role) {
      case Role.BIDDER: comparison.compare('was_bidder', '=', 'true'); break;
      case Role.PARTNER: comparison.compare('was_partner', '=', 'true'); break;
      case Role.OPPOSITION: comparison.compare('was_bidder', '=', 'false').compare('was_partner', '=', 'false'); break;
    }
    const sqlQuery = QueryBuilder.select('player_hand')
      .c('player_fk_id')
      .c("COUNT(*) as count")
      .c('SUM(points_earned) as sum')
      .where(comparison)
      .groupBy('player_fk_id');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return result.rows.map((row) => {
        const foo = {
          id: `${row['player_fk_id']}`,
          points: +row['sum'],
          gamesPlayed: +row['count'],
        };
        return foo;
      });
    });
  }

  public queryRecentGames = (query: RecentGameQuery): Promise<GamePartial[] | Game[]> => {
    if (query.player && query.full) {
      throw Error('Cannot set both player and game queries.');
    }
    const sqlQuery = QueryBuilder.select('hand').star();
    if (query.player) {
      sqlQuery.join(
        QueryBuilder
          .subselect('player_hand', 'p')
          .star()
          .where(
            QueryBuilder.compare().compare('player_fk_id', '=', query.player)
          )
          .orderBy('timestamp', 'desc')
          .limit(query.count, query.offset),
          'INNER',
        QueryBuilder.contains('hand.id', 'p.hand_fk_id')
      );
    } else {
      sqlQuery.join(
        QueryBuilder
          .subselect('hand', 'p')
          .star()
          .orderBy('timestamp', 'desc')
          .limit(query.count, query.offset),
          'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'p.id')
      );
    }

    sqlQuery.join('player_hand', 'INNER',
      QueryBuilder.compare()
        .compareColumn('hand.id', '=', 'player_hand.hand_fk_id')
    );

    sqlQuery.orderBy('hand.timestamp', 'desc');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.getGamesFromResults(result.rows).slice(0, query.count);
    });
  }

  /**
   * This is an expensive function... call at your own peril
   */
  public queryGamesBetweenDates = (startDate: string, endDate: string): Promise<Game[]> => {
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand', 'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'player_hand.hand_fk_id')
      )
      .where(
        QueryBuilder.compare()
          .compare('hand.timestamp', '>=', startDate)
          .compare('hand.timestamp', '<', endDate)
      )
      .orderBy('hand.timestamp');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.getGamesFromResults(result.rows);
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
      timestamp = moment(game.timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
      upsertHandSqlQuery = QueryBuilder.update('hand')
        .where(QueryBuilder.compare().compare('id', '=', game.id));
    } else {
      timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      upsertHandSqlQuery = QueryBuilder.insert('hand')
        .v('timestamp', timestamp)
        .return('id');
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
            QueryBuilder.compare().compare('hand_fk_id', '=', game.id),
          );
        maybeDelete = transaction.query(deleteOldHandsSqlQuery.getQueryString(), deleteOldHandsSqlQuery.getValues());
      } else {
        maybeDelete = Promise.resolve();
      }
      return maybeDelete.then((): Promise<QueryResult> => {
        return transaction.query(upsertHandSqlQuery.getQueryString(), upsertHandSqlQuery.getValues());
      }).then((result: QueryResult) => {
        let gameId: string;
        if (game.id) {
          gameId = game.id;
        } else if (result.rowCount > 0) {
          gameId = result.rows[0].id.toString()
        } else {
          throw Error('Error: could not determine game id to insert game.');
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
        QueryBuilder.compare().compare('id', '=', gameId),
      );
    const deletePlayerHandsSqlQuery = QueryBuilder.delete('player_hand')
      .where(
        QueryBuilder.compare().compare('hand_fk_id', '=', gameId),
      );

    return this.db.beginTransaction().then((transaction) => {
      return transaction.query(deleteHandSqlQuery.getQueryString(), deleteHandSqlQuery.getValues()).then(() => {
          return transaction.query(deletePlayerHandsSqlQuery.getQueryString(), deletePlayerHandsSqlQuery.getValues());
        }).then(() => {
          return transaction.commit();
        });
    });
  }

  public getSlamGames = (): Promise<Game[]> => {
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand', 'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'player_hand.hand_fk_id')
      )
      .where(
        QueryBuilder.compare().compare('hand.points', '>=', 260)
      )
      .orderBy('hand.timestamp', 'desc');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.getGamesFromResults(result.rows);
    });
  }

  public getAllMonthlyTotals = (): Promise<MonthlyScore[]> => {
    const sqlQuery = QueryBuilder.select('player_hand')
      .c('player_fk_id')
      .c(Queries.selectYear())
      .c(Queries.selectMonth())
      .c("COUNT(*) as count")
      .c('SUM(points_earned) as sum')
      .groupBy('player_fk_id', 'h_year', 'h_month');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return result.rows.map((result: {[key: string]: any}): MonthlyScore => {
        return {
          playerId: `${result['player_fk_id']}`,
          month: +result['h_month'] - 1,
          year: +result['h_year'],
          gameCount: +result['count'],
          score: +result['sum'],
        };
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
      // last game might be incomplete
      if (handEntries.length > 0) {
        const lastHand = handEntries[handEntries.length - 1];
        const expectedNumPlayers = lastHand['players'] as number;
        const actualNumPlayers = gameHands.get(lastHand['hand_fk_id'])!.length;
        if (actualNumPlayers !== expectedNumPlayers) {
          gameHands.delete(lastHand['hand_fk_id']);
        }
      }
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

  private getGameData(hand: any): GamePartial {
    let id;
    if (hand['hand_fk_id']) {
      id = hand['hand_fk_id'] + '';
    } else {
      id = hand['id'] + '';
    }
    const game: GamePartial = {
      id,
      bidderId: hand['bidder_fk_id'] + '',
      partnerId: hand['partner_fk_id'] ? hand['partner_fk_id'] + '' : undefined,
      timestamp: hand['timestamp'],
      numberOfPlayers: hand['players'],
      bidAmount: hand['bid_amt'],
      points: hand['points'],
      slam:  (+hand['points'] >= 270),
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
      .v('points_earned', playerHand.pointsEarned)
      .return('id');
  }
}