import React, {FormEvent, KeyboardEvent} from "react";
import {DispatchContext, DispatchersContextType} from "../../dispatchProvider";
import {Dispatchers} from "../../services/dispatchers";
import {ReduxState} from "../../services/rootReducer";
import {InGameState} from "./InGameService";
import {connect} from "react-redux";
import {Button} from "@blueprintjs/core";
import {EventList} from "./EventList";

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

interface State {
  actionText: string
}

type Props = OwnProps & StateProps;

class InGameInternal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      actionText: "",
    }
  }

  render() {
    return (
      <div>
        {this.props.match.params.gameId}-{this.props.match.params.player}
        <EventList
          player={this.props.match.params.player}
          events={this.props.game.events}
        />
        <div>
          Action:
          <input onInput={this.setActionText} onKeyUp={this.actionKeyPress} />
          <Button icon="key-enter" text="Send" onClick={this.submitAction} />
        </div>
      </div>
    )
  }

  private setActionText = (event: FormEvent<HTMLInputElement>) => {
      this.setState({
        actionText: event.currentTarget.value,
      })
  };

  private actionKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      this.submitAction();
    }
  };

  private submitAction = () => {
    try {
      this.dispatchers.ingame.playAction(JSON.parse(this.state.actionText))
    } catch (e) {
      this.dispatchers.ingame.actionError(e);
    }
  };

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