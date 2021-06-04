import * as React from 'react';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { isSpectatorModeObserver, SpectatorMode } from '../SpectatorMode';
import { CardHeight, CardWidth, getMaxHandWidth, getObserverClipHeight, TrickMargin, TrickWidth } from './CardSpec';
import { CardSvg } from './CardSvg';
import { getTrickLayoutSpec, TrickLayout } from './TrickLayoutSpec';
import './TrickSvg.scss';

interface Props {
  width: number;
  height: number;
  game: InGameState;
  spectatorMode: SpectatorMode;
}

export class TrickSvg extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, spectatorMode } = this.props;
    const playerCount = game.state.playerOrder.length;
    const spec = getTrickLayoutSpec(playerCount, spectatorMode);
    const xOverride = getTrickCardXOverride(spec[0](width, height), width, spectatorMode, game.state.playerOrder.length);
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    const cards: JSX.Element[] = [];
    if (!game.state.trick) {
      return null;
    }
    const clipHeight = isSpectatorModeObserver(spectatorMode)
      ? getObserverClipHeight(width, height, playerCount)
      : undefined;
    for (let i = 0; i < playerCount; i++) {
      const cardSpec = spec[i](width, height);
      const winningCard = game.state.trick.winner === playerOrder[i];
      const fill = winningCard
        ? '#5C255CC0'
        : '#18202650';
      cards.push(
        <rect
          key={`shadow-${i}`}
          x={xOverride ?? cardSpec.x}
          y={cardSpec.y}
          rx={8}
          width={CardWidth}
          height={clipHeight ?? CardHeight}
          fill={fill}
        />
      );
      if (winningCard) {
        cards.push(
          <text
            className='trick-winner'
            key={`text-${i}`}
            x={xOverride ? (xOverride + CardWidth + 10) : cardSpec.tx}
            y={cardSpec.ty}
            fill={fill}
            textAnchor={cardSpec.textAnchor}
          >
            Winner
          </text>
        );
      }
    }
    for (const playerId of game.state.trick.order) {
      const card = game.state.trick.cards.get(playerId);
      const index = playerOrder.indexOf(playerId);
      const cardSpec = spec[index](width, height);
      cards.push(<CardSvg
        key={`card-${index}`}
        x={xOverride ?? cardSpec.x}
        y={cardSpec.y}
        card={card}
        clipHeight={clipHeight}
      />);
    }
    return cards;
  }
}

function getTrickCardXOverride(
  spec: TrickLayout,
  svgWidth: number,
  spectatorMode: SpectatorMode,
  playerCount: number,
): number | undefined {
  if (!isSpectatorModeObserver(spectatorMode)) {
    return undefined;
  }
  
  const maxHandWidth = getMaxHandWidth(playerCount);
  const maximumWidth = maxHandWidth + TrickWidth;

  if(maximumWidth > svgWidth) {
    return TrickMargin;
  } else {
    return (svgWidth - maximumWidth) / 2 + TrickMargin;
  }
}
