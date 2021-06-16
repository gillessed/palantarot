import * as React from 'react';
import { Card } from '../../../../server/play/model/Card';
import { CardWidth, MaxHandCardSeparation } from './CardSpec';
import { CardSvg } from './CardSvg';

export namespace HandSvg {
  export interface Props {
    top: number;
    left: number;
    width?: number;
    right?: number;
    popup?: number;
    alignment: 'left' | 'center' | 'right';
    cards: Card[];
    selectedCards?: Set<Card>;
    dogCards?: Set<Card>;
    clipHeight?: number;
    selectableFilter?: (card: Card) => boolean;
    onClick?: (card: Card) => void;
  }
}

export class HandSvg extends React.Component<HandSvg.Props> {
  public render() {
    const { top, left, width, right, alignment, popup, cards, selectedCards, dogCards, selectableFilter, onClick, clipHeight } = this.props;
    const lowerBound = left;
    const upperBound = right ?? left + (width ?? 0);
    if (upperBound <= lowerBound) {
      throw Error('Cannot render hand with upper bound smaller than lower bound');
    }
    const boundedSeparation = (upperBound - lowerBound - CardWidth) / Math.max(cards.length - 1, 0);
    const cardSeparation = Math.min(MaxHandCardSeparation, boundedSeparation);
    const handSize = CardWidth + Math.max(cards.length - 1, 0) * cardSeparation;
    const midPoint = lowerBound + (upperBound - lowerBound) / 2;
    let cardx = alignment === 'right' ? upperBound - handSize
      : alignment === 'left' ? lowerBound
      : midPoint - handSize / 2 ;
    const cardSvgs = []
    for (const card of cards) {
      const selectable = selectableFilter ? selectableFilter(card) : false;
      const cardy = top - (selectable ? (popup ?? 0) : 0);
      cardSvgs.push(<CardSvg
        key={`${card[0]}|${card[1]}`}
        x={cardx}
        y={cardy}
        card={card}
        selectable={selectable}
        dog={dogCards && dogCards.has(card)}
        selected={selectedCards && selectedCards.has(card)}
        onClick={selectable ? onClick : undefined}
        clipHeight={clipHeight}
      />);
      cardx += cardSeparation;
    }
    return (
      <g className='hand'>
        {cardSvgs}
      </g>
    );
  }
}
