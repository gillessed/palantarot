import * as React from 'react';
import { loadContainer } from '../../LoadingContainer';
import { streaksLoader } from '../../../services/streaks/index';
import { Streak } from '../../../../server/model/Streak';
import { createSelector } from 'reselect';

interface Props {
  playerId: string;
  streaks: Streak[];
}

class PlayerStreaksTabInternal extends React.PureComponent<Props, {}> {

  private winStreakSelector = createSelector(
    (props: Props) => `${props.playerId}`,
    (props: Props) => props.streaks,
    (playerId: string, streaks: Streak[]) => {
      return streaks.find((streak: Streak) => {
        return streak.win && streak.playerId === playerId;
      });
    }
  );

  private lossStreakSelector = createSelector(
    (props: Props) => `${props.playerId}`,
    (props: Props) => props.streaks,
    (playerId: string, streaks: Streak[]) => {
      return streaks.find((streak: Streak) => {
        return !streak.win && streak.playerId === playerId;
      });
    }
  );

  public render() {
    const winStreak = this.winStreakSelector(this.props);
    const lossStreak = this.lossStreakSelector(this.props);
    return (
      <div className='player-streaks-container'>
        <h3 className='bp3-heading'> Longest Streaks </h3>
        <p>
          <span className='bold'>Longest Win Streak: </span>
          {winStreak && winStreak.gameCount}
          {!winStreak && 'N/A'}
        </p>
        <p>
          <span className='bold'>Longest Loss Streak: </span>
          {lossStreak && lossStreak.gameCount}
          {!lossStreak && 'N/A'}
        </p>
      </div>
    );
  }
}

export const PlayerStreaksTab = loadContainer({
  streaks: streaksLoader,
})(PlayerStreaksTabInternal);
