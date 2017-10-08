import { Database } from './dbConnector';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { Stat, Stats } from '../model/Stats';

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
      .c("YEAR(CONVERT_TZ(timestamp, '+00:00', '-08:00')) AS h_year")
      .c("MONTH(CONVERT_TZ(timestamp, '+00:00', '-08:00')) AS h_month")
      .c('COUNT(*) as c')
      .c('SUM(points_earned) as s')
      .groupBy('player_fk_id', 'h_year', 'h_month', 'was_bidder', 'was_partner');
    allPlayers.join(allGamesMonthlyStatsQuery, 'INNER', QueryBuilder.contains('players.id', 'allGames.player_fk_id'));

    const allWonGamesMonthlyStatsQuery = QueryBuilder
      .subselect('player_hand', 'win')
      .c('was_bidder')
      .c('was_partner')
      .c('player_fk_id')
      .c("YEAR(CONVERT_TZ(timestamp, '+00:00', '-08:00')) AS h_year")
      .c("MONTH(CONVERT_TZ(timestamp, '+00:00', '-08:00')) AS h_month")
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

    return this.db.query(allPlayers.getQueryString(), allPlayers.getValues()).then((results: any[]): Stats => {
      return results.map(this.toStat);
    });
  }

  // Helpers

  private toStat = (result: {[key: string]: any}): Stat => {
    return {
      playerId: `${result['id']}`,
      month: +result['month'] - 1,
      year: +result['year'],
      wasBidder: !!result['was_bidder'],
      wasPartner: !!result['was_partner'],
      totalGames: result['allGamesCount'] || 0,
      totalScore: result['allGamesSum'] || 0,
      wonGames: result['winCount'] || 0,
      wonScore: result['winSum'] || 0,
    };
  };
}
