import classNames from 'classnames';
import * as React from 'react';
import { Card, RegSuit, TrumpSuit } from '../../../play/common';
import { CardHeight, CardWidth } from './CardSpec';
import './CardSvg.scss';

interface Props {
  width?: number;
  height?: number;
  x: number;
  y: number;
  card?: Card
  enlarge?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onClick?: (card: Card) => void;
  color?: 'black' | 'blue' | 'green' | 'red';
}

const SuitMap = {
  [TrumpSuit]: 'Trump',
  [RegSuit.Club]: 'Club',
  [RegSuit.Diamond]: 'Diamond',
  [RegSuit.Heart]: 'Heart',
  [RegSuit.Spade]: 'Spade',
}

interface State {
  hover: boolean;
}

export class CardSvg extends React.PureComponent<Props> {
  public state: State = {
    hover: false,
  };

  public render() {
    const { card, x, y, width, height, selectable, selected, color } = this.props;
    const { hover } = this.state;
    let link = '';
    if (card) {
      const [suit, number] = card;
      link = `/static/images/cards/${SuitMap[suit]} ${number}.png`;
    } else {
      switch (color) {
        case 'red': link = '/static/images/cards/Card Back Red.png'; break;
        case 'green': link = '/static/images/cards/Card Back Green.png'; break;
        case 'blue': link = '/static/images/cards/Card Back Blue.png'; break;
        case 'black': 
        default: link = '/static/images/cards/Card Back Black.png';
      }
    }
    const w = width != null ? width : CardWidth;
    const h = height != null ? height : CardHeight;
    const cardClasses = classNames(
      'card-image',
      {
        'selectable': selectable,
        'selected': selected,
      },
    );
    const centerx = x + w / 2;
    const centery = y + h / 2;
    const outlineRadioX = 0.92;
    const outlineRadioY = 0.95;
    return (
      <g>
        <image
          className={cardClasses}
          width={w}
          height={h}
          x={x}
          y={y}
          xlinkHref={link}
          onClick={this.onClick}
          onMouseEnter={this.handleMouseOver}
          onMouseLeave={this.handleMouseExit}
        />
        {selectable && hover && <rect
          pointerEvents='none'
          className='card-hover-outline'
          x={centerx - w * outlineRadioX / 2}
          y={centery - h * outlineRadioY / 2}
          rx={8}
          width={w * outlineRadioX}
          height={h * outlineRadioY}
        />}
        {selected && <rect
          pointerEvents='none'
          className='card-outline'
          x={centerx - w * outlineRadioX / 2}
          y={centery - h * outlineRadioY / 2}
          rx={8}
          width={w * outlineRadioX}
          height={h * outlineRadioY}
        />}
      </g>
    );
  }

  private onClick = () => {
    const { card, onClick } = this.props;
    if (onClick && card) {
      onClick(card);
    }
  }

  private handleMouseOver = () => {
    this.setState({ hover: true });
  }

  private handleMouseExit = () => {
    this.setState({ hover: false });
  }
}
