import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { InGameState } from '../../play/ingame/InGameService';
import { GameplayState } from '../../play/state';
import { NewGameStateView } from './state/NewGameStateView';
import { PlayerOtherTitleSvg } from './svg/PlayerOtherTitleSvg';
import { PlayerSelfTitleSvg } from './svg/PlayerSelfTitleSvg';
import { cards5, selfId, users5 } from './svg/testState';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
}

export class PlaySvgRoot extends React.Component<Props> {

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
        {this.renderStateView()}
        {/* <HandSvg
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
        {this.renderPlayerTitles5()} */}
      </svg>
    );
  }

  private renderStateView(): JSX.Element {
    switch (this.props.game.state.state) {
      case GameplayState.NewGame: return (
        <NewGameStateView
          {...this.props}
        />
      );
      default: return null;
    }
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
