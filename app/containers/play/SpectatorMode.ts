import { IconName } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

export interface SpectatorMode {
  type: string;
  menuItem: string;
  icon: IconName;
  playerId?: string;
}

export const SpectatorModeNoneType = 'None';
export const SpectatorModeObserverType = 'Observer';
export const SpectatorModePlayerType = 'Player';

export interface SpectatorModePlayer extends SpectatorMode {
  type: typeof SpectatorModePlayerType;
  playerId: string;
}

export function isSpectatorModeNone(mode: SpectatorMode) {
  return mode.type === SpectatorModeNoneType;
}

export function isSpectatorModeObserver(mode: SpectatorMode) {
  return mode.type === SpectatorModeObserverType;
}

export function isSpectatorModePlayer(mode: SpectatorMode): mode is SpectatorModePlayer {
  return mode.type === SpectatorModePlayerType;
}

export const SpectatorModeNone: SpectatorMode ={
  type: SpectatorModeNoneType,
  menuItem: 'Normal View',
  icon: IconNames.GRID_VIEW,
};

export const SpectatorModeObserver: SpectatorMode = {
  type: SpectatorModeObserverType,
  menuItem: 'Open Hand View',
  icon: IconNames.LIST,
};

export function createSpectatorModePlayer(playerId: string, playerName: string) {
  return {
    type: SpectatorModePlayerType,
    menuItem: `Follow ${playerName}`,
    icon: IconNames.PERSON,
    playerId,
  };
}
