import { Button, HTMLTable, Tag } from "@blueprintjs/core";
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
}

class LobbyInternal extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const validPlayerId = props.gamePlayer != null && props.players.has(props.gamePlayer.playerId);
    this.state = {
      isPlayerDialogOpen: !validPlayerId,
    };
  }

  public componentWillMount() {
    this.props.dispatchers.lobby.socketConnect();
  }

  public componentWillUnmount(): void {
    this.props.dispatchers.lobby.socketClose();
  }

  public render() {
    const openGames = LobbySelectors.getOpenGames(this.props.games);
    const inProgressGames = LobbySelectors.getInProgressGames(this.props.games);
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
        />
        <Button
          className='new-game-button'
          icon={IconNames.ADD}
          onClick={this.newGame}
          text='New Game'
        />
        <h1>Open Games</h1>
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
                <td>{game.state === "completed" ? " " :
                  <Button icon={IconNames.ADD} onClick={() => this.playGame(game.id)} disabled={this.props.gamePlayer == null}>Join</Button>
                }</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        <h1>In Progress Games</h1>
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
                <td>{game.state === "completed" ? " " :
                  <Button icon={IconNames.EYE_OPEN} onClick={() => this.playGame(game.id)} disabled={this.props.gamePlayer == null}>Watch</Button>
                }</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        <LobbyPlayerDialog
          isOpen={this.state.isPlayerDialogOpen}
          playerId={undefined}
          players={this.props.players}
          onConfirm={this.handlePlayerConfirmed}
        />
      </div>
    )
  }

  private renderPlayers(players: string[]) {
    return (
      <div className='player-tags'>
        {players.map((player) => {
          return (
            <Tag
              className='player-tag'
              key={player}
              icon={IconNames.PERSON}
              minimal
            >
              {player}
            </Tag>
          );
        })}
      </div>
    );
  }

  private openPlayerDialog = () => {
    this.setState({
      isPlayerDialogOpen: true,
    });
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

  private setName = (name: string) => {
    if (name.length === 0) {
      this.props.dispatchers.gamePlayer.set(null);
    } else {
      this.props.dispatchers.gamePlayer.set({ playerId: name });
    }
  };

  private newGame = () => {
    this.props.dispatchers.lobby.newGame();
  };

  private playGame = (id: string) => {
    if (this.props.gamePlayer) {
      history.push(DynamicRoutes.play(this.props.gamePlayer.playerId, id));
    }
  };
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
