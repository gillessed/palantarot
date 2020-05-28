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

export function getTrickLayoutSpec(count: number): TrickLayoutSpec {
  if (count <= 3) {
    return TrickLayoutSpecs.threePlayers;
  } else if (count === 4) {
    return TrickLayoutSpecs.fourPlayers;
  } else {
    return TrickLayoutSpecs.fivePlayers;
  }
}
