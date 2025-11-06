import React from "react";
import { IconName, Icon } from "@blueprintjs/core";

interface Props {
  delta: number;
  renderZero?: boolean;
}

export class DeltaIcon extends React.PureComponent<Props, {}> {
  public render() {
    if (this.props.delta === 0 && !this.props.renderZero) {
      return null;
    }
    let color: string = "#ceb32d";
    let icon: IconName = "arrows-horizontal";
    if (this.props.delta < 0) {
      color = "red";
      icon = "arrow-down";
    } else if (this.props.delta > 0) {
      color = "green";
      icon = "arrow-up";
    }
    return (
      <span className="score-delta" style={{ color }}>
        <Icon icon={icon} iconSize={14} />
        {this.props.delta}
      </span>
    );
  }
}
