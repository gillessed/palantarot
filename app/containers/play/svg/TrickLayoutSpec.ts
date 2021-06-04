import { isSpectatorModeObserver, SpectatorMode } from '../SpectatorMode';
import { BottomLeftStatusLayout } from './BottomLeftStatus';
import { CardHeight, CardWidth } from './CardSpec';

export interface TrickLayout {
  x: number;
  y: number;
  tx: number;
  ty: number;
  textAnchor: string;
}

export type TrickLayoutSpec = Array<(svgWidth: number, svgHeight: number) => TrickLayout>;
export const TrickLayoutSpecs = {
  threePlayers: [
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - CardWidth / 2;
      const y = svgHeight / 2 + 5;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y + CardHeight + 40,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 + 5;
      const y = svgHeight / 2 - CardHeight - 5;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y - 20,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - CardWidth - 5;
      const y = svgHeight / 2 - CardHeight - 5;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y - 20,
        textAnchor: 'middle',
      }
    },
  ],
  fourPlayers: [
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - CardWidth / 2;
      const y = svgHeight / 2 + 40;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y + CardHeight + 40,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 + CardWidth / 2 + 10;
      const y = svgHeight / 2 - CardHeight / 2;
      return {
        x,
        y,
        tx: x + CardWidth + 30,
        ty: y + CardHeight / 2,
        textAnchor: 'start',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - CardWidth / 2;
      const y = svgHeight / 2 - CardHeight - 40;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y - 20,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - 3 * CardWidth / 2 - 10;
      const y = svgHeight / 2 - CardHeight / 2;
      return {
        x,
        y,
        tx: x - 30,
        ty: y + CardHeight / 2 + 15,
        textAnchor: 'end',
      }
    },
  ],
  fivePlayers: [
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - CardWidth / 2;
      const y = svgHeight / 2 + 40;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y + CardHeight + 40,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 + CardWidth / 2 + 10;
      const y = svgHeight / 2 - 30;
      return {
        x,
        y,
        tx: x + CardWidth + 30,
        ty: y + CardHeight / 2,
        textAnchor: 'start',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 + 5;
      const y = svgHeight / 2 - CardHeight - 40;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y - 20,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - CardWidth - 5;
      const y = svgHeight / 2 - CardHeight - 40;
      return {
        x,
        y,
        tx: x + CardWidth / 2,
        ty: y - 20,
        textAnchor: 'middle',
      }
    },
    (svgWidth: number, svgHeight: number) => {
      const x = svgWidth / 2 - 3 * CardWidth / 2 - 10;
      const y = svgHeight / 2 - 30;
      return {
        x,
        y,
        tx: x - 30,
        ty: y + CardHeight / 2 + 15,
        textAnchor: 'end',
      }
    },
  ],
};

function generateLeftAlignedSpec(tricks: number) {
  const spec: TrickLayoutSpec = [];
  for (let i = 0; i < tricks; i++) {
    spec.push((svgWidth: number, svgHeight: number) => {
      const top = 50;
      const left = 20;
      const bottom = svgHeight - BottomLeftStatusLayout.Height;
      const size = (bottom - top) / tricks;
      const props: TrickLayout = {
        x: 20,
        y: top + size * i + 50,
        tx: left + CardWidth + 10,
        ty: top + size * i + 90,
        textAnchor: 'start',
      };
      return props;
    });
  }
  return spec;
}

export const ObserverModeArrangementSpecs = {
  threePlayers: generateLeftAlignedSpec(3),
  fourPlayers: generateLeftAlignedSpec(4),
  fivePlayers: generateLeftAlignedSpec(5),
};

export function getTrickLayoutSpec(count: number, spectatorMode: SpectatorMode): TrickLayoutSpec {
  if (isSpectatorModeObserver(spectatorMode)) {
    if (count <= 3) {
      return ObserverModeArrangementSpecs.threePlayers;
    } else if (count === 4) {
      return ObserverModeArrangementSpecs.fourPlayers;
    } else {
      return ObserverModeArrangementSpecs.fivePlayers;
    }
  } else {
    if (count <= 3) {
      return TrickLayoutSpecs.threePlayers;
    } else if (count === 4) {
      return TrickLayoutSpecs.fourPlayers;
    } else {
      return TrickLayoutSpecs.fivePlayers;
    }
  }
}
