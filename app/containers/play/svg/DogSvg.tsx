import * as React from 'react';
import { Card } from '../../../play/common';
import { CardHeight, CardWidth } from './CardSpec';
import { CardSvg } from './CardSvg';

interface Props {
  svgWidth: number;
  svgHeight: number;
  cards: Card[];
  flipped: boolean;
}

const CardSeparation = CardWidth + 20;

export class DogSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, svgHeight, cards, flipped } = this.props;
    let left = svgWidth / 2 - Math.max(cards.length - 1, 0) * CardSeparation / 2 - (CardWidth / 2);
    const cardSvgs = []
    for (const card of cards) {
      cardSvgs.push(<CardSvg
        key={`${card[0]}|${card[1]}`}
        x={left}
        y={(svgHeight - CardHeight) / 2}
        flipped={flipped}
        card={card}
      />);
      left += CardSeparation;
    }
    return cardSvgs;
  }
}
