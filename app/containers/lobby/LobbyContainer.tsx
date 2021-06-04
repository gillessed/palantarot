import { Button, Classes, HTMLTable, Intent, Tab, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from "react";
import { connect } from 'react-redux';
import { Player } from '../../../server/model/Player';
import { GameDescription } from '../../../server/play/GameDescription';
import { loadContainer } from "../../containers/LoadingContainer";
import history from '../../history';
import { DynamicRoutes } from "../../routes";
import { Dispatchers } from "../../services/dispatchers";
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { LobbySelectors } from '../../services/lobby/LobbySelectors';
import { lobbyLoader } from '../../services/lobby/LobbyService';
import { playersLoader } from '../../services/players/index';
import { getPlayerName } from '../../services/players/playerName';
import { ReduxState } from '../../services/rootReducer';
import { CompletedGameRow } from './CompletedGameRow';
import { GameSettingsDialog } from './GameSettingsDialog';
import { InProgressGameRow } from './InProgressGameRow';
import './LobbyContainer.scss';
import { LobbyPlayerDialog } from "./LobbyPlayerDialog";
import { OpenGameRow } from './OpenGameRow';
;
enum LobbyTabs {
  OpenGames = 'open-games',
  InProgressGames = 'in-progress-games',
  CompletedGames = 'completed-games',
}

interface OwnProps {
  games: Map<string, GameDescription>;
  players: Map<string, Player>;
  dispatchers: Dispatchers;
}

interface StoreProps {
  gamePlayer: GamePlayer | null;
}

type Props = OwnProps & StoreProps;

interface State {
  isPlayerDialogOpen: boolean;
  isGameSettingsDialogOpen: boolean;
  selectedTabId: string;
}

class LobbyInternal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const validPlayerId = props.gamePlayer != null && props.players.has(props.gamePlayer.playerId);
    this.state = {
      isPlayerDialogOpen: !validPlayerId,
      selectedTabId: LobbyTabs.OpenGames,
      isGameSettingsDialogOpen: false,
    };
  }

  public componentWillMount() {
    this.props.dispatchers.lobby.socketConnect();
  }

  public componentWillUnmount(): void {
    this.props.dispatchers.lobby.socketClose();
  }

  public render() {
    const player = this.props.gamePlayer ? this.props.players.get(this.props.gamePlayer.playerId) : undefined;
    return (
      <div className='page-container'>
        <h1 className='bp3-heading'>
          Lobby
        </h1>
        <Button
          className='user-select-button'
          icon={IconNames.USER}
          onClick={this.openPlayerDialog}
          text={player ? getPlayerName(player) : ''}
          intent={Intent.SUCCESS}
        />
        <Button
          className='new-game-button'
          icon={IconNames.ADD}
          onClick={this.newGame}
          text='New Game'
          intent={Intent.PRIMARY}
        />
        <Tabs
          id='lobby-tab'
          className='lobby-tab-container'
          onChange={this.handleTabChange}
          selectedTabId={this.state.selectedTabId}
        >
          <Tab id={LobbyTabs.OpenGames} title='Open Games' panel={this.renderOpenGames()} />
          <Tab id={LobbyTabs.InProgressGames} title='In Progress Games' panel={this.renderInProgressGames()} />
          <Tab id={LobbyTabs.CompletedGames} title='Completed Games' panel={this.renderCompletedGames()} />
        </Tabs>
        <LobbyPlayerDialog
          isOpen={this.state.isPlayerDialogOpen}
          playerId={player?.id}
          players={this.props.players}
          onConfirm={this.handlePlayerConfirmed}
          onClose={this.closePlayerDialog}
        />
        <GameSettingsDialog
          isOpen={this.state.isGameSettingsDialogOpen}
          onClose={this.closeGameSettingsDialog}
          dispatchers={this.props.dispatchers}
        />
      </div>
    )
  }

  private renderOpenGames = () => {
    const { games, gamePlayer, players } = this.props;
    const openGames = LobbySelectors.getOpenGames(games);
    if (openGames.length === 0) {
      return (
        <div className='no-games-container'>
          <h4 className={Classes.HEADING}>No open games found. Press 'New Game' to start a new game.</h4>
        </div>
      );
    }
    return (
      <HTMLTable>
        <thead>
          <tr>
            <th>Game ID</th>
            <th>Created</th>
            <th>Players</th>
            <th>Join Game</th>
            <th>Settings</th>
          </tr>
        </thead>
        <tbody>
          {openGames.map((game) => (
            <OpenGameRow
              key={game.id}
              game={game}
              gamePlayer={gamePlayer}
              players={players}
              playGame={this.playGame}
            />
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private renderInProgressGames = () => {
    const { games, gamePlayer, players } = this.props;
    const inProgressGames = LobbySelectors.getInProgressGames(games);
    if (inProgressGames.length === 0) {
      return (
        <div className='no-games-container'>
          <h4 className={Classes.HEADING}>No games in progress found.</h4>
        </div>
      );
    }
    return (
      <HTMLTable>
        <thead>
          <tr>
            <th>Game ID</th>
            <th>Created</th>
            <th>Status</th>
            <th>Players</th>
            <th>Last Action</th>
            <th>Watch Game</th>
          </tr>
        </thead>
        <tbody>
          {inProgressGames.map((game) => (
            <InProgressGameRow
              key={game.id}
              game={game}
              gamePlayer={gamePlayer}
              players={players}
              playGame={this.playGame}
            />
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private renderCompletedGames = () => {
    const { games, gamePlayer, players } = this.props;
    const completedGames = LobbySelectors.getCompletedGames(games);
    if (completedGames.length === 0) {
      return (
        <div className='no-games-container'>
          <h4 className={Classes.HEADING}>No completed games found.</h4>
        </div>
      );
    }
    return (
      <HTMLTable>
        <thead>
          <tr>
            <th>Game ID</th>
            <th>Players</th>
            <th>Finished</th>
          </tr>
        </thead>
        <tbody>
          {completedGames.map((game) => (
            <CompletedGameRow
              key={game.id}
              game={game}
              gamePlayer={gamePlayer}
              players={players}
              playGame={this.playGame}
            />
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private openPlayerDialog = () => {
    this.setState({ isPlayerDialogOpen: true });
  }

  private closePlayerDialog = () => {
    this.setState({ isPlayerDialogOpen: false });
  }

  private handlePlayerConfirmed = (playerId: string) => {
    const validPlayerId = this.props.players.has(playerId);
    if (validPlayerId) {
      this.props.dispatchers.gamePlayer.set({ playerId });
      this.setState({
        isPlayerDialogOpen: false,
      });
    }
  }
  private newGame = () => {
    this.setState({ isGameSettingsDialogOpen: true });
  };

  private playGame = (id: string) => {
    if (this.props.gamePlayer) {
      history.push(DynamicRoutes.play(id));
    }
  };

  private handleTabChange = (tabId: string) => {
    this.setState({ selectedTabId: tabId });
  }

  private closeGameSettingsDialog = () => {
    this.setState({ isGameSettingsDialogOpen: false });
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
    gamePlayer: state.gamePlayer,
  };
};

const connectRedux = connect<StoreProps, {}, OwnProps>(mapStateToProps);

export const LobbyContainer = loadContainer({
  games: lobbyLoader,
  players: playersLoader,
}, { hideSpinnerOnReload: true })(connectRedux(LobbyInternal));
