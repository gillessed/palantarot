import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { playersActionCreators } from '../../services/players';
import { AddPlayerForm } from '../../components/forms/AddPlayerForm';
import { NewPlayer } from '../../../server/model/Player';
import { addNewPlayerActionCreators } from '../../services/addPlayer';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { AddPlayerService } from '../../services/addPlayer/index';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { push } from 'react-router-redux';

interface StateProps {
  addPlayerService: AddPlayerService,
}

interface DispatchProps {
  loadPlayers: () => void;
  addNewPlayer: (newPlayer: NewPlayer) => void;
  clear: () => void;
  push: (path: string) => void;
}

type Props = StateProps & DispatchProps;

interface State {
  numberOfPlayers: 5,
}

export class Internal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      numberOfPlayers: 5,
    };
  }

  public componentWillMount() {
    this.props.loadPlayers();
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.addPlayerService.error && nextProps.addPlayerService.error !== this.props.addPlayerService.error) {
      Palantoaster.show({
        message: nextProps.addPlayerService.error.message,
        intent: TIntent.DANGER,
      });
      this.props.clear();
    } else if (nextProps.addPlayerService.newPlayer && nextProps.addPlayerService.newPlayer !== this.props.addPlayerService.newPlayer) {
      const player = nextProps.addPlayerService.newPlayer;
      Palantoaster.show({
        message: `Added player ${player.firstName} ${player.lastName}.`,
        intent: TIntent.SUCCESS,
      });
      if (nextProps.addPlayerService.redirect) {
        const redirect = nextProps.addPlayerService.redirect;
        this.props.clear();
        this.props.push(redirect);
      }
    }
  }

  public render() {
    return (
      <div className='add-player-container pt-ui-text-large'>
        <div className='title'>
          <h1>Add Player</h1>
        </div>
        {this.renderContainer()}
        {this.renderSpinner()}
      </div>
    );
  }

  private renderSpinner() {
    if (this.props.addPlayerService.loading) {
      return (
        <SpinnerOverlay
          text="Adding Player..."
        />
      );
    }
  }

  private renderContainer() {
    return (
      <AddPlayerForm
        onSubmit={(newPlayer: NewPlayer) => {
          this.props.addNewPlayer(newPlayer);
        }}
      />
    );
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    addPlayerService: state.addPlayer,
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    loadPlayers: () => { dispatch(playersActionCreators.request(undefined)); },
    addNewPlayer: (newPlayer: NewPlayer) => { dispatch(addNewPlayerActionCreators.request({newPlayer, redirect: '/home'})); },
    clear: () => { dispatch (addNewPlayerActionCreators.clear(undefined)); },
    push: (path: string) => { dispatch(push(path)); },
  }
}

export const AddPlayerContainer = connect(mapStateToProps, mapDispatchToProps)(Internal);