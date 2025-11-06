import { Alignment, Checkbox, Dialog, FormGroup, Intent } from "@blueprintjs/core";
import React from "react";
import { connect } from "react-redux";
import { NewPlayer, Player } from "../../../server/model/Player";
import { AddPlayerForm } from "../../components/forms/AddPlayerForm";
import { PlayerSelectContainer } from "../../components/forms/PlayerSelect";
import { SpinnerOverlay } from "../../components/spinnerOverlay/SpinnerOverlay";
import { Palantoaster, TIntent } from "../../components/toaster/Toaster";
import { DispatchContext, DispatchersContextType } from "../../dispatchProvider";
import { AddPlayerService } from "../../services/addPlayer/index";
import { Dispatchers } from "../../services/dispatchers";
import { getPlayerName } from "../../services/players/playerName";
import { ReduxState } from "../../services/rootReducer";

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
  selectedPlayers?: Player[];
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

class GamePlayerInputInternal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      openDialog: false,
    };
  }

  public componentWillUpdate(nextProps: Props) {
    if (
      nextProps.addPlayerService.source === nextProps.label &&
      nextProps.addPlayerService.error &&
      nextProps.addPlayerService.error !== this.props.addPlayerService.error
    ) {
      Palantoaster.show({
        message: nextProps.addPlayerService.error.message,
        intent: TIntent.DANGER,
      });
    } else if (
      nextProps.addPlayerService.source === nextProps.label &&
      nextProps.addPlayerService.newPlayer &&
      nextProps.addPlayerService.newPlayer !== this.props.addPlayerService.newPlayer
    ) {
      const player = nextProps.addPlayerService.newPlayer;
      Palantoaster.show({
        message: `Added player ${getPlayerName(player)}.`,
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
        <a className="bp3-link add-player-link" onClick={this.openDialog}>
          Add Player
        </a>
      </p>
    );
    return (
      <div className="player-input-container">
        <FormGroup
          label={label}
          labelFor="player-selector-element"
          helperText={this.props.player.error}
          intent={this.props.player.error ? Intent.DANGER : Intent.NONE}
        >
          <PlayerSelectContainer
            recentPlayers={this.props.recentPlayers}
            onPlayerSelected={this.onSelectPlayer}
            selectedPlayers={this.props.selectedPlayers}
            selectedPlayer={this.props.player.player}
          />
        </FormGroup>
        <div className="player-selector-checkbox-row">
          <Checkbox
            alignIndicator={Alignment.LEFT}
            onChange={this.onShowedTrumpChanged}
            checked={this.props.player.showed}
          >
            <span className="text player-selector-check-label">Showed Trump</span>
          </Checkbox>
          <Checkbox
            alignIndicator={Alignment.LEFT}
            onChange={this.onOneLastChanged}
            checked={this.props.player.oneLast}
          >
            <span className="text player-selector-check-label">One Last</span>
          </Checkbox>
        </div>
        {this.renderDialog()}
      </div>
    );
  }

  private renderDialog() {
    return (
      <Dialog icon="add" isOpen={this.state.openDialog} onClose={this.closeDialog} title="Add Player">
        <div className="bp3-dialog-body">
          <AddPlayerForm onSubmit={this.onAddNewPlayer} />
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
      return <SpinnerOverlay text="Adding Player..." />;
    }
  }

  private closeDialog = () => {
    this.setState({
      openDialog: false,
    });
  };

  private openDialog = () => {
    this.setState({
      openDialog: true,
    });
  };

  private onSelectPlayer = (player: Player | undefined) => {
    this.props.onChange({
      ...this.props.player,
      player,
    });
  };

  private onShowedTrumpChanged = (e: any) => {
    this.props.onChange({
      ...this.props.player,
      showed: e.target.checked,
    });
  };

  private onOneLastChanged = (e: any) => {
    this.props.onChange({
      ...this.props.player,
      oneLast: e.target.checked,
    });
  };
}

const mapStateToProps = (state: ReduxState, ownProps: OwnProps) => {
  return {
    ...ownProps,
    addPlayerService: state.addPlayer,
  } as OwnProps & StateProps;
};

export const GamePlayerInput = connect(mapStateToProps)(GamePlayerInputInternal);
