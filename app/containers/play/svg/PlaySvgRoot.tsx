import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { ReduxState } from '../../../services/rootReducer';
import { DogSvg } from './DogSvg';
import { HandSvg } from './HandSvg';
import { PlayerOtherTitleSvg } from './PlayerOtherTitleSvg';
import { PlayerSelfTitleSvg } from './PlayerSelfTitleSvg';
import { cards5, selfId, users5 } from './testState';

interface StateProps {
}

interface OwnProps {
  width: number;
  height: number;
  players: Map<string, Player>;
}

type Props = StateProps & OwnProps;

class PlaySvgRootInternal extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  public render() {
    const { width, height } = this.props;
    const { hands, dog } = cards5;
    return (
      <svg
        className='play-svg'
        width={width}
        height={height}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseMove={this.onMouseMove}
      >
        <rect x={0} y={0} width={width} height={height} fill='#0F9960' />
        <HandSvg
          svgWidth={width}
          svgHeight={height}
          cards={hands[0]}
        />
        <DogSvg
          svgWidth={width}
          svgHeight={height}
          cards={dog}
          flipped={true}
        />
        {this.renderPlayerTitles5()}
      </svg>
    );
  }

  private renderPlayerTitles5() {
    const { width, height, players } = this.props;
    return (
      <g>
        <PlayerSelfTitleSvg
          svgWidth={width}
          svgHeight={height}
          player={players.get(selfId)}
        />
        <PlayerOtherTitleSvg
          svgWidth={width}
          svgHeight={height}
          player={players.get(users5[1])}
          side="left"
          position={250}
          text="before"
        />
        <PlayerOtherTitleSvg
          svgWidth={width}
          svgHeight={height}
          player={players.get(users5[2])}
          side="top"
          position={400}
          text="before"
        />
        <PlayerOtherTitleSvg
          svgWidth={width}
          svgHeight={height}
          player={players.get(users5[3])}
          side="top"
          position={width - 400}
          text="after"
        />
        <PlayerOtherTitleSvg
          svgWidth={width}
          svgHeight={height}
          player={players.get(users5[4])}
          side="right"
          position={250}
          text="before"
        />
      </g>
    );
  }

  private onMouseDown = (e: React.MouseEvent<SVGElement>) => {
  }

  private onMouseMove = (e: React.MouseEvent<SVGElement>) => {
  }

  private onMouseUp = (e: React.MouseEvent<SVGElement>) => {
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
  };
};

export const PlaySvgRoot = PlaySvgRootInternal;
