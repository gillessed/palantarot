import { Classes, MenuItem } from "@blueprintjs/core";
import React from "react";
import { SpectatorMode } from "../SpectatorMode";

interface Props {
  selected: boolean;
  spectatorMode: SpectatorMode;
  setSpectatorMode: (mode: SpectatorMode) => void;
}

export class SpectatorModeMenuItem extends React.PureComponent<Props> {
  public render() {
    const { spectatorMode, selected } = this.props;
    return (
      <MenuItem
        className={Classes.DARK}
        active={selected}
        text={spectatorMode.menuItem}
        icon={spectatorMode.icon}
        onClick={this.onClick}
      />
    );
  }

  private onClick = () => {
    const { spectatorMode, setSpectatorMode } = this.props;
    setSpectatorMode(spectatorMode);
  };
}
