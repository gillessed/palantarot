import { PlayerTitleSvg } from './PlayerTitleSvg';

export type TitleArrangementSpec = Array<(svgWidth: number, svgHeight: number) => PlayerTitleSvg.Props>;
export const TitleArrangementSpecs = {
  threePlayers: [
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'bottom',
        position: 0,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.min(svgWidth - 400, 2 * svgWidth / 3),
        text: 'after',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.max(400, svgWidth / 3),
        text: 'before',
      };
      return props;
    },
  ],
  fourPlayers: [
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'bottom',
        position: 0,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'right',
        position: svgHeight / 2 - 100,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: svgWidth / 2 - 100,
        text: 'after',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'left',
        position: svgHeight / 2 - 100,
        text: 'before',
      };
      return props;
    },
  ],
  fivePlayers: [
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'bottom',
        position: 0,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'right',
        position: Math.max(250, svgHeight / 2 - 100),
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.min(svgWidth - 400, 2 * svgWidth / 3),
        text: 'after',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.max(400, svgWidth / 3),
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.Props = {
        svgWidth,
        svgHeight,
        side: 'left',
        position: Math.max(250, svgHeight / 2 - 100),
        text: 'before',
      };
      return props;
    },
  ],
};

export function getTitleArrangementSpec(count: number): TitleArrangementSpec {
  if (count <= 3) {
    return TitleArrangementSpecs.threePlayers;
  } else if (count === 4) {
    return TitleArrangementSpecs.fourPlayers;
  } else {
    return TitleArrangementSpecs.fivePlayers;
  }
}
