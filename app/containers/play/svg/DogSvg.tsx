import * as React from 'react';
import { Card } from '../../../play/common';
import { CardHeight, CardWidth } from './CardSpec';
import { CardSvg } from './CardSvg';

interface Props {
  svgWidth: number;
  svgHeight: number;
  cards?: Card[];
  emptyLength?: number;
}

const CardSeparation = CardWidth + 20;

export class DogSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, svgHeight, cards, emptyLength } = this.props;
    const length = cards ? cards.length : emptyLength ?? 0;
    let left = svgWidth / 2 - Math.max(length - 1, 0) * CardSeparation / 2 - (CardWidth / 2);
    const cardSvgs = [];
    for (let i = 0; i < length; i++) {
      cardSvgs.push(<CardSvg
        key={i}
        x={left}
        y={(svgHeight - CardHeight) / 2}
        card={cards ? cards[i] : undefined}
      />);
      left += CardSeparation;
    }
    return cardSvgs;
  }
}
