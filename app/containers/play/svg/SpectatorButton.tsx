import { Button, Intent, Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { isSpectatorModeNone, isSpectatorModeObserver, SpectatorMode, SpectatorModeNone, SpectatorModeObserver } from '../SpectatorMode';
import { SpectatorModeMenuItem } from './SpectatorModeMenuItem';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
  spectatorMode: SpectatorMode;
  setSpectatorMode: (mode: SpectatorMode) => void;
}

export class SpectatorButton extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, spectatorMode, setSpectatorMode } = this.props;
    const isParticipant = InGameSelectors.isParticipant(game);
    if (!game.settings?.publicHands || isParticipant) {
      return null;
    }
    return (
      <foreignObject x={width - 40} y={height - 40} width={40} height={40}>
        <Popover
          interactionKind={PopoverInteractionKind.CLICK}
          position={Position.TOP}
        >
          <Button
            icon={IconNames.EYE_OPEN}
            intent={Intent.PRIMARY}
          />
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
