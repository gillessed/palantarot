import * as React from 'react';
import { Card } from '../../../play/common';
import { CardSeparation, CardWidth, HandCardPopup, HandCardSelectablePopup } from './CardSpec';
import { CardSvg } from './CardSvg';

interface Props {
  svgWidth: number;
  svgHeight: number;
  cards: Card[];
  selectableFilter?: (card: Card) => boolean;
  selectedCards?: Set<Card>;
  onClick?: (card: Card) => void;
}

export class HandSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, svgHeight, cards, selectableFilter, selectedCards, onClick } = this.props;
    let left = (svgWidth - (Math.max(cards.length - 1, 0) * CardSeparation) - CardWidth) / 2;
    const cardSvgs = []
    for (const card of cards) {
      const selectable = selectableFilter ? selectableFilter(card) : false;
      cardSvgs.push(<CardSvg
        key={`${card[0]}|${card[1]}`}
        x={left}
        y={svgHeight - (selectable ? HandCardSelectablePopup : HandCardPopup)}
        card={card}
        selected={selectedCards && selectedCards.has(card)}
        selectable={selectable}
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
