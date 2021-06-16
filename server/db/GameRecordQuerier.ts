
import moment from 'moment-timezone';
import { QueryResult } from 'pg';
import { GameRecord, GameRecordPartial, HandData, PlayerHand } from '../model/GameRecord';
import { MonthlyScore } from '../model/Records';
import { Role, RoleResult } from '../model/Result';
import { PlayerPredicate, SearchQuery } from '../model/Search';
import { Database } from './dbConnector';
import { Queries, QueryBuilder, UpsertBuilder } from './queryBuilder/QueryBuilder';

export interface RecentGameQuery {
  count: number;
  player?: string;
  offset?: number;
  full?: boolean;
}

export class GameRecordQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public queryGameWithId = (gameId: string): Promise<GameRecord> => {
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand', 'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'player_hand.hand_fk_id'),
      )
      .where(
        QueryBuilder.compare().compareValue('hand.id', '=', gameId),
      );

    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.getGameFromResults(result.rows);
    });
  }

  public queryResultsBetweenDates = (startDate: string, endDate: string, role?: Role): Promise<RoleResult[]> => {
    const comparison = QueryBuilder.compare()
      .compareValue('timestamp', '>=', startDate)
      .compareValue('timestamp', '<', endDate);
    switch (role) {
      case Role.BIDDER: comparison.compareValue('was_bidder', '=', 'true'); break;
      case Role.PARTNER: comparison.compareValue('was_partner', '=', 'true'); break;
      case Role.OPPOSITION: comparison.compareValue('was_bidder', '=', 'false').compareValue('was_partner', '=', 'false'); break;
    }
    const sqlQuery = QueryBuilder.select('player_hand')
      .c('player_fk_id')
      .c("COUNT(*) as count")
      .c('SUM(points_earned) as sum')
      .where(comparison)
      .groupBy('player_fk_id');

    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
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

  public queryRecentGames = async (query: RecentGameQuery): Promise<GameRecordPartial[] | GameRecord[]> => {
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
            QueryBuilder.compare().compareValue('player_fk_id', '=', query.player)
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

    const result = await this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues());
    const games = this.getGamesFromResults(result.rows).slice(0, query.count);
    return games;
  }

  /**
   * Find any games between two given dates.
   * This can be an expensive function... call at your own peril
   */
  public queryGamesBetweenDates = (startDate: string, endDate: string, playerId?: string): Promise<GameRecord[]> => {
    const comparison = QueryBuilder.compare()
      .compareValue('hand.timestamp', '>=', startDate)
      .compareValue('hand.timestamp', '<', endDate);
    if (playerId) {
      comparison.columnIn('hand.id', QueryBuilder.select('player_hand').c('hand_fk_id'));
    }
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand', 'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'player_hand.hand_fk_id')
      )
      .where(comparison)
      .orderBy('hand.timestamp');

    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return this.getGamesFromResults(result.rows);
    });
  }

  /**
   * Search for any games that match the search query.
   */
  public search = async (searchQuery: SearchQuery): Promise<GameRecord[]> => {
    if (searchQuery.playerQueries.length < 1 
      && searchQuery.scoreQueries.length < 1
      && searchQuery.bidQuery.length < 1
      && searchQuery.numberOfPlayers.length < 1) {
      return [];
    }
    const sqlQuery = QueryBuilder.select('hand').star();
    for (const playerQuery of searchQuery.playerQueries) {
      const tableId = 'p_' + playerQuery.player;
      const toJoin = QueryBuilder
        .subselect('player_hand', tableId)
        .star()
        .orderBy('timestamp', 'desc');
      switch (playerQuery.predicate) {
        case PlayerPredicate.inGame:
          toJoin.where(
            QueryBuilder.compare().compareValue('player_fk_id', '=', playerQuery.player)
          );
          break;
        case PlayerPredicate.bidder:
          toJoin.where(
            QueryBuilder.compare().compareValue('player_fk_id', '=', playerQuery.player).compareValue('was_bidder', '=', true)
          );
          break;
        case PlayerPredicate.partner:
          toJoin.where(
            QueryBuilder.compare().compareValue('player_fk_id', '=', playerQuery.player).compareValue('was_partner', '=', true)
          );
          break;
        case PlayerPredicate.opponent:
          toJoin.where(
            QueryBuilder.compare().compareValue('player_fk_id', '=', playerQuery.player).compareValue('was_bidder', '=', false).compareValue('was_partner', '=', false)
          );
          break;
      }
      sqlQuery.join(
        toJoin,
        'INNER',
        QueryBuilder.contains('hand.id', tableId + '.hand_fk_id')
      );
    }

    if (searchQuery.scoreQueries.length > 0) {
      const scoreCondition = QueryBuilder.compare();
      for (const scoreQuery of searchQuery.scoreQueries) {
        scoreCondition.compareValue('points', scoreQuery.operator, scoreQuery.value);
      }
      sqlQuery.where(scoreCondition);
    }

    if (searchQuery.bidQuery.length > 0) {
      const bidCondition = QueryBuilder.compare('OR');
      for (const bidValue of searchQuery.bidQuery) {
        bidCondition.compareValue('bid_amt', '=', bidValue);
      }
      sqlQuery.where(bidCondition);
    }

    if (searchQuery.numberOfPlayers.length > 0) {
      const playerCountCondition = QueryBuilder.compare('OR');
      for (const playerNumber of searchQuery.numberOfPlayers) {
        playerCountCondition.compareValue('players', '=', playerNumber);
      }
      sqlQuery.where(playerCountCondition);
    }

    sqlQuery.join('player_hand', 'INNER',
      QueryBuilder.compare()
        .compareColumn('hand.id', '=', 'player_hand.hand_fk_id')
    );

    const result: QueryResult = await this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues());
    return this.getGamesFromResults(result.rows);
  }

  /**
   * Save a new game or save changes to an existing game.
   */
  public saveGame = async (game: GameRecord): Promise<any> => {
    if (!game.handData) {
      throw new Error('Cannot create a new game without hand data.');
    }
    const handData = game.handData;
    let upsertHandSqlQuery: UpsertBuilder;
    let timestamp: string;
    if (game.id) {
      timestamp = moment(game.timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
      upsertHandSqlQuery = QueryBuilder.update('hand')
        .where(QueryBuilder.compare().compareValue('id', '=', game.id));
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

    const transaction = await this.db.beginTransaction();
    if (game.id) {
      // If the game has an id, we are updating, so delete the old hands so we can add the new ones.
      const deleteOldHandsSqlQuery = QueryBuilder.delete('player_hand')
        .where(
          QueryBuilder.compare().compareValue('hand_fk_id', '=', game.id),
        );
      await transaction.query(deleteOldHandsSqlQuery.getIndexedQueryString(), deleteOldHandsSqlQuery.getValues());
    }
    const result = await transaction.query(upsertHandSqlQuery.getIndexedQueryString(), upsertHandSqlQuery.getValues());
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
    await Promise.all(insertPlayerHandsSqlQueries.map((sqlQuery): Promise<any> => {
      return transaction.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues());
    }));
    return transaction.commit();
  }

  public deleteGame = (gameId: string): Promise<any> => {
    const deleteHandSqlQuery = QueryBuilder.delete('hand')
      .where(
        QueryBuilder.compare().compareValue('id', '=', gameId),
      );
    const deletePlayerHandsSqlQuery = QueryBuilder.delete('player_hand')
      .where(
        QueryBuilder.compare().compareValue('hand_fk_id', '=', gameId),
      );

    return this.db.beginTransaction().then((transaction) => {
      return transaction.query(deleteHandSqlQuery.getIndexedQueryString(), deleteHandSqlQuery.getValues()).then(() => {
        return transaction.query(deletePlayerHandsSqlQuery.getIndexedQueryString(), deletePlayerHandsSqlQuery.getValues());
      }).then(() => {
        return transaction.commit();
      });
    });
  }

  public getSlamGames = (): Promise<GameRecord[]> => {
    const sqlQuery = QueryBuilder.select('hand')
      .star()
      .join('player_hand', 'INNER',
        QueryBuilder.compare().compareColumn('hand.id', '=', 'player_hand.hand_fk_id')
      )
      .where(
        QueryBuilder.compare().compareValue('hand.points', '>=', 260)
      )
      .orderBy('hand.timestamp', 'desc');

    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
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

    return this.db.query(sqlQuery.getIndexedQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      return result.rows.map((result: { [key: string]: any }): MonthlyScore => {
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

  private getGamesFromResults(handEntries: any[]): GameRecord[] {
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
    const games: GameRecord[] = [];
    gameHands.forEach((currentPlayerHands: any[]) => {
      games.push(this.getGameFromResults(currentPlayerHands));
    });
    return games;
  }

  private getGameFromResults(playerHands: any[]): GameRecord {
    const gameData = this.getGameData(playerHands[0]);
    return {
      ...gameData,
      handData: this.getPlayerHands(playerHands),
    };
  }

  private getGameData(hand: any): GameRecordPartial {
    let id;
    if (hand['hand_fk_id']) {
      id = hand['hand_fk_id'] + '';
    } else {
      id = hand['id'] + '';
    }
    const game: GameRecordPartial = {
      id,
      bidderId: hand['bidder_fk_id'] + '',
      partnerId: hand['partner_fk_id'] ? hand['partner_fk_id'] + '' : undefined,
      timestamp: hand['timestamp'],
      numberOfPlayers: hand['players'],
      bidAmount: hand['bid_amt'],
      points: hand['points'],
      slam: (+hand['points'] >= 270),
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
