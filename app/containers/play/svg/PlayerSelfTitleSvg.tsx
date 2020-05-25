import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { HandCardPopup } from './CardSpec';
import './PlayerSelfTitleSvg.scss';

interface Props {
  svgWidth: number;
  svgHeight: number;
  player?: Player;
}

export class PlayerSelfTitleSvg extends React.PureComponent<Props> {
  public render() {
    const { svgWidth, svgHeight, player } = this.props;
    const playerName = player ? `${player.firstName} ${player.lastName}` : 'Unknown Player';
    return (
      <text
        className="player-text unselectable"
        x={svgWidth - 50}
        y={svgHeight - HandCardPopup - 10}
        textAnchor="end"
      >
        {playerName}
      </text>
    );
  }
}
