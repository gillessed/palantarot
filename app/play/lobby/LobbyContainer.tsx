import { Button, HTMLTable } from "@blueprintjs/core";
import moment from "moment";
import React from "react";
import { connect } from 'react-redux';
import { TextInput } from "../../components/forms/Elements";
import { loadContainer } from "../../containers/LoadingContainer";
import history from '../../history';
import { DynamicRoutes } from "../../routes";
import { Dispatchers } from "../../services/dispatchers";
import { GamePlayer } from '../../services/gamePlayer/GamePlayerTypes';
import { ReduxState } from '../../services/rootReducer';
import { GameDescription } from "../common";
import { lobbyLoader } from "./LobbyService";

interface OwnProps {
  games: Map<string, GameDescription>;
  dispatchers: Dispatchers;
}

interface StoreProps {
  gamePlayer: GamePlayer | null;
}

type Props = OwnProps & StoreProps;

class LobbyInternal extends React.PureComponent<Props> {
  private refresher: NodeJS.Timer;
  constructor(props: Props) {
    super(props);
  }

  public componentWillMount() {
    this.refresher = setInterval(() => this.props.dispatchers.lobby.request(), 15000);
  }

  public componentWillUnmount(): void {
    clearInterval(this.refresher);
  }

  public render() {
    return (
      <div className='page-container'>
        <h1 className='bp3-heading'>Lobby</h1>
        <Button icon='new-object' onClick={this.newGame}>New Game</Button>
        <TextInput label='Join Games As:' initialValue={this.props.gamePlayer?.playerId ?? ''} onChange={this.setName}/>
        Open/In Progress Games:
        <HTMLTable>
          <thead>
            <tr>
              <th>Game ID</th>
              <th>Status</th>
              <th>Players</th>
              <th>Last Action</th>
              <th>Join Game</th>
            </tr>
          </thead>
          <tbody>
            {[...this.props.games.entries()]
              .filter(([_, game]) => game.state !== "completed")
              .map(([id, game]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{game.state}</td>
                <td>{game.players.join(", ")}</td>
                <td>{moment(game.last_updated).fromNow()}</td>
                <td>{game.state === "completed" ? " " :
                  <Button icon='add' onClick={() => this.playGame(id)} disabled={this.props.gamePlayer == null}>Join</Button>
                }</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        Completed Games:
        <HTMLTable>
          <thead>
          <tr>
            <th>Game ID</th>
            <th>Status</th>
            <th>Players</th>
            <th>Last Action</th>
          </tr>
          </thead>
          <tbody>
          {[...this.props.games.entries()]
            .filter(([_, game]) => game.state === "completed")
            .map(([id, game]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{game.state}</td>
                <td>{game.players.join(", ")}</td>
                <td>{moment(game.last_updated).fromNow()}</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
    )
  }

  private setName = (name: string) => {
    if (name.length === 0) {
      this.props.dispatchers.gamePlayer.set(null);
    } else {
      this.props.dispatchers.gamePlayer.set({ playerId: name });
    }
  };

  private newGame = () => {
    this.props.dispatchers.lobby.newGame()
  };

  private playGame = (id: string) => {
    if (this.props.gamePlayer) {
      history.push(DynamicRoutes.play(this.props.gamePlayer.playerId, id))
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
})(connectRedux(LobbyInternal));
