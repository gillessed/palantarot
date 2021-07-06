import * as React from 'react';
import { ClientGame } from '../../../services/room/ClientGame';
import { ClientGameSelectors } from '../../../services/room/ClientGameSelectors';
import { isSpectatorModeObserver, SpectatorMode } from '../SpectatorMode';
import { CardHeight, CardWidth, getMaxHandWidth, getObserverClipHeight, TrickMargin, TrickWidth } from './CardSpec';
import { CardSvg } from './CardSvg';
import { getTrickLayoutSpec, TrickLayout } from './TrickLayoutSpec';
import './TrickSvg.scss';

interface Props {
  width: number;
  height: number;
  game: ClientGame;
  spectatorMode: SpectatorMode;
}

export class TrickSvg extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, spectatorMode } = this.props;
    const playerCount = game.playState.playerOrder.length;
    const spec = getTrickLayoutSpec(playerCount, spectatorMode);
    const xOverride = getTrickCardXOverride(spec[0](width, height), width, spectatorMode, game.playState.playerOrder.length);
    const playerOrder = ClientGameSelectors.getRotatedPlayerOrder(game);
    const cards: JSX.Element[] = [];
    if (!game.playState.trick) {
      return null;
    }
    const clipHeight = isSpectatorModeObserver(spectatorMode)
      ? getObserverClipHeight(width, height, playerCount)
      : undefined;
    for (let i = 0; i < playerCount; i++) {
      const cardSpec = spec[i](width, height);
      const winningCard = game.playState.trick.winner === playerOrder[i];
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
    for (const playerId of game.playState.trick.order) {
      const card = game.playState.trick.cards.get(playerId);
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

  if (maximumWidth > svgWidth) {
    return TrickMargin;
  } else {
    return (svgWidth - maximumWidth) / 2 + TrickMargin;
  }
}
