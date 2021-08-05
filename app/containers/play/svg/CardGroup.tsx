import { Colors } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import { Card } from '../../../../server/play/model/Card';
import './CardGroup.scss';
import { HandSvg } from './HandSvg';
import { SvgBlueprintIcon } from './SvgBlueprintIcon';

export interface Props {
  title: string;
  cards: Card[];
  x: number;
  y: number;
  width: number;
  height: number;
  showEmptyIcon?: boolean;
}

const Padding = 10;
const TitleHeight = 12;
const TitleXOffset = 10;
const RectanglePadding = 10;

export class CardGroup extends React.PureComponent<Props> {
  public render() {
    const { title, cards, x, y, width, height, showEmptyIcon } = this.props;
    const rectWidth = width - 2 * Padding;
    const rectHeight = height - 2 * Padding - TitleHeight;
    return (
      <g>
        <text
          className='card-group-title'
          x={x + Padding + TitleXOffset}
          y={y + Padding + 5}
        >
          {title}
        </text>
        <rect x={x + Padding} y={y + Padding + TitleHeight} width={rectWidth} height={rectHeight} className='card-group-rect' rx={10} />
        {cards.length > 0 && <HandSvg
          top={y + Padding + TitleHeight + RectanglePadding}
          left={x + Padding + RectanglePadding}
          width={rectWidth - 2 * RectanglePadding}
          alignment='center'
          cards={cards}
          handCardHeight={rectHeight - 2 * RectanglePadding }
        />}
        {cards.length === 0 && showEmptyIcon && <SvgBlueprintIcon
          x={x + Padding + rectWidth / 2 - 16}
          y={y + Padding + TitleHeight + rectHeight / 2 - 16}
          icon={IconNames.DISABLE}
          fill={Colors.WHITE}
        />}
      </g>
    )
  }
}
