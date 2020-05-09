import {Action, Player, PlayerEvent} from "../common";
import * as React from "react";

interface EventProps {
  player: Player
  event: PlayerEvent
}

function is_action(event: PlayerEvent): event is Action {
  return (event as Action).player !== undefined
}

class Event extends React.PureComponent<EventProps> {
  public render() {
    const event = this.props.event;
    const value = JSON.stringify(event, Event.jsonReplacer);
    if (is_action(event)) {
      const classes = "event-list" + (this.props.player === event.player ? " current-player" : "");
      return (
        <div className={classes}>
          {new Date(event.time).toLocaleTimeString()}: {event.player} {event.type}: {value}
        </div>
      )
    } else {
      return (
        <div className="event-list">
          -&gt; {event.type}: {value}
        </div>
      )
    }
  }

  private static jsonReplacer(key: string, value: any) {
    if (key === "player" || key === "type" || key === "time") {
      return undefined
    } else {
      return value
    }
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