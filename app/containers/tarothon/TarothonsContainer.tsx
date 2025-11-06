import React from "react";
import { Tarothon } from "../../../server/model/Tarothon";
import { loadContainer } from "../LoadingContainer";
import { tarothonsLoader } from "../../services/tarothons";
import { Card, Elevation, Button, Intent } from "@blueprintjs/core";
import history from "../../history";
import { StaticRoutes, DynamicRoutes } from "../../routes";
import { pageCache } from "../pageCache/PageCache";
import { convertToMomenthon, Momenthon, getDateStrings } from "../../services/tarothonData/transform";

interface Props {
  tarothons: Tarothon[];
}

class TarothonsContainerInternal extends React.PureComponent<Props, {}> {
  public render() {
    const sorted: Momenthon[] = [...this.props.tarothons].map(convertToMomenthon).sort((t1, t2) => {
      if (t1.start > t2.start) {
        return 1;
      } else if (t1.start < t2.start) {
        return -1;
      } else {
        return 0;
      }
    });
    const previous = sorted.filter((t) => t.isWhen === Momenthon.Time.DONE);
    const current = sorted.find((t) => t.isWhen === Momenthon.Time.NOW);
    const upcoming = sorted.filter((t) => t.isWhen === Momenthon.Time.UPCOMING);
    return (
      <div className="tarothons-container page-container">
        <div className="title">
          <h1 className="bp3-heading">Tarothons</h1>
          <Button icon="add" text="Create New Tarothon" intent={Intent.WARNING} onClick={this.onAddTarothonClicked} />
        </div>
        {current && (
          <div className="ongoing-tarothon-container">
            <h2 className="bp3-heading">Current Tarothon</h2>
            {this.renderTarothonCard(current)}
          </div>
        )}
        {upcoming.length > 0 && (
          <>
            <h2 className="bp3-heading">Upcoming Tarothons</h2>
            <div className="tarothons-cards">{upcoming.map(this.renderTarothonCard)}</div>
          </>
        )}
        {previous.length > 0 && (
          <>
            <h2 className="bp3-heading">Previous Tarothons</h2>
            <div className="tarothons-cards">{previous.map(this.renderTarothonCard)}</div>
          </>
        )}
      </div>
    );
  }

  private renderTarothonCard(tarothon: Momenthon) {
    const dateStrings = getDateStrings(tarothon);
    const onClick = () => {
      history.push(DynamicRoutes.tarothon(tarothon.id));
    };
    return (
      <Card key={tarothon.id} interactive={true} elevation={Elevation.TWO} onClick={onClick}>
        <h3 className="bp3-heading">{dateStrings.date}</h3>
        <p className="text">
          {dateStrings.startTime} <span className="grey-text">{tarothon.length}hrs</span>
        </p>
      </Card>
    );
  }

  private onAddTarothonClicked = () => {
    history.push(StaticRoutes.addTarothon());
  };
}

const TarothonsContainerCached = pageCache(TarothonsContainerInternal);

export const TarothonsContainer = loadContainer({
  tarothons: tarothonsLoader,
})(TarothonsContainerCached);
