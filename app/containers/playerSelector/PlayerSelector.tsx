import * as React from 'react';
import { Player, NewPlayer } from '../../../server/model/Player';
import { Dialog } from '@blueprintjs/core';
import { AddPlayerForm } from '../../components/forms/AddPlayerForm';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { AddPlayerService } from '../../services/addPlayer/index';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';

export interface PlayerState {
  role: string;
  player?: Player;
  error?: string;
  showed: boolean;
  oneLast: boolean;
}

interface OwnProps {
  role: string;
  player: PlayerState;
  label: string;
  players: Player[];
  onChange: (player: PlayerState) => void;
}

interface StateProps {
  addPlayerService: AddPlayerService;
}

type Props = OwnProps & StateProps;

interface State {
  openDialog: boolean;
}

export class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;
  
  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      openDialog: false,
    }
  }

  public componentWillUpdate(nextProps: Props) {
    if (
      nextProps.addPlayerService.source === nextProps.label
      && nextProps.addPlayerService.error
      && nextProps.addPlayerService.error !== this.props.addPlayerService.error
    ) {
      Palantoaster.show({
        message: nextProps.addPlayerService.error.message,
        intent: TIntent.DANGER,
      });
    } else if (
      nextProps.addPlayerService.source === nextProps.label
      && nextProps.addPlayerService.newPlayer
      && nextProps.addPlayerService.newPlayer !== this.props.addPlayerService.newPlayer
    ) {
      const player = nextProps.addPlayerService.newPlayer;
      Palantoaster.show({
        message: `Added player ${player.firstName} ${player.lastName}.`,
        intent: TIntent.SUCCESS,
      });
      this.props.onChange({
        ...this.props.player,
        player,
      });
      this.closeDialog();
      this.dispatchers.addPlayer.clear();
    }
  }

  public componentWillUnmount() {
    this.props.onChange({
      role: this.props.role,
      player: undefined,
      error: undefined,
      showed: false,
      oneLast: false,
    });
  }

  public render() {
    return (
      <div className={`tarot-player-selector-input-group pt-form-group ${this.props.player.error ? 'pt-intent-danger' : ''}`}>
        <label
          className='tarot-player-selector-label pt-label'
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
           <p style={{marginBottom: 0}}>{this.props.label} <a className='pt-link add-player-link' onClick={this.openDialog}>Add Player</a></p>
        </label>
        <div className='tarot-player-selector-content pt-form-content'>
          <div className={`tarot-player-selector-group pt-input-group ${this.props.player.error ? 'pt-intent-danger' : ''}`}>
            <div className='pt-select tarot-player-selector-select'>
              <select value={this.props.player.player ? this.props.player.player.id : ''} onChange={this.onChange}>
                <option value=''></option>
                {this.props.players.map(this.renderPlayerOption)}
              </select>
            </div>
          </div>
        </div>
        {this.renderErrorText()}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
          }}
        >
          <label className='pt-control pt-checkbox .modifier' style={{marginRight: 30}}>
            <input
              type='checkbox'
              onChange={this.onShowedTrumpChanged}
              checked={this.props.player.showed}
            />
            <span className='pt-control-indicator'></span>
            <span className='text player-selector-check-label'>Showed Trump</span>
          </label>
          <label className='pt-control pt-checkbox .modifier'>
            <input
              type='checkbox'
              onChange={this.onOneLastChanged}
              checked={this.props.player.oneLast}
            />
            <span className='pt-control-indicator'></span>
            <span className='text player-selector-check-label'>One Last</span>
          </label>
        </div>
        {this.renderDialog()}
      </div>
    );
  }

  private renderErrorText() {
    if (this.props.player.error) {
      return <div className='pt-form-helper-text'>{this.props.player.error}</div>;
    }
  }

  private renderDialog() {
    return (
      <Dialog
        iconName='add'
        isOpen={this.state.openDialog}
        onClose={this.closeDialog}
        title='Add Player'
      >
        <div className='pt-dialog-body'>
          <AddPlayerForm
            onSubmit={(newPlayer: NewPlayer) => {
              this.dispatchers.addPlayer.request({newPlayer, source: this.props.label});
            }}
          />
          {this.renderDialogSpinner()}
        </div>
      </Dialog>
    );
  }

  private renderDialogSpinner() {
    if (this.props.addPlayerService.loading) {
      return <SpinnerOverlay text='Adding Player...'/>;
    }
  }

  private closeDialog = () => {
    this.setState({
      openDialog: false,
    });
  }

  private openDialog = () => {
    this.setState({
      openDialog: true,
    });
  }

  private renderPlayerOption(player: Player) {
    return <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>;
  }

  private onChange = (e: {target: {value: string}}) => {
    const player = this.props.players.find((player: Player) => {
      return player.id === e.target.value;
    });
    this.props.onChange({
      ...this.props.player,
      player,
    });
  }

  private onShowedTrumpChanged = (e: {target: {checked: boolean}}) => {
    this.props.onChange({
      ...this.props.player,
      showed: e.target.checked,
    })
  }

  private onOneLastChanged = (e: {target: {checked: boolean}}) => {
    this.props.onChange({
      ...this.props.player,
      oneLast: e.target.checked,
    })
  }
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps) => {
  return {
    ...ownProps,
    addPlayerService: state.addPlayer,
  } as OwnProps & StateProps;
}

export const PlayerSelector = connect(mapStateToProps)(Internal);