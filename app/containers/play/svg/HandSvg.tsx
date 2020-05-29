import * as React from 'react';
import { Card } from '../../../play/common';
import { CardSeparation, CardWidth, HandCardPopup, HandCardSelectablePopup } from './CardSpec';
import { CardSvg } from './CardSvg';

interface Props {
  svgWidth: number;
  svgHeight: number;
  cards: Card[];
  selectedCards?: Set<Card>;
  dogCards?: Set<Card>;
  selectableFilter?: (card: Card) => boolean;
  onClick?: (card: Card) => void;
}

export class HandSvg extends React.Component<Props> {
  public render() {
    const { svgWidth, svgHeight, cards, selectedCards, dogCards, selectableFilter, onClick } = this.props;
    let left = (svgWidth - (Math.max(cards.length - 1, 0) * CardSeparation) - CardWidth) / 2;
    const cardSvgs = []
    for (const card of cards) {
      const selectable = selectableFilter ? selectableFilter(card) : false;
      cardSvgs.push(<CardSvg
        key={`${card[0]}|${card[1]}`}
        x={left}
        y={svgHeight - (selectable ? HandCardSelectablePopup : HandCardPopup)}
        card={card}
        selectable={selectable}
        dog={dogCards && dogCards.has(card)}
        selected={selectedCards && selectedCards.has(card)}
        onClick={selectable ? onClick : undefined}
      />);
      left += CardSeparation;
    }
    return (
      <g className='hand'>
        {cardSvgs}
      </g>
    );
  }
}
