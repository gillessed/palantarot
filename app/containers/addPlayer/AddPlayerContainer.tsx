import * as React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../services/rootReducer';
import { AddPlayerForm } from '../../components/forms/AddPlayerForm';
import { NewPlayer } from '../../../server/model/Player';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { AddPlayerService } from '../../services/addPlayer/index';
import { Palantoaster, TIntent } from '../../components/toaster/Toaster';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { Dispatchers } from '../../services/dispatchers';
import { StaticRoutes } from '../../routes';

interface StateProps {
  addPlayerService: AddPlayerService,
}

type Props = StateProps;

interface State {
  numberOfPlayers: 5,
}

export class Internal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      numberOfPlayers: 5,
    };
  }

  public componentWillMount() {
    this.dispatchers.players.request(undefined);
  }

  public componentWillReceiveProps = (nextProps: Props) => {
    if (nextProps.addPlayerService.error && nextProps.addPlayerService.error !== this.props.addPlayerService.error) {
      Palantoaster.show({
        message: nextProps.addPlayerService.error.message,
        intent: TIntent.DANGER,
      });
      this.dispatchers.addPlayer.clear();
    } else if (nextProps.addPlayerService.newPlayer && nextProps.addPlayerService.newPlayer !== this.props.addPlayerService.newPlayer) {
      const player = nextProps.addPlayerService.newPlayer;
      Palantoaster.show({
        message: `Added player ${player.firstName} ${player.lastName}.`,
        intent: TIntent.SUCCESS,
      });
      if (nextProps.addPlayerService.redirect) {
        const redirect = nextProps.addPlayerService.redirect;
        this.dispatchers.addPlayer.clear();
        this.dispatchers.navigation.push(redirect);
      }
    }
  }

  public render() {
    return (
      <div className='add-player-container page-container'>
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
          this.dispatchers.addPlayer.request({newPlayer, redirect: StaticRoutes.home()});
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

export const AddPlayerContainer = connect(mapStateToProps)(Internal);