import { Button, Checkbox, ControlGroup, Radio, RadioGroup } from "@blueprintjs/core";
import React, { FormEvent, KeyboardEvent } from "react";
import { Action, ActionType, BidAction, Call, CallPartnerAction, Card, MessageAction, PlayCardAction, PlayerId, SetDogAction, ShowTrumpAction, TrumpSuit } from "../common";
import { cardPattern} from "./Cards";
import {parseCard} from "../cardUtils";

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
        <input type="text" onInput={this.setText} onKeyUp={this.onKeyMaybeSubmit} size={40} value={this.state?.text || ""} />
        {this.renderSubmitButton("Send Message")}
      </ControlGroup>
    )
  }

  private setText = (event: FormEvent<HTMLInputElement>) => {
    this.setState({
      text: event.currentTarget.value,
    })
  }

  protected submitAction = () => {
    if (this.canSubmit()) {
      this.props.submitAction(this.getAction());
      this.setState({
        text: "",
      })
    }
  }

  protected canSubmit = (): boolean => {
    return Boolean(this.state?.text)
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

export class InputCallPartner extends ActionInput<{}, CallPartnerAction> {
  protected type: 'call_partner' = 'call_partner';

  public render() {
    return (
      <ControlGroup>
        <input type="text" onInput={this.setCard} onKeyUp={this.onKeyMaybeSubmit} placeholder="e.g. #RS"/>
        {this.renderSubmitButton("Call Partner")}
      </ControlGroup>
    )
  }

  private setCard = (event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.match(cardPattern)) {
      this.setState({
        card: parseCard(event.currentTarget.value),
      })
    } else {
      this.setState({
        card: undefined,
      });
    }
  }

}

export class InputSetDog extends ActionInput<{player: PlayerId, cards: Card[]}, SetDogAction> {
  protected type: 'set_dog' = 'set_dog';

  public render() {
    return this.renderSubmitButton("Set Dog")
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
    return this.renderSubmitButton("Play Card")
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

export class InputShowTrump extends ActionInput<{hand: Card[]}, ShowTrumpAction> {
  protected type: 'show_trump' = 'show_trump';

  public render() {
    return this.renderSubmitButton("Show Trump");
  }

  protected canSubmit = () => {
    return true;
  };

  protected getAction = () => {
    return {
      type: this.type,
      cards: this.props.hand.filter(card => card[0] === TrumpSuit)
    }
  }
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
