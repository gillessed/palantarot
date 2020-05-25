import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { CardHeight, CardWidth } from './CardSpec';
import { CardSvg } from './CardSvg';
import './PlayerSelfTitleSvg.scss';

interface Props {
  svgWidth: number;
  svgHeight: number;
  player?: Player;
  side: "left" | "top" | "right";
  position: number;
  text: "before" | "after";
}

const TopCardY = -CardHeight + 70;
const HorizontalX = CardWidth / 2;
const TextMargin = 10;
const TextHeight = 35;

export class PlayerOtherTitleSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, player, side, position, text } = this.props;
    const playerName = player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
    let x, y, tx, ty, textAnchor;
    if (side === 'top') {
      x = position - CardWidth / 2;
      y = TopCardY;
      ty = TextHeight + TextMargin;
      if (text === "before") {
        tx = x - TextMargin;
        textAnchor = "end";
      } else {
        tx = x + CardWidth + TextMargin;
        textAnchor = "start";
      }
    } else if (side === 'left') {
      x = -CardWidth + HorizontalX;
      y = position;
      textAnchor = "start";
      tx = TextMargin;
      if (text === "before") {
        ty = y - TextMargin;
      } else {
        ty = y + CardHeight + TextHeight + TextMargin;
      }
    } else {
      x = svgWidth - HorizontalX;
      y = position;
      textAnchor = "end";
      tx = svgWidth - TextMargin;
      if (text === "before") {
        ty = y - TextMargin;
      } else {
        ty = y + CardHeight + TextHeight + TextMargin;
      }
    }
    return (
      <g>
        <CardSvg
          x={x}
          y={y}
        />
        <text
          className="player-text unselectable"
          x={tx}
          y={ty}
          textAnchor={textAnchor}
        >
          {playerName}
        </text>
      </g>
    );
  }
}
