import * as React from 'react';
import { Card } from '../../../play/common';
import { CardSeparation, CardWidth, HandCardPopup } from './CardSpec';
import { CardSvg } from './CardSvg';

interface Props {
  svgWidth: number;
  svgHeight: number;
  cards: Card[];
}

export class HandSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, svgHeight, cards } = this.props;
    let left = (svgWidth - (Math.max(cards.length - 1, 0) * CardSeparation) - CardWidth) / 2;
    const cardSvgs = []
    for (const card of cards) {
      cardSvgs.push(<CardSvg
        key={`${card[0]}|${card[1]}`}
        x={left}
        y={svgHeight - HandCardPopup}
        card={card}
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
