import React, { PureComponent } from 'react';

interface Props {
  playerName: string;
  playerRank?: number;
  playerCount?: number;
  playerScore?: number;
}

export class PlayerBanner extends PureComponent<Props, {}> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    const rank = this.props.playerRank ?
      `${this.props.playerRank} / ${this.props.playerCount}` :
      'N/A';
    return (
      <div>
        <div className='player-banner'>
          <div className='player-title-container'>
            <span><h1> {this.props.playerName}</h1></span>
            <h6> Monthly Rank: {rank}</h6>
          </div>
          {this.renderScore()}
        </div>
      </div>
    );
  }

  public renderScore() {
    const score = this.props.playerScore;
    const scoreText = score !== undefined ? (score > 0 ? '+' + score : score) : 'N/A';
    const scoreClass = score !== undefined ? (score > 0 ? ' game-win' : ' game-loss') : 'none';
    return (
      <div className={'player-point-display' + scoreClass}>
        {scoreText}
      </div>
    );
  }
}