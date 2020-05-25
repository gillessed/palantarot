import * as React from 'react';
import { Card, RegSuit, TrumpSuit } from '../../../play/common';
import { CardHeight, CardWidth } from './CardSpec';

interface Props {
  width?: number;
  height?: number;
  x: number;
  y: number;
  card?: Card
  enlarge?: boolean;
  flipped?: boolean;
}

const SuitMap = {
  [TrumpSuit]: 'Trump',
  [RegSuit.Club]: 'Club',
  [RegSuit.Diamond]: 'Diamond',
  [RegSuit.Heart]: 'Heart',
  [RegSuit.Spade]: 'Spade',
}

export class CardSvg extends React.PureComponent<Props> {
  public render() {
    const { card, x, y, width, height, flipped } = this.props;
    let link = '/static/images/cards/Card Back Black.png';
    if (card && !flipped) {
      const [suit, number] = card;
      link = `/static/images/cards/${SuitMap[suit]} ${number}.png`;
    }
    const w = width != null ? width : CardWidth;
    const h = height != null ? height : CardHeight;
    return (
      <image
        className="card-image"
        width={w}
        height={h}
        x={x}
        y={y}
        xlinkHref={link}
      />
    );
  }
}
