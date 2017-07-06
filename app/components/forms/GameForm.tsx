import React from 'react';
import { Game, PlayerHand } from '../../../server/model/Game';
import { Player } from '../../../server/model/Player';
import { TextInput, SelectInput } from './Elements';
import { PlayerSelector, PlayerState } from '../../containers/playerSelector/PlayerSelector';

interface Props {
  players: Player[];
  game?: Game;
  onSubmit: (newGame: Game) => void;
}

const PlayerNames: {[key: string]: string} = {
  BIDDER: 'Bidder',
  PARTNER: 'Partner',
  PLAYER1: 'Player 1',
  PLAYER2: 'Player 2',
  PLAYER3: 'Player 3',
  PLAYER4: 'Player 4',
}

const OppositionNames = [
  PlayerNames.PLAYER1,
  PlayerNames.PLAYER2,
  PlayerNames.PLAYER3,
  PlayerNames.PLAYER4,
];

interface State {
  numberOfPlayers: number;
  bidderCalledSelf: boolean;
  players: {[key: string]: PlayerState},
  bidAmount?: number;
  bidAmountError?: string;
  points?: number;
  pointsError?: string;
}

export class GameForm extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    //TODO: initialize correctly if props.game is not null (for edit).
    const numberOfPlayers = 5;
    const players: {[key: string]: PlayerState} = {};
    this.getActivePlayersForValues(numberOfPlayers, false).forEach((name: string) => {
      players[name] = {
        name,
        showed: false,
        oneLast: false,
      };
    });

    this.state = {
      numberOfPlayers,
      bidderCalledSelf: false,
      players,
    };
  }

  private getActivePlayers = (): string[] => {
    return this.getActivePlayersForValues(this.state.numberOfPlayers, this.state.bidderCalledSelf);
  }

  private getActivePlayersForValues(numberOfPlayers: number, bidderCalledSelf: boolean): string[] {
    const activePlayers = [
      PlayerNames.BIDDER,
      PlayerNames.PLAYER1,
      PlayerNames.PLAYER2,
    ];
    if (numberOfPlayers === 5 && !bidderCalledSelf) {
      activePlayers.push(PlayerNames.PARTNER);
    }
    if (numberOfPlayers >= 4) {
      activePlayers.push(PlayerNames.PLAYER3);
    }
    if (numberOfPlayers === 5 && bidderCalledSelf) {
      activePlayers.push(PlayerNames.PLAYER4);
    }
    return activePlayers;
  }

  public render() {
    const calledSelfDisplay = this.state.numberOfPlayers === 5 ? 'flex' : 'none';
    return (
      <div className='game-form'>
        {this.renderPlayerNumberButtonRow()}
        <div className='card-container'>
          <div className='pt-card' style={{marginTop: 50}}>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <h3>Bidder's Team</h3>

              <label className='pt-control pt-checkbox pt-align-right' style={{marginRight: 10, display: calledSelfDisplay}}>
                <input
                  type='checkbox'
                  onChange={this.onCalledSelfPressed}
                  checked={this.state.bidderCalledSelf}
                />
                <span className='pt-control-indicator'></span>
                <span className='text'>Called Self</span>
              </label>
            </div>

            {this.renderPlayerSelector(PlayerNames.BIDDER)}

            <SelectInput
              classNames={['pt-game-bid-select']}
              label='Bid Amount:'
              values={['10', '20', '40', '80', '160'].map(item => ({value: item, display: item}))}
              onChange={this.onBidChanged}
              validator={(value: string) => {
                if (!value) {
                  return 'Must select a bid amount.';
                }
              }}
            />

            <TextInput
              label='Points:'
              classNames={['pt-game-points-input']}
              onChange={this.onPointsChanged}
              validator={(value: string) => {
                const number = +value;
                if (isNaN(number)) {
                  return 'Poinst must be a number.';
                }
                if (!Number.isInteger(number) || number % 10 != 0) {
                  return 'Points must be divisble by 10.';
                }
              }}
            />

            {this.renderPartnerSelector()}
          </div>

          <div className='pt-card' style={{marginTop: 50}}>
            <h3>Opposition</h3>
            {this.renderOppositionSelectors()}
          </div>
        </div>
        {this.renderSubmitButton()}
      </div>
    );
  }

  private renderPlayerSelector(playerName: string) {
    return (
      <PlayerSelector
        key={playerName}
        players={this.props.players}
        player={this.state.players[playerName]}
        label={`${playerName}:`}
        onChange={(player: PlayerState) => {
          const newPlayers ={...this.state.players};
          newPlayers[playerName] = player;
          this.setState({
            players: newPlayers,
          }, () => this.validatePlayers());
        }}
      />
    );
  }

  private renderSubmitButton() {
    const active = this.errorCount() === 0 && this.missingValues() === 0;
    const baseButtonClass = 'enter-score-button pt-button pt-large pt-intent-success pt-icon-manually-entered-data';
    const buttonClass = `${baseButtonClass} ${active ? '' : 'pt-disabled'}`;
    return (
      <div className='enter-score-button-container'>
        <button className={buttonClass} style={{marginTop: 20}} onClick={this.onSubmitPress}>
          Enter Score
        </button>
      </div>
    );
  }

  private getPointsEarned(basePoints: number, playerName: string) {
    if (playerName === PlayerNames.BIDDER) {
      if (this.state.numberOfPlayers === 3) {
        return basePoints * 2;
      } else if (this.state.numberOfPlayers === 4) {
        return basePoints * 3;
      } else {
        if (this.state.bidderCalledSelf) {
          return basePoints * 4;
        } else {
          return basePoints * 2;
        }
      }
    } else if (playerName === PlayerNames.PARTNER) {
      return basePoints;
    } else {
      return -basePoints;
    }
  }

  private onSubmitPress = () => {
    const playerHands: {[key: string]: PlayerHand} = {};
    const activePlayers = this.getActivePlayers();
    console.log(this.state.players);
    activePlayers.forEach((playerName) => {
      const player = this.state.players[playerName];
      playerHands[playerName] = {
        id: player.player!.id,
        handId: '',
        pointsEarned: this.getPointsEarned(
          this.state.points!,
          playerName,
        ),
        showedTrump: player.showed,
        oneLast: player.oneLast,
      };
    });
    const handData = {
      bidder: playerHands[PlayerNames.BIDDER],
      partner: playerHands[PlayerNames.PARTNER],
      opposition: OppositionNames.map((playerName: string) => {
        return playerHands[playerName];
      }).filter(hand => hand),
    }
    const bidderId = this.state.players[PlayerNames.BIDDER].player!.id;
    let partnerId = '';
    if (this.state.players[PlayerNames.PARTNER]) {
      partnerId = this.state.players[PlayerNames.PARTNER].player!.id;
    }

    const newGame: Game = {
      id: '',
      bidderId,
      partnerId,
      timestamp: '',
      numberOfPlayers: this.state.numberOfPlayers,
      bidAmount: this.state.bidAmount!,
      points: this.state.points!,
      slam: this.state.points! >= 270,
      handData,
    };
    this.props.onSubmit(newGame);
  }

  private renderPlayerNumberButtonRow() {
    return (
      <div className='player-selector-container pt-ui-text-large'>
        <div className='player-select-bar pt-button-group pt-large'>
          <a 
            className={`player-button pt-button pt-icon-people ${this.numberButtonEnabled(3)}`}
            onClick={() => {this.setPlayerCount(3)}}
            tabIndex={0}
            role='button'
          >
            3<span className='text hide-on-small'> Players</span>
          </a>
          <a
            className={`player-button pt-button pt-icon-people ${this.numberButtonEnabled(4)}`}
            onClick={() => {this.setPlayerCount(4)}}
            tabIndex={0}
            role='button'
          >
            4<span className='text hide-on-small'> Players</span>
          </a>
          <a
            className={`player-button pt-button pt-icon-people ${this.numberButtonEnabled(5)}`}
            onClick={() => {this.setPlayerCount(5)}}
            tabIndex={0}
            role='button'
          >
            5<span className='text hide-on-small'> Players</span>
          </a>
        </div>
      </div>
    );
  }

  private renderPartnerSelector() {
    if (!this.state.bidderCalledSelf && this.state.numberOfPlayers === 5) {
      return this.renderPlayerSelector(PlayerNames.PARTNER);
    }
  }

  private renderOppositionSelectors() {
    const opposition = [
      this.renderPlayerSelector(PlayerNames.PLAYER1),
      this.renderPlayerSelector(PlayerNames.PLAYER2),
    ];
    if (this.state.numberOfPlayers >= 4) {
      opposition.push(this.renderPlayerSelector(PlayerNames.PLAYER3));
      if (this.state.numberOfPlayers === 5 && this.state.bidderCalledSelf) {
        opposition.push(this.renderPlayerSelector(PlayerNames.PLAYER4));
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
      const calledSelf = count === 5 ? this.state.bidderCalledSelf : false;
      this.updateActivePlayers(count, calledSelf);
    }
  }

  private onPointsChanged = (points?: string, error?: string,) => {
    this.setState({
      points: points ? +points : undefined,
      pointsError: error,
    });
  }

  private onBidChanged = (bid?: string, error?: string,) => {
    this.setState({
      bidAmount: bid ? +bid : undefined,
      bidAmountError: error,
    });
  }

  private onCalledSelfPressed = (e: {target: {checked: boolean}}) => {
    this.updateActivePlayers(this.state.numberOfPlayers, e.target.checked);
  }

  private updateActivePlayers = (numberOfPlayers: number, bidderCalledSelf: boolean) => {
    const newPlayers: {[key: string]: PlayerState} = {};
    this.getActivePlayersForValues(numberOfPlayers, bidderCalledSelf).forEach((name: string) => {
      if (this.state.players[name]) {
        newPlayers[name] = this.state.players[name];
      } else {
        newPlayers[name] = {
          name,
          showed: false,
          oneLast: false,
        };
      }
    });
    this.setState({
      numberOfPlayers,
      bidderCalledSelf,
      players: newPlayers,
    }, () =>this. validatePlayers());
  }

  private getActivePlayerStates = () => {
    return this.getActivePlayers().map((name: string) => {
      return this.state.players[name];
    })
  }
  
  private validatePlayers = () => {
    const players = this.getActivePlayerStates();
    const sorted = players
      .sort((r1, r2) => {
        if (r1.player === undefined && r2.player === undefined) {
          return 0;
        } else if (r1.player === undefined) {
          return -1;
        } else if (r2.player === undefined) {
          return 1;
        } else {
          return `${r1.player.id}`.localeCompare(`${r2.player.id}`);
        }
      });
    const newPlayersArray = sorted
      .map((item, index) => {
        if (item.player === undefined) {
          return {duplicate: false, state: item};
        }
        if (index > 0 && item.player === sorted[index - 1].player) {
          return {duplicate: true, state: item};
        }
        if (index < sorted.length - 1 && item.player === sorted[index + 1].player) {
          return {duplicate: true, state: item};
        }
        return {duplicate: false, state: item};
      })
      .map((item) => {
        if (item.duplicate) {
          const player = item.state.player!;
          const error = `Player ${player.firstName} ${player.lastName} appears more than once.`;
          return {
            ...item.state,
            error
          };
        } else {
          return {
            ...item.state,
            error: undefined,
          };
        }
      });
    const newPlayers: {[key: string]: PlayerState} = {};
    newPlayersArray.forEach((newPlayer) => newPlayers[newPlayer.name] = newPlayer);
    this.setState({
      players: newPlayers,
    });
  }

  private errorCount = (): number => {
    return [
      this.state.bidAmountError,
      this.state.pointsError,
      ...this.getActivePlayers().map((name) => this.state.players[name].error),
    ].reduce((previous, current) => current ? previous + 1: previous, 0);
  }

  private missingValues = (): number => {
    const values: Array<any | undefined> = [
      this.state.bidAmount,
      this.state.points,
      ...this.getActivePlayers().map((name) => this.state.players[name].player),
    ];
    return values.reduce((previous, current) => current ? previous : previous + 1, 0);
  }
}