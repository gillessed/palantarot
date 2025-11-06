import { Button, Intent, Menu, Popover, PopoverInteractionKind, Position } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import React from "react";
import { Player } from "../../../../server/model/Player";
import { ClientGame } from "../../../services/room/ClientGame";
import { ClientGameSelectors } from "../../../services/room/ClientGameSelectors";
import {
  isSpectatorModeNone,
  isSpectatorModeObserver,
  SpectatorMode,
  SpectatorModeNone,
  SpectatorModeObserver,
} from "../SpectatorMode";
import { SpectatorModeMenuItem } from "./SpectatorModeMenuItem";

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: ClientGame;
  spectatorMode: SpectatorMode;
  setSpectatorMode: (mode: SpectatorMode) => void;
}

export class SpectatorButton extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, spectatorMode, setSpectatorMode } = this.props;
    const isParticipant = ClientGameSelectors.isParticipant(game);
    if (!game.settings?.publicHands || isParticipant) {
      return null;
    }
    return (
      <foreignObject x={width - 40} y={height - 40} width={40} height={40}>
        <Popover interactionKind={PopoverInteractionKind.CLICK} position={Position.TOP}>
          <Button icon={IconNames.EYE_OPEN} intent={Intent.PRIMARY} />
          <Menu>
            <SpectatorModeMenuItem
              spectatorMode={SpectatorModeNone}
              setSpectatorMode={setSpectatorMode}
              selected={isSpectatorModeNone(spectatorMode)}
            />
            <SpectatorModeMenuItem
              spectatorMode={SpectatorModeObserver}
              setSpectatorMode={setSpectatorMode}
              selected={isSpectatorModeObserver(spectatorMode)}
            />
          </Menu>
        </Popover>
      </foreignObject>
    );
  }
}
