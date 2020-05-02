import {GameDescription} from "../common";
import React from "react";
import {Button, HTMLTable} from "@blueprintjs/core";
import moment from "moment";
import {lobbyLoader} from "./LobbyService";
import {loadContainer} from "../../containers/LoadingContainer";

interface Props {
  games: Map<string, GameDescription>
}

class LobbyInternal extends React.PureComponent<Props, {}> {
  public componentWillMount() {
    setTimeout(() => window.location.reload(), 60000);
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
            </tr>
          </thead>
          <tbody>
            {[...this.props.games.entries()].map(([id, game]) => (
              <tr>
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

  private newGame() {
    // TODO
  }
}

export const LobbyContainer = loadContainer({
  games: lobbyLoader,
})(LobbyInternal);