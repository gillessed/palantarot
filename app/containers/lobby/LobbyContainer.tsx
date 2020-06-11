import { Button, Classes, HTMLTable, Intent, Tab, Tabs, Tag } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import moment from "moment";
import React from "react";
import { connect } from 'react-redux';
import { Player } from '../../../server/model/Player';
import { GameDescription } from '../../../server/play/GameDescription';
import { loadContainer } from "../../containers/LoadingContainer";
import history from '../../history';
import { GameplayState } from '../../play/state';
import { DynamicRoutes } from "../../routes";
import { Dispatchers } from "../../services/dispatchers";
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { LobbySelectors } from '../../services/lobby/LobbySelectors';
import { lobbyLoader } from '../../services/lobby/LobbyService';
import { playersLoader } from '../../services/players/index';
import { getPlayerName } from '../../services/players/playerName';
import { ReduxState } from '../../services/rootReducer';
import './LobbyContainer.scss';
import { LobbyPlayerDialog } from "./LobbyPlayerDialog";

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

const StateMap: { [key: string]: string } = {
  [GameplayState.NewGame]: 'New Game',
  [GameplayState.Bidding]: 'Bidding',
  [GameplayState.PartnerCall]: 'Partner Call',
  [GameplayState.DogReveal]: 'Dog Reveal',
  [GameplayState.Playing]: 'Playing',
  [GameplayState.Completed]: 'Completed',
}

interface State {
  isPlayerDialogOpen: boolean;
  selectedTabId: string;
}

class LobbyInternal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const validPlayerId = props.gamePlayer != null && props.players.has(props.gamePlayer.playerId);
    this.state = {
      isPlayerDialogOpen: !validPlayerId,
      selectedTabId: LobbyTabs.OpenGames,
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
      </div>
    )
  }

  private renderOpenGames = () => {
    const openGames = LobbySelectors.getOpenGames(this.props.games);
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
          </tr>
        </thead>
        <tbody>
          {openGames.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{moment(game.dateCreated).fromNow()}</td>
              <td>{this.renderPlayers(game.players)}</td>
              <td>
                <Button icon={IconNames.ADD} onClick={() => this.playGame(game.id)} disabled={this.props.gamePlayer == null}>Join</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private renderInProgressGames = () => {
    const inProgressGames = LobbySelectors.getInProgressGames(this.props.games);
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
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{moment(game.dateCreated).fromNow()}</td>
              <td>{StateMap[game.state]}</td>
              <td>{this.renderPlayers(game.players)}</td>
              <td>{moment(game.lastUpdated).fromNow()}</td>
              <td>
                <Button icon={IconNames.EYE_OPEN} onClick={() => this.playGame(game.id)} disabled={this.props.gamePlayer == null}>Watch</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private renderCompletedGames = () => {
    const completedGames = LobbySelectors.getCompletedGames(this.props.games);
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
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{moment(game.dateCreated).fromNow()}</td>
              <td>{StateMap[game.state]}</td>
              <td>{this.renderPlayers(game.players)}</td>
              <td>{moment(game.lastUpdated).fromNow()}</td>
              <td>
                <Button icon={IconNames.EYE_OPEN} onClick={() => this.playGame(game.id)} disabled={this.props.gamePlayer == null}>Watch</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    );
  }

  private renderPlayers(playerIds: string[]) {
    const { players, gamePlayer } = this.props;
    return (
      <div className='player-tags'>
        {playerIds.map((playerId) => {
          const player = players.get(playerId);
          const playerName = getPlayerName(player);
          const isGamePlayer = playerId === gamePlayer?.playerId;
          return (
            <Tag
              className='player-tag'
              key={playerId}
              icon={IconNames.PERSON}
              intent={isGamePlayer ? Intent.SUCCESS : Intent.PRIMARY}
            >
              {playerName}
            </Tag>
          );
        })}
      </div>
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
    this.props.dispatchers.lobby.newGame();
  };

  private playGame = (id: string) => {
    if (this.props.gamePlayer) {
      history.push(DynamicRoutes.play(this.props.gamePlayer.playerId, id));
    }
  };

  private handleTabChange = (tabId: string) => {
    this.setState({ selectedTabId: tabId });
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
