import {GameDescription} from "../common";
import React from "react";
import {Button, HTMLTable} from "@blueprintjs/core";
import moment from "moment";
import {lobbyLoader} from "./LobbyService";
import {loadContainer} from "../../containers/LoadingContainer";
import {Dispatchers} from "../../services/dispatchers";
import {DynamicRoutes} from "../../routes";
import history from '../../history';

interface Props {
  games: Map<string, GameDescription>
  dispatchers: Dispatchers;
}

class LobbyInternal extends React.PureComponent<Props> {
  private refresher: NodeJS.Timer;
  constructor(props: Props) {
    super(props);
  }

  public componentWillMount() {
    this.refresher = setInterval(() => this.props.dispatchers.lobby.request(), 10000);
  }

  public componentWillUnmount(): void {
    clearInterval(this.refresher);
  }

  public render() {
    return (
      <div className='page-container'>
        <h1 className='bp3-heading'>Lobby</h1>
        <Button icon='new-object' onClick={this.newGame}>New Game</Button>
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
            {[...this.props.games.entries()].map(([id, game]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{game.state}</td>
                <td>{game.players.join(", ")}</td>
                <td>{moment(game.last_updated).fromNow()}</td>
                <td>{game.state === "completed" ? " " :
                  <Button icon='add' onClick={() => this.playGame(id)}>Join</Button>
                }</td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </div>
    )
  }

  private newGame = () => {
    this.props.dispatchers.lobby.newGame()
  };

  private playGame = (id: string) => {
    history.push(DynamicRoutes.play(id))
  };
}

export const LobbyContainer = loadContainer({
  games: lobbyLoader,
})(LobbyInternal);
