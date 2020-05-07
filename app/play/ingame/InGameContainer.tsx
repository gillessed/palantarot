import React from "react";
import {DispatchContext, DispatchersContextType} from "../../dispatchProvider";
import {Dispatchers} from "../../services/dispatchers";
import {ReduxState} from "../../services/rootReducer";
import {InGameState} from "./InGameService";
import {connect} from "react-redux";

interface OwnProps {
  match: {
    params: {
      gameId: string
      player: string
    }
  }
}

interface StateProps {
  game: InGameState
}

type Props = OwnProps & StateProps;

class InGameInternal extends React.PureComponent<Props> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
  }

  render() {
    return (
      <div>
        {this.props.match.params.gameId}-{this.props.match.params.player}
        // TODO FILL IN!
      </div>
    )
  }

  public componentWillMount() {
    this.dispatchers.ingame.joinGame(
      this.props.match.params.player, this.props.match.params.gameId);
  }

  public componentWillUnmount() {
    this.dispatchers.ingame.exitGame();
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    game: state.ingame,
  }
};

export const InGameContainer = connect(mapStateToProps)(InGameInternal);