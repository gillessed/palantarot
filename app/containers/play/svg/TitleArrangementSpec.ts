import {isSpectatorModeObserver, SpectatorMode} from '../SpectatorMode';
import {BottomLeftStatusLayout} from './BottomLeftStatus';
import {PlayerTitleSvg} from './PlayerTitleSvg';

export type TitleArrangementSpec = Array<
  (svgWidth: number, svgHeight: number) => PlayerTitleSvg.ArrangementProps
>;
export const TitleArrangementSpecs = {
  threePlayers: [
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'bottom',
        position: 0,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.min(svgWidth - 400, (2 * svgWidth) / 3),
        text: 'after',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
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
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'bottom',
        position: 0,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'right',
        position: svgHeight / 2 - 100,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: svgWidth / 2 - 100,
        text: 'after',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
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
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'bottom',
        position: 0,
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'right',
        position: Math.max(250, svgHeight / 2 - 100),
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.min(svgWidth - 400, (2 * svgWidth) / 3),
        text: 'after',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'top',
        position: Math.max(400, svgWidth / 3),
        text: 'before',
      };
      return props;
    },
    (svgWidth: number, svgHeight: number) => {
      const props: PlayerTitleSvg.ArrangementProps = {
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

function generateRightAlignedSpec(hands: number) {
  const spec: TitleArrangementSpec = [];
  for (let i = 0; i < hands; i++) {
    spec.push((svgWidth: number, svgHeight: number) => {
      const top = 50;
      const bottom = svgHeight - BottomLeftStatusLayout.Height;
      const size = (bottom - top) / hands;
      const props: PlayerTitleSvg.ArrangementProps = {
        svgWidth,
        svgHeight,
        side: 'right',
        position: top + size * i + 50,
        text: 'before',
      };
      return props;
    });
  }
  return spec;
}

export const ObserverModeArrangementSpecs = {
  threePlayers: generateRightAlignedSpec(3),
  fourPlayers: generateRightAlignedSpec(4),
  fivePlayers: generateRightAlignedSpec(5),
};

export function getTitleArrangementSpec(
  count: number,
  spectatorMode: SpectatorMode
): TitleArrangementSpec {
  if (!isSpectatorModeObserver(spectatorMode)) {
    if (count <= 3) {
      return TitleArrangementSpecs.threePlayers;
    } else if (count === 4) {
      return TitleArrangementSpecs.fourPlayers;
    } else {
      return TitleArrangementSpecs.fivePlayers;
    }
  } else {
    if (count <= 3) {
      return ObserverModeArrangementSpecs.threePlayers;
    } else if (count === 4) {
      return ObserverModeArrangementSpecs.fourPlayers;
    } else {
      return ObserverModeArrangementSpecs.fivePlayers;
    }
  }
}
