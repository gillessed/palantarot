import * as React from 'react';
import {Link} from 'react-router';

interface Props {
  children: any[];
}

interface State {
  numberOfPlayers: 5,
}

export class EnterContainer extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      numberOfPlayers: 5,
    };
  }

  public render() {
    return (
      <div className='enter-container pt-ui-text-large'>
        <div className='title'>
          <h1>Enter Score</h1>
        </div>
        <div className='player-select-bar pt-button-group pt-large'>
          <a 
            className={`pt-button pt-icon-people ${this.numberButtonEnabled(3)}`}
            onClick={() => {this.setPlayerCount(3)}}
            tabIndex={0}
            role='button'
          >
            3 Players
          </a>
          <a
            className={`pt-button pt-icon-people ${this.numberButtonEnabled(4)}`}
            onClick={() => {this.setPlayerCount(4)}}
            tabIndex={0}
            role='button'
          >
            4 Players
          </a>
          <a
            className={`pt-button pt-icon-people ${this.numberButtonEnabled(5)}`}
            onClick={() => {this.setPlayerCount(5)}}
            tabIndex={0}
            role='button'
          >
            5 Players
          </a>
        </div>
      </div>
    );
  }

  private numberButtonEnabled(count: number) {
    if (count === this.state.numberOfPlayers) {
      return 'pt-active';
    } else {
      return '';
    }
  }

  private setPlayerCount(count: number) {
    if (this.state.numberOfPlayers !== count) {
      this.setState({
        numberOfPlayers: count,
      } as State);
    }
  }
}