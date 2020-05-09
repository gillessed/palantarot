import React, {ChangeEvent, FormEvent, KeyboardEvent} from "react";
import {DispatchContext, DispatchersContextType} from "../../dispatchProvider";
import {Dispatchers} from "../../services/dispatchers";
import {ReduxState} from "../../services/rootReducer";
import {InGameState} from "./InGameService";
import {connect} from "react-redux";
import {Button, Checkbox, Radio, RadioGroup} from "@blueprintjs/core";
import {EventList} from "./EventList";
import {Action, ActionType, GameplayState} from "../common";
import {renderCards} from "./Cards";

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
  actionType: string
  actionParams: {[key: string]: any}
}

type Props = OwnProps & StateProps;

class InGameInternal extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {
      actionType: "message",
      actionParams: {},
    }
  }

  public componentWillMount() {
    this.dispatchers.ingame.joinGame(
      this.props.match.params.player, this.props.match.params.gameId);
  }

  public componentWillUnmount() {
    this.dispatchers.ingame.exitGame();
  }

  render() {
    const actions = this.stateToActions.get(this.props.game.state.state) || new Set<ActionType>();
    return (
      <div>
        <EventList
          player={this.props.match.params.player}
          events={this.props.game.events}
        />
        <div>
          Hand: {renderCards(...this.props.game.state.hand)}
        </div><div>
          Action:
          <select onChange={this.setActionType} defaultValue="message">
            <option value="message">Send Message</option>
            <option value="enter_game" hidden={!actions.has("enter_game")}>Join Game</option>
            <option value="mark_player_ready" hidden={!actions.has("mark_player_ready")}>Let's Start!</option>
            <option value="bid" hidden={!actions.has("bid")}>Submit Bid</option>
            <option value="show_trump" hidden={!actions.has("show_trump")}>Show Trump</option>
            {/* <option value="ack_trump_show">Ack Trump Show</option> // who needs this action right now anyways*/}
            <option value="call_partner" hidden={!actions.has("call_partner")}>Call Partner</option>
            <option value="declare_slam" hidden={!actions.has("declare_slam")}>Declare Slam</option>
            <option value="ack_dog" hidden={!actions.has("ack_dog")}>Ack Dog</option>
            <option value="set_dog" hidden={!actions.has("set_dog")}>Set Dog</option>
            <option value="play_card" hidden={!actions.has("play_card")}>Play Card</option>
          </select>
        </div><div>
          {this.renderInputParams()}
        </div><div>
          <Button icon="key-enter" text="Send" onClick={this.submitAction} />
        </div>
      </div>
    )
  }

  private stateToActions = new Map<GameplayState, Set<ActionType>>([
    ["new_game", new Set<ActionType>(["enter_game", "mark_player_ready"])],
    ["bidding", new Set<ActionType>(["bid", "show_trump", "declare_slam", "show_trump", "ack_trump_show"])],
    ["partner_call", new Set<ActionType>(["call_partner", "declare_slam", "show_trump", "ack_trump_show"])],
    ["dog_reveal", new Set<ActionType>(["set_dog", "ack_dog", "declare_slam", "show_trump", "ack_trump_show"])],
    ["playing", new Set<ActionType>(["play_card", "declare_slam", "show_trump", "ack_trump_show"])],
    ["completed", new Set<ActionType>([])],
  ]);

  private setActionType = (event: ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      actionType: event.target.value,
      actionParams: {},
    });
  };

  private maybeSubmitAction = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      this.submitAction();
    }
  };

  private submitAction = () => {
    try {
      const action = this.state.actionParams;
      action.player = this.props.game.player;
      action.time = Date.now();
      action.type = this.state.actionType;
      this.dispatchers.ingame.playAction(action as Action)
    } catch (e) {
      this.dispatchers.ingame.actionError(e);
    }
  };

  private renderInputParams() {
    switch (this.state.actionType) {
      case "message":
        return this.renderInputMessage();
      case "bid":
        return this.renderInputBid();
      case "ack_trump_show":
        return this.renderInputAckTrumpShow();
      case "call_partner":
        return this.renderInputCallPartner();
      case "set_dog":
        return this.renderInputSetDog();
      case "play_card":
        return this.renderInputPlayCard();
      default:
        return "";
    }
  }

  private renderInputMessage() {
    return (
      <input type="text"
             onInput={(event) => this.setActionParam("text", event.currentTarget.value)}
             onKeyUp={this.maybeSubmitAction}
             size={40}
      />
    )
  };

  private renderInputBid() {
    const onClick = (event: FormEvent<HTMLInputElement>) => this.setActionParam("bid", Number(event.currentTarget.value));
    return (
      <span>
        <RadioGroup onChange={onClick} inline={true} selectedValue={this.state.actionParams.bid || 0}>
          <Radio value={0} label="Pass" />
          <Radio value={10} label="10" />
          <Radio value={20} label="20" />
          <Radio value={40} label="40" />
          <Radio value={80} label="80" />
          <Radio value={160} label="160" />
        </RadioGroup>
        <Checkbox onClick={this.setRussian} value="russian" label="Russian" checked={Boolean(this.state.actionParams.calls)} />
      </span>
    )
  }

  private renderInputAckTrumpShow() {
    return (
      <span>
        Showing Player:
        <input type="text"
             onInput={(event) => this.setActionParam("showing_player", event.currentTarget.value)}
             onKeyUp={this.maybeSubmitAction}
        />
      </span>
    )
  }

  private renderInputCallPartner() {
    return (
      <span>
        Card to call:
        <input type="text"
               onInput={(event) => this.setActionParam("card", event.currentTarget.value)}
               onKeyUp={this.maybeSubmitAction}
               size={8}
        />
      </span>
    )
  }

  private renderInputSetDog() {
    return (
      <span>
        Set dog to:
        <input type="text"
               onInput={(event) => {
                 this.setActionParam("dog", event.currentTarget.value);
                 this.setActionParam("private_to", this.props.game.player);
               }}
               onKeyUp={this.maybeSubmitAction}
               size={8}
        />
      </span>
    )
  }

  private renderInputPlayCard() {
    return (
      <span>
        <input type="text"
               onInput={(event) => this.setActionParam("card", event.currentTarget.value)}
               onKeyUp={this.maybeSubmitAction}
               size={8}
        />
      </span>
    )
  }

  private setActionParam = (param: string, data: any) => {
    this.setState({
      actionParams: {
        ...this.state.actionParams,
        [param]: data,
      }
    })
  };

  private setRussian = (event: FormEvent<HTMLInputElement>) => {
    this.setState({
      actionParams: {
        ...this.state.actionParams,
        calls: event.currentTarget.checked ? ["russian"] : [],
      }
    })
  };

}

const mapStateToProps = (state: ReduxState): StateProps => {
  return {
    game: state.ingame,
  }
};

export const InGameContainer = connect(mapStateToProps)(InGameInternal);