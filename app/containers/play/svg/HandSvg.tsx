import * as React from 'react';
import { Card } from '../../../play/common';
import { BottomLeftStatusLayout } from './BottomLeftStatus';
import { CardWidth, HandCardPopup, HandCardSelectablePopup, MaxHandCardSeparation } from './CardSpec';
import { CardSvg } from './CardSvg';
import { getTitleLayout } from './PlayerTitleSvg';
import { getTitleArrangementSpec } from './TitleArrangementSpec';

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
    const titleLayout = getTitleLayout(getTitleArrangementSpec(3)[0](svgWidth, svgHeight));
    const rightBound = titleLayout.cardx - 20;
    const leftBound = BottomLeftStatusLayout.Width + 20;
    const boundedSeparation = (rightBound - leftBound - CardWidth) / Math.max(cards.length - 1, 0);
    const cardSeparation = Math.min(MaxHandCardSeparation, boundedSeparation);
    const handWidth = CardWidth + Math.max(cards.length - 1, 0) * cardSeparation;
    const midPoint = leftBound + (rightBound - leftBound) / 2;
    let left = midPoint - handWidth / 2;
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
      left += cardSeparation;
    }
    return (
      <g className='hand'>
        {cardSvgs}
      </g>
    );
  }
}
