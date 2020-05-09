import {
  AckTrumpShowAction,
  Action,
  ActionType,
  BidAction,
  Call,
  CallPartnerAction,
  Card,
  MessageAction,
  PlayCardAction,
  Player,
  SetDogAction
} from "../common";
import React, {FormEvent, KeyboardEvent} from "react";
import {Button, Checkbox, ControlGroup, Label, Radio, RadioGroup} from "@blueprintjs/core";

interface BaseProps {
  submitAction(action: Omit<Action, "player" | "time">): void
}

abstract class ActionInput<Props, ActionState extends Action>
    extends React.PureComponent<Props & BaseProps, Partial<Omit<ActionState, "type" | "player" | "time">>> {
  protected constructor(props: Props & BaseProps) {
    super(props);
  }

  protected renderSubmitButton(text: string) {
    return (
      <Button icon="key-enter" text={text} onClick={this.submitAction} disabled={!this.canSubmit()}/>
    )
  }

  protected readonly onKeyMaybeSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      this.submitAction();
    }
  };

  protected readonly submitAction = () => {
    if (this.canSubmit()) {
      this.props.submitAction(this.getAction());
    }
  };

  protected canSubmit = (): boolean => {
    return Boolean(this.state);
  };

  protected getAction = (): Omit<Action, "player" | "time"> => {
    return {
      ...this.state,
      type: this.type,
    }
  };

  protected abstract type: ActionType;
}

export class InputMessage extends ActionInput<{}, MessageAction> {
  protected type: 'message' = 'message';

  public render() {
    return (
      <ControlGroup>
        <input type="text" onInput={this.setText} onKeyUp={this.onKeyMaybeSubmit} size={40} />
        {this.renderSubmitButton("Send Message")}
      </ControlGroup>
    )
  }

  private setText = (event: FormEvent<HTMLInputElement>) => {
    this.setState({
      text: event.currentTarget.value,
    })
  }
}

export class InputBid extends ActionInput<{}, BidAction> {
  protected type: 'bid' = 'bid';

  public render() {
    return (
      <ControlGroup>
        <RadioGroup onChange={this.setBidValue} inline={true} selectedValue={this.state?.bid}>
          <Radio value={0} label="Pass" />
          <Radio value={10} label="10" />
          <Radio value={20} label="20" />
          <Radio value={40} label="40" />
          <Radio value={80} label="80" />
          <Radio value={160} label="160" />
        </RadioGroup>
        <Checkbox onClick={this.setRussian} value="russian" label="Russian" checked={Boolean(this.state?.calls)} />
        {this.renderSubmitButton("Submit Bid")}
      </ControlGroup>
    )
  }

  private setBidValue = (event: FormEvent<HTMLInputElement>) => {
    this.setState({
      ...this.state,
      bid: Number(event.currentTarget.value)
    })
  };

  private setRussian = (event: FormEvent<HTMLInputElement>) => {
    this.setState({
      ...this.state,
      calls: event.currentTarget.checked ? [Call.RUSSIAN] : undefined,
    });
  }
}

export class InputAckTrumpShow extends ActionInput<{}, AckTrumpShowAction> {
  protected type: 'ack_trump_show' = 'ack_trump_show';

  public render() {
    return (
      <ControlGroup>
        <Label className="bp3-inline">Showing Player:</Label>
        <input type="text" onInput={this.setShowingPlayer} onKeyUp={this.onKeyMaybeSubmit} />
        {this.renderSubmitButton("Ack Trump Show")}
      </ControlGroup>
    )
  }

  private setShowingPlayer = (event: FormEvent<HTMLInputElement>) => {
    this.setState({
      showing_player: event.currentTarget.value
    })
  };
}

export class InputCallPartner extends ActionInput<{cards: Card[]}, CallPartnerAction> {
  protected type: 'call_partner' = 'call_partner';

  public render() {
    return (
      <ControlGroup>
        {this.renderSubmitButton("Call Partner")}
      </ControlGroup>
    )
  }

  protected canSubmit = () => {
    return this.props.cards.length == 1
  };

  protected getAction = () => {
    return {
      type: this.type,
      card: this.props.cards[0],
    }
  };
}

export class InputSetDog extends ActionInput<{player: Player, cards: Card[]}, SetDogAction> {
  protected type: 'set_dog' = 'set_dog';

  public render() {
    return (
      <ControlGroup>
        {this.renderSubmitButton("Set Dog")}
      </ControlGroup>
    )
  }

  protected canSubmit = () => {
    return this.props.cards.length == 3 || this.props.cards.length == 6
  };

  protected getAction = () => {
    return {
      type: this.type,
      dog: this.props.cards,
      private_to: this.props.player,
    }
  }
}

export class InputPlayCard extends ActionInput<{cards: Card[]}, PlayCardAction> {
  protected type: 'play_card' = 'play_card';

  public render() {
    return (
      <ControlGroup>
        {this.renderSubmitButton("Play Card")}
      </ControlGroup>
    )
  }

  protected canSubmit = () => {
    return this.props.cards.length == 1
  };

  protected getAction = () => {
    return {
      type: this.type,
      card: this.props.cards[0],
    }
  };
}
type NoStateInputProps = {type: ActionType, label: string}

export class NoStateInput extends ActionInput<NoStateInputProps, Action> {
  protected readonly type: ActionType;
  constructor(props: NoStateInputProps & BaseProps) {
    super(props);
    this.type = props.type;
  }

  public render() {
    return this.renderSubmitButton(this.props.label);
  }

  protected canSubmit = () => {
    return true;
  }
}