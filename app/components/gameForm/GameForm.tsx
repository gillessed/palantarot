import * as React from 'react';
import { Game } from '../../../server/model/Game';
import { Player } from '../../../server/model/Player';
import { PlayerSelector } from '../../components/playerSelector/PlayerSelector';


interface Props {
  players: Player[];
  game?: Game;
}

interface State {
  numberOfPlayers: number;
  bidder?: string;
  bidderCalledSelf: boolean;
  partner?: string;
  points?: number;
  opposition: string[];
}

export class GameForm extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      numberOfPlayers: 5,
      bidderCalledSelf: false,
      opposition: [],
    };
  }

  public render() {
    return (
      <div className="game-form">
        {this.renderPlayerNumberButtonRow()}
        <div className="card-container">
          <div className="pt-card" style={{marginTop: 50}}>
            <h3>Bidder's Team</h3>

            <PlayerSelector
              players={this.props.players}
              label="Bidder:"
            />

            <label className="pt-label" style={{display: 'flex', alignItems: 'center', flexDirection:'column', textAlign: 'center'}}>
              Bid Amount:
              <div className="pt-select" style={{width: 100}}>
                <select>
                  <option value=""></option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="40">40</option>
                  <option value="80">80</option>
                  <option value="160">160</option>
                </select>
              </div>
            </label>

            <label className="pt-label" style={{display: 'flex', alignItems: 'center', flexDirection:'column', textAlign: 'center'}}>
              Points Earned:
              <input className="pt-input" type="text" dir="auto" style={{width: 100}}/>
            </label>

            {this.renderPartnerSelector()}
          </div>

          <div className="pt-card" style={{marginTop: 50}}>
            <h3>Opposition</h3>
            {this.renderOppositionSelectors()}
          </div>
        </div>
        <div className="enter-score-button-container">
          <button className="enter-score-button pt-button pt-large pt-intent-success" style={{marginTop: 20}}>Enter Score</button>
        </div>
      </div>
    );
  }

  private renderPlayerNumberButtonRow() {
    return (
      <div className='player-selector-container pt-ui-text-large'>
        <div className='player-select-bar pt-button-group pt-large'>
          <a 
            className={`pt-button pt-icon-people ${this.numberButtonEnabled(3)}`}
            onClick={() => {this.setPlayerCount(3)}}
            tabIndex={0}
            role='button'
          >
            3<span className="hide-on-small"> Players</span>
          </a>
          <a
            className={`pt-button pt-icon-people ${this.numberButtonEnabled(4)}`}
            onClick={() => {this.setPlayerCount(4)}}
            tabIndex={0}
            role='button'
          >
            4<span className="hide-on-small"> Players</span>
          </a>
          <a
            className={`pt-button pt-icon-people ${this.numberButtonEnabled(5)}`}
            onClick={() => {this.setPlayerCount(5)}}
            tabIndex={0}
            role='button'
          >
            5<span className="hide-on-small"> Players</span>
          </a>
        </div>
      </div>
    );
  }

  private renderPartnerSelector() {
    if (!this.state.bidderCalledSelf && this.state.numberOfPlayers === 5) {
      return (
        <PlayerSelector
          players={this.props.players}
          label="Partner:"
        />
      );
    }
  }

  private renderOppositionSelectors() {
    const opposition = [(
      <PlayerSelector
        players={this.props.players}
        label="Player 1:"
      />
    )];
    if (this.state.numberOfPlayers >= 4) {
      opposition.push(
        <PlayerSelector
          players={this.props.players}
          label="Player 2:"
        />
      );
    }
    if (this.state.numberOfPlayers === 5) {
      opposition.push(
        <PlayerSelector
          players={this.props.players}
          label="Player 3:"
        />
      );
      if (this.state.bidderCalledSelf) {
        opposition.push(
          <PlayerSelector
            players={this.props.players}
            label="Player 4:"
          />
        );
      }
    }
    return opposition;
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