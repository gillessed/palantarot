import * as React from 'react';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { CardHeight, CardWidth } from './CardSpec';
import { getTrickLayoutSpec } from './TrickLayoutSpec';
import './TrickSvg.scss';
import { CardSvg } from './CardSvg';

interface Props {
  svgWidth: number;
  svgHeight: number;
  game: InGameState;
}

export class TrickSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, svgHeight, game } = this.props;
    const playerCount = game.state.playerOrder.length;
    const spec = getTrickLayoutSpec(playerCount);
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(game);
    const cards: JSX.Element[] = [];
    if (!game.state.trick) {
      return null;
    }
    for (let i = 0; i < playerCount; i++) {
      const cardSpec = spec[i](svgWidth, svgHeight);
      const winningCard = game.state.trick.winner === playerOrder[i];
      const fill = winningCard
        ? '#5C255CC0'
        : '#18202650';
      cards.push(
        <rect
          key={`shadow-${i}`}
          x={cardSpec.x}
          y={cardSpec.y}
          rx={8}
          width={CardWidth}
          height={CardHeight}
          fill={fill}
        />
      );
      if (winningCard) {
        cards.push(
          <text
            className='trick-winner'
            key={`text-${i}`}
            x={cardSpec.tx}
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
      const cardSpec = spec[index](svgWidth, svgHeight);
      cards.push(<CardSvg
        key={`card-${index}`}
        x={cardSpec.x}
        y={cardSpec.y}
        card={card}
      />);
    }
    return cards;
  }
}
