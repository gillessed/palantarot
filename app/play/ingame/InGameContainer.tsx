import React from "react";
import {DispatchContext, DispatchersContextType} from "../../dispatchProvider";
import {Dispatchers} from "../../services/dispatchers";
import {ReduxState} from "../../services/rootReducer";
import {InGameState} from "./InGameService";
import {connect} from "react-redux";
import {EventList} from "./EventList";
import {Action, ActionType, Card, GameplayState} from "../common";
import {SelectableCards} from "./Cards";
import {
  InputAckTrumpShow,
  InputBid,
  InputCallPartner,
  InputMessage,
  InputPlayCard,
  InputSetDog, InputShowTrump,
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

interface State {
  card_selection: Card[]
}

type Props = OwnProps & StateProps;

class InGameInternal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      card_selection: [],
    }
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
          Player Order: {this.props.game.state.player_order.join(", ")}
        </div><div>
          Hand:
          <SelectableCards cards={this.props.game.state.hand}
                           selected={this.state.card_selection}
                           onChange={this.setCardSelection} />
        </div><div>
          {this.stateToActions.get(this.props.game.state.state)?.map(this.renderInputParams)}
        </div>
      </div>
    )
  }

  private stateToActions = new Map<GameplayState, ActionType[]>([
    ["new_game", ["message", "enter_game", "leave_game", "mark_player_ready", "unmark_player_ready"]],
    ["bidding", ["message", "bid", "show_trump",]],
    ["partner_call", ["message", "call_partner", "declare_slam", "show_trump"]],
    ["dog_reveal", ["message", "set_dog", "ack_dog", "declare_slam", "show_trump"]],
    ["playing", ["message", "play_card", "declare_slam", "show_trump"]],
    ["completed", ["message"]],
  ]);

  private submitAction = (action: Omit<Action, "player" | "time">) => {
    try {
      this.dispatchers.ingame.playAction({
        ...action,
        player: this.props.game.player,
        time: Date.now(),
      });
      this.setState({
        ...this.state,
        card_selection: []
      });
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
      case "show_trump":
        return <InputShowTrump key={actionType}
                               hand={this.props.game.state.hand}
                               submitAction={this.submitAction} />;
      case "ack_trump_show":
        return <InputAckTrumpShow key={actionType} submitAction={this.submitAction} />;
      case "call_partner":
        return <InputCallPartner key={actionType}
                                 submitAction={this.submitAction} />;
      case "set_dog":
        return <InputSetDog key={actionType}
                            player={this.props.game.player}
                            cards={this.state.card_selection}
                            submitAction={this.submitAction} />;
      case "play_card":
        return <InputPlayCard key={actionType}
                              cards={this.state.card_selection}
                              submitAction={this.submitAction} />;
      default:
        return <NoStateInput key={actionType}
                             type={actionType}
                             label={actionType.replace("_", " ")}
                             submitAction={this.submitAction} />;
    }
  };

  private setCardSelection = (cards: Card[]) => {
    this.setState({
      ...this.state,
      card_selection: cards,
    })
  }
}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    game: state.ingame,
  }
};

export const InGameContainer = connect(mapStateToProps)(InGameInternal);