import React from "react";
import { TarothonData } from "../../../server/model/Tarothon";
import { loadContainer } from "../LoadingContainer";
import { pageCache } from "../pageCache/PageCache";
import { tarothonDataLoader } from "../../services/tarothonData";
import { convertToMomenthon, getDateStrings, Momenthon } from "../../services/tarothonData/transform";
import { integerComparator } from "../../../server/utils";
import { Result } from "../../../server/model/Result";
import { ScoreTable } from "../../components/scoreTable/ScoreTable";
import { Player } from "../../../server/model/Player";
import { playersLoader } from "../../services/players";
import moment from "moment";

interface Props {
  start: moment.Moment;
}

export class TarothonTimer extends React.PureComponent<Props, {}> {
  private rerender: any;

  public componentDidMount() {
    this.rerender = setInterval(() => this.forceUpdate(), 200);
  }

  public componentWillUnmount() {
    if (this.rerender) {
      clearInterval(this.rerender);
    }
  }

  public render() {
    const timeUntil = moment.duration(this.props.start.diff(moment()));
    const hours = Math.floor(timeUntil.asHours());
    const minutes = Math.floor(timeUntil.asMinutes() % 60);
    const zeroPadMinutes = `00${minutes}`.slice(-2);
    const seconds = Math.floor(timeUntil.asSeconds() % 60);
    const zeroPadSeconds = `00${seconds}`.slice(-2);
    const time = `${hours} : ${zeroPadMinutes} : ${zeroPadSeconds}`;
    return <div className="upcoming-time">{time}</div>;
  }
}
