import { Database } from './dbConnector';
import { QueryBuilder, Queries } from './queryBuilder/QueryBuilder';
import { Stat, Stats } from '../model/Stats';
import { Delta, Deltas } from '../model/Delta';
import { BidStats } from '../model/Bid';
import { QueryResult } from 'pg';

export class StatsQuerier {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Queries

  public getStats = (): Promise<Stats> => {
    const allPlayers = QueryBuilder
      .select('players')
      .cs('players.id', 'allGames.c as allGamesCount', 'allGames.s as allGamesSum', 'allGames.h_year as year', 'allGames.h_month as month')
      .cs('allGames.was_bidder', 'allGames.was_partner', 'win.wc as winCount', 'win.ws as winSum');

    const allGamesMonthlyStatsQuery = QueryBuilder
      .subselect('player_hand', 'allGames')
      .c('was_bidder')
      .c('was_partner')
      .c('player_fk_id')
      .c(Queries.selectYear())
      .c(Queries.selectMonth())
      .c('COUNT(*) as c')
      .c('SUM(points_earned) as s')
      .groupBy('player_fk_id', 'h_year', 'h_month', 'was_bidder', 'was_partner');
    allPlayers.join(allGamesMonthlyStatsQuery, 'INNER', QueryBuilder.contains('players.id', 'allGames.player_fk_id'));

    const allWonGamesMonthlyStatsQuery = QueryBuilder
      .subselect('player_hand', 'win')
      .c('was_bidder')
      .c('was_partner')
      .c('player_fk_id')
      .c(Queries.selectYear())
      .c(Queries.selectMonth())
      .c('COUNT(*) as wc')
      .c('SUM(points_earned) as ws')
      .where(
        QueryBuilder.compare().compare('points_earned', '>=', '0')
      )
      .groupBy('player_fk_id', 'h_year', 'h_month', 'was_bidder', 'was_partner');
      
    allPlayers.join(
      allWonGamesMonthlyStatsQuery,
      'LEFT',
      QueryBuilder.compare()
        .compareColumn('allGames.player_fk_id', '=', 'win.player_fk_id')
        .compareColumn('allGames.h_year', '=', 'win.h_year')
        .compareColumn('allGames.h_month', '=', 'win.h_month')
        .compareColumn('allGames.was_bidder', '=', 'win.was_bidder')
        .compareColumn('allGames.was_partner', '=', 'win.was_partner')
    );

    return this.db.query(allPlayers.getQueryString(), allPlayers.getValues()).then((result: QueryResult): Stats => {
      return result.rows.map(this.toStat);
    });
  }

  public getAllDeltas = (length: number): Promise<Deltas> => {
    const sqlQuery = QueryBuilder.select('player_hand')
      .c('player_fk_id')
      .c('COUNT(*) as count')
      .c(Queries.selectYear())
      .c(Queries.selectMonth())
      .c(Queries.selectDay())
      .c('SUM(points_earned) AS delta')
      .groupBy('player_fk_id', 'h_year', 'h_month', 'h_day');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      const allDeltas = result.rows.map(this.toDelta);
      allDeltas.sort(this.deltaComparator);
      if (allDeltas.length <= length) {
        return {
          maximums: [...allDeltas].reverse(),
          minimums: [...allDeltas],
        };
      } else {
        return {
          maximums: allDeltas.slice(allDeltas.length - length, allDeltas.length).reverse(),
          minimums: allDeltas.slice(0, length),
        };
      }
    });
  }

  public getPlayerDeltas = (length: number, playerId: string): Promise<Deltas> => {
    const sqlQuery = QueryBuilder.select('player_hand')
      .c('player_fk_id')
      .c('COUNT(*) as count')
      .c(Queries.selectYear())
      .c(Queries.selectMonth())
      .c(Queries.selectDay())
      .c('SUM(points_earned) AS delta')
      .where(QueryBuilder.compare().compare('player_fk_id', '=', playerId))
      .groupBy('player_fk_id', 'h_year', 'h_month', 'h_day');

    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result: QueryResult) => {
      const allDeltas = result.rows.map(this.toDelta);
      allDeltas.sort(this.deltaComparator);
      if (allDeltas.length <= length) {
        return {
          maximums: [...allDeltas].reverse(),
          minimums: [...allDeltas],
        };
      } else {
        return {
          maximums: allDeltas.slice(allDeltas.length - length, allDeltas.length).reverse(),
          minimums: allDeltas.slice(0, length),
        };
      }
    });
  }

  public getPlayerBids = (playerId: string): Promise<BidStats> => {
    return Promise.all([
      this.bidQuery(playerId, 10, true),
      this.bidQuery(playerId, 10, false),
      this.bidQuery(playerId, 20, true),
      this.bidQuery(playerId, 20, false),
      this.bidQuery(playerId, 40, true),
      this.bidQuery(playerId, 40, false),
      this.bidQuery(playerId, 80, true),
      this.bidQuery(playerId, 80, false),
      this.bidQuery(playerId, 160, true),
      this.bidQuery(playerId, 160, false),
    ]).then((agg) => {
      return {
        playerId,
        ten: {
          won: agg[0],
          lost: agg[1],
        },
        twenty: {
          won: agg[2],
          lost: agg[3],
        },
        fourty: {
          won: agg[4],
          lost: agg[5],
        },
        eighty: {
          won: agg[6],
          lost: agg[7],
        },
        onesixty:{
          won: agg[8],
          lost: agg[9],
        },
      };
    });
  }

  // Helpers

  private bidQuery = (playerId: string, bidAmount: number, won: boolean): Promise<number> => {
    const sqlQuery = QueryBuilder.select('player_hand')
      .c('COUNT(*) as count')
      .join('hand', 'INNER', QueryBuilder.compare().compareColumn('player_hand.hand_fk_id', '=', 'hand.id'))
      .where(
        QueryBuilder.compare()
        .compare('player_fk_id', '=', playerId)
        .compare('was_bidder', '=', true)
        .compare('bid_amt', '=', bidAmount)
        .compare('points_earned', won ? '>=' : '<', 0)
      );
    return this.db.query(sqlQuery.getQueryString(), sqlQuery.getValues()).then((result) => {
      return +result.rows[0]['count'];
    });
  }

  private toStat = (result: {[key: string]: any}): Stat => {
    return {
      playerId: `${result['id']}`,
      month: +result['month'] - 1,
      year: +result['year'],
      wasBidder: !!result['was_bidder'],
      wasPartner: !!result['was_partner'],
      totalGames: +(result['allgamescount'] || 0),
      totalScore: +(result['allgamessum'] || 0),
      wonGames: +(result['wincount'] || 0),
      wonScore: +(result['winsum'] || 0),
    };
  };

  private toDelta = (result: {[key: string]: any}): Delta => {
    const month = +result['h_month'];
    const zeroPadMonth = `00${month}`.slice(-2);
    const day = +result['h_day'];
    const zeroPadDay = `00${day}`.slice(-2);
    return {
      playerId: `${result['player_fk_id']}`,
      date: `${+result['h_year']}-${zeroPadMonth}-${zeroPadDay}`,
      delta: +result['delta'],
      gameCount: +result['count'],
    };
  };

  private deltaComparator = (d1: Delta, d2: Delta) => {
    return d1.delta - d2.delta;
  }
}
