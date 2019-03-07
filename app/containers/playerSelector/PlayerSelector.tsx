import * as React from 'react';
import { Player, NewPlayer } from '../../../server/model/Player';
import { Dialog, Checkbox, Alignment, FormGroup, InputGroup, Intent } from '@blueprintjs/core';
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
  recentPlayers?: Player[];
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
    const label = (
      <p style={{ marginBottom: 0 }}>
        {this.props.label} 
        <a className='bp3-link add-player-link' onClick={this.openDialog}>
          Add Player
        </a>
      </p>
    );
    return (
      <>
        <FormGroup
          label={label}
          labelFor='player-selector-element'
          helperText={this.props.player.error}
          intent={this.props.player.error ? Intent.DANGER : Intent.NONE}
        >
          <div className='bp3-select tarot-player-selector-select'>
            <select value={this.props.player.player ? this.props.player.player.id : ''} onChange={this.onChange}>
              {this.renderOptions()}
            </select>
          </div>
        </FormGroup>
        <div className='player-selector-checkbox-row'>
          <Checkbox
            alignIndicator={Alignment.LEFT}
            onChange={this.onShowedTrumpChanged}
            checked={this.props.player.showed}
          >
            <span className='text player-selector-check-label'>Showed Trump</span>
          </Checkbox>
          <Checkbox
            alignIndicator={Alignment.LEFT}
            onChange={this.onOneLastChanged}
            checked={this.props.player.oneLast}
          >
            <span className='text player-selector-check-label'>One Last</span>
          </Checkbox>
        </div>
        {this.renderDialog()}
      </>
    );
  }

  private renderOptions(): JSX.Element[] {
    const elements: JSX.Element[] = [];
    elements.push(<option key='empty' value=''></option>);
    if (this.props.recentPlayers) {
      const recentPlayersGroup = (
        <optgroup key='opt1' label='Recent Players'>
          {this.props.recentPlayers.map(this.renderPlayerOption)}
        </optgroup>
      );
      elements.push(recentPlayersGroup);
      const otherPlayersGroup = (
        <optgroup key='opt2' label='Others'>
          {this.props.players.map(this.renderPlayerOption)}
        </optgroup>
      );
      elements.push(otherPlayersGroup);
    } else {
      elements.push(...this.props.players.map(this.renderPlayerOption));
    }
    return elements;
  }

  private renderErrorText() {
    if (this.props.player.error) {
      return <div className='bp3-form-helper-text'>{this.props.player.error}</div>;
    }
  }

  private renderDialog() {
    return (
      <Dialog
        icon='add'
        isOpen={this.state.openDialog}
        onClose={this.closeDialog}
        title='Add Player'
      >
        <div className='bp3-dialog-body'>
          <AddPlayerForm
            onSubmit={this.onAddNewPlayer}
          />
          {this.renderDialogSpinner()}
        </div>
      </Dialog>
    );
  }

  private onAddNewPlayer(newPlayer: NewPlayer) {
    this.dispatchers.addPlayer.request({ newPlayer, source: this.props.label });
  }

  private renderDialogSpinner() {
    if (this.props.addPlayerService.loading) {
      return <SpinnerOverlay text='Adding Player...' />;
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

  private renderPlayerOption(player: Player): JSX.Element {
    return <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>;
  }

  private onChange = (e: { target: { value: string } }) => {
    const allPlayers = [...this.props.players];
    if (this.props.recentPlayers) {
      allPlayers.push(...this.props.recentPlayers);
    }
    const player = allPlayers.find((player: Player) => {
      return player.id === e.target.value;
    });
    this.props.onChange({
      ...this.props.player,
      player,
    });
  }

  private onShowedTrumpChanged = (e: any) => {
    this.props.onChange({
      ...this.props.player,
      showed: e.target.checked,
    })
  }

  private onOneLastChanged = (e: any) => {
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
