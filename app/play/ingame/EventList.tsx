import {
  AckDogAction,
  AckTrumpShowAction, Action,
  BidAction,
  BiddingCompletedTransition,
  Call,
  CallPartnerAction,
  CompletedTrickTransition,
  DealtHandTransition,
  DeclareSlam,
  DogRevealTransition,
  EndTrumpShowTransition,
  EnterGameAction,
  GameAbortedTransition,
  GameCompletedTransition,
  GameStartTransition,
  MessageAction,
  PlayCardAction,
  Player,
  PlayerEvent,
  PlayerReadyAction,
  SetDogAction,
  ShowTrumpAction
} from "../common";
import * as React from "react";
import {renderCards, renderCardsText} from "./Cards";

interface EventProps {
  player: Player
  event: PlayerEvent
}

class Event extends React.PureComponent<EventProps> {
  public render() {
    const event = this.props.event;
    const classes = "player-event" + (this.props.player === (event as Action).player ? " current-player" : "");
    switch(event.type) {
      case "message":
        const message = event as MessageAction;
        return (
          <div className={classes}>
            {Event.getTimeText(message.time)}: {this.getPlayerName(message)} said: {renderCardsText(message.text)}
          </div>
        );
      case "enter_game":
        const enterGame = event as EnterGameAction;
        return (
          <div className={classes}>
            {Event.getTimeText(enterGame.time)}: {this.getPlayerName(enterGame)} joined the game.
          </div>
        );
      case "mark_player_ready":
        const playerReady = event as PlayerReadyAction;
        return (
          <div className={classes}>
            {Event.getTimeText(playerReady.time)}: {this.getPlayerName(playerReady, "You are", " is")} ready to start!
          </div>
        );
      case "bid":
        const bid = event as BidAction;
        return (
          <div className={classes}>
            {Event.getTimeText(bid.time)}: {this.getPlayerName(bid)}
            {Boolean(bid.bid)
              ? ` bid ${bid.calls?.indexOf(Call.RUSSIAN) !== -1 ? "Russian " : " "}${bid.bid}`
              : " passed"}
          </div>
        );
      case "show_trump":
        const showTrump = event as ShowTrumpAction;
        return (
          <div className={classes}>
            {Event.getTimeText(showTrump.time)}: {this.getPlayerName(showTrump)} showed {showTrump.cards.length} trump!
            {renderCards(...showTrump.cards)}
          </div>
        );
      case "ack_trump_show":
        const ackShow = event as AckTrumpShowAction;
        return (
          <div className={classes + " system-event-low"}>
            {Event.getTimeText(ackShow.time)}: {this.getPlayerName(ackShow)} acked
            {this.getPlayerName({player: ackShow.showing_player}, "your", " 's")} trump show.
          </div>
        );
      case "call_partner":
        const call = event as CallPartnerAction;
        return (
          <div className={classes}>
            {Event.getTimeText(call.time)}: {this.getPlayerName(call)} called {renderCards(call.card)}.
          </div>
        );
      case "declare_slam":
        const declareSlam = event as DeclareSlam;
        return (
          <div className={classes}>
            {Event.getTimeText(declareSlam.time)}: {this.getPlayerName(declareSlam)} DECLARED A SLAM!!!
          </div>
        );
      case "ack_dog":
        const ackDog = event as AckDogAction;
        return (
          <div className={classes + " system-event-low"}>
            {Event.getTimeText(ackDog.time)}: {this.getPlayerName(ackDog)} acked the dog.
          </div>
        );
      case "set_dog":
        const setDog = event as SetDogAction;
        return (
          <div className={classes}>
            {Event.getTimeText(setDog.time)}: {this.getPlayerName(setDog)} set the dog to {renderCards(...setDog.dog)}.
          </div>
        );
      case "play_card":
        const playCard = event as PlayCardAction;
        return (
          <div className={classes}>
            {Event.getTimeText(playCard.time)}: {this.getPlayerName(playCard)} played the {renderCards(playCard.card)}.
          </div>
        );
      case "dealt_hand":
        const dealt = event as DealtHandTransition;
        return (
          <div className={classes + " system-event"}>
            -&gt; Let us begin! You have been dealt: {renderCards(...dealt.hand)}
            And the bidding order will be {dealt.bidding_order.join(", ")}.
          </div>
        );
      case "trump_show_ended":
        const showEnded = event as EndTrumpShowTransition;
        const player_obj = {player: showEnded.player_showing_trump};
        return (
          <div className={classes + " system-event-low"}>
            -&gt; {this.getPlayerName(player_obj, "Your", "'s")}
            trump have been returned to {this.getPlayerName(player_obj, "your", "'s")} hand.
          </div>
        );
      case "bidding_completed":
        const doneBidding = event as BiddingCompletedTransition;
        const winning_bid = doneBidding.winning_bid;
        return (
          <div className={classes + " system-event"}>
            -&gt; Bidding complete! {this.getPlayerName(winning_bid)} won, bidding
              {winning_bid.calls?.indexOf(Call.RUSSIAN) !== -1 ? "Russian " : " "}{winning_bid.bid}.
          </div>
        );
      case "dog_revealed":
        const revealed = event as DogRevealTransition;
        return (
          <div className={classes + " system-event"}>
            -&gt; The dog had {renderCards(...revealed.dog)}.
          </div>
        );
      case "game_started":
        const started = event as GameStartTransition;
        return (
          <div className={classes + " system-event"}>
            -&gt; Play starts with {this.getPlayerName({player: started.first_player}, "you")}.
          </div>
        );
      case "completed_trick":
        const trick = event as CompletedTrickTransition;
        return (
          <div className={classes + " system-event"}>
            -&gt; {this.getPlayerName({player: trick.winner})} won the trick with the {renderCards(trick.winning_card)}.
            {trick.joker_state ?
              this.getPlayerName(trick.joker_state, "You owe", "owes") + " "
              + this.getPlayerName({player: trick.joker_state.owed_to}, "you") + " a card."
              : ""
            }
          </div>
        );
      case "game_completed":
        const ended = event as GameCompletedTransition;
        return (
          <div className={classes + " system-event"}>
            -&gt; Game completed! Final results:
            <pre><code>
              {JSON.stringify(ended.end_state, null, 2)}
            </code></pre>
          </div>
        );
      case "game_aborted":
        const aborted = event as GameAbortedTransition;
        return (
          <div className={classes + " system-event"}>
            -&gt; Game aborted: {aborted.reason}.
          </div>
        );
      case "error":
        const error = event as ErrorEvent;
        return (
          <div className={classes + " error-event"}>
            -&gt; Error: {error.error}.
          </div>
        );
    }
  }

  private getPlayerName(message: {player: Player}, if_you = "You", if_not = "") {
    return message.player === this.props.player ? if_you : message.player + if_not;
  }

  private static getTimeText(time: number) {
    return new Date(time).toLocaleTimeString();
  }
}

interface ListProps {
  events: PlayerEvent[]
  player: Player
}

export class EventList extends React.PureComponent<ListProps> {
  public render() {
    return this.props.events.map((event, i) => (
      <Event key={i} player={this.props.player} event={event} />
    ));
  }
}