import React from "react";
import {DispatchContext, DispatchersContextType} from "../../dispatchProvider";
import {Dispatchers} from "../../services/dispatchers";
import {ReduxState} from "../../services/rootReducer";
import {InGameState} from "./InGameService";
import {connect} from "react-redux";
import {EventList} from "./EventList";
import {Action, ActionType, GameplayState} from "../common";
import {renderCards} from "./Cards";
import {
  InputAckTrumpShow,
  InputBid,
  InputCallPartner,
  InputMessage,
  InputPlayCard,
  InputSetDog,
  NoStateInput
} from "./ActionInputs";

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

interface State {}

type Props = OwnProps & StateProps;

class InGameInternal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {}
  }

  public componentWillMount() {
    this.dispatchers.ingame.joinGame(
      this.props.match.params.player, this.props.match.params.gameId);
  }

  public componentWillUnmount() {
    this.dispatchers.ingame.exitGame();
  }

  public render() {
    return (
      <div>
        <EventList
          player={this.props.match.params.player}
          events={this.props.game.events}
        />
        <div>
          Hand: {renderCards(...this.props.game.state.hand)}
        </div><div>
          {this.stateToActions.get(this.props.game.state.state)?.map(this.renderInputParams)}
        </div>
      </div>
    )
  }

  private stateToActions = new Map<GameplayState, ActionType[]>([
    ["new_game", ["message", "enter_game", "mark_player_ready"]],
    ["bidding", ["message", "bid", "declare_slam", "show_trump", "ack_trump_show"]],
    ["partner_call", ["message", "call_partner", "declare_slam", "show_trump", "ack_trump_show"]],
    ["dog_reveal", ["message", "set_dog", "ack_dog", "declare_slam", "show_trump", "ack_trump_show"]],
    ["playing", ["message", "play_card", "declare_slam", "show_trump", "ack_trump_show"]],
    ["completed", ["message"]],
  ]);

  private submitAction = (action: Omit<Action, "player" | "time">) => {
    try {
      this.dispatchers.ingame.playAction({
        ...action,
        player: this.props.game.player,
        time: Date.now(),
      })
    } catch (e) {
      this.dispatchers.ingame.actionError(e);
    }
  };

  private renderInputParams = (actionType: ActionType) => {
    switch (actionType) {
      case "message":
        return <InputMessage key={actionType} submitAction={this.submitAction} />;
      case "bid":
        return <InputBid key={actionType} submitAction={this.submitAction} />;
      case "ack_trump_show":
        return <InputAckTrumpShow key={actionType} submitAction={this.submitAction} />;
      case "call_partner":
        return <InputCallPartner key={actionType} submitAction={this.submitAction} />;
      case "set_dog":
        return <InputSetDog key={actionType}
                            player={this.props.game.player}
                            submitAction={this.submitAction} />;
      case "play_card":
        return <InputPlayCard key={actionType}
                              hand={this.props.game.state.hand}
                              submitAction={this.submitAction} />;
      default:
        return <NoStateInput key={actionType}
                             type={actionType}
                             label={actionType.replace("_", " ")}
                             submitAction={this.submitAction} />;
    }
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    game: state.ingame,
  }
};

export const InGameContainer = connect(mapStateToProps)(InGameInternal);