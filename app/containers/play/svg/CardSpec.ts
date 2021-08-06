import {SpectatorModeObserver} from '../SpectatorMode';
import {getTitleArrangementSpec} from './TitleArrangementSpec';

export const MaxHandCardSeparation = 50;
export const CardWidth = 120;
export const CardHeight = CardWidth * 1.56;
export const HandCardPopup = 80;
export const HandCardSelectablePopup = 40;

export const PlayerTextHeight = 28;
export const PlayerTextMargin = 10;

export const TrickMargin = 125;
export const TrickWidth = CardWidth + TrickMargin * 2;

export const PokeButtonWidth = 100;
export const PokeButtonHeight = 60;
export const PokeButtonOffset = 20;

export function getMaxHandWidth(players: number) {
  const cardCount = players === 3 ? 24 : players === 4 ? 18 : 15;
  const boundedSeparation = MaxHandCardSeparation * (cardCount - 1);
  return CardWidth + boundedSeparation;
}

export function getObserverClipHeight(
  width: number,
  height: number,
  players: number
): number | undefined {
  const layout = getTitleArrangementSpec(players, SpectatorModeObserver);
  const y0 = layout[0](width, height).position;
  const y1 = layout[1](width, height).position;
  const cardHeight = y1 - y0 - PlayerTextHeight - PlayerTextMargin * 3;
  if (cardHeight < 40) {
    return 40;
  } else if (cardHeight > CardHeight) {
    return undefined;
  } else {
    return cardHeight;
  }
}
