import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { GameplayState } from '../../../../server/play/model/GameState';
import { ClientGame } from '../../../services/room/ClientGame';
import { isSpectatorModeObserver, SpectatorMode } from '../SpectatorMode';
import './BottomLeftStatus.scss';
import { getCardUrl } from './CardSvg';

export namespace BottomLeftStatus {
  export interface Props {
    width: number;
    height: number;
    players: Map<string, Player>;
    game: ClientGame;
    spectatorMode: SpectatorMode;
  }
}
export const BottomLeftStatusLayout = {
  Left: 300,
  Height: 300,
  Width: 400,
};

export class BottomLeftStatus extends React.PureComponent<BottomLeftStatus.Props> {
  public render() {
    const { height, game, spectatorMode } = this.props;
    const partnerCall = game.playState.partnerCard;
    const dog = game.playState.dog;
    const renderDog = dog.length > 0 && (
      isSpectatorModeObserver(spectatorMode) ||
      game.playState.state === GameplayState.DogReveal ||
      game.playState.state === GameplayState.Playing ||
      game.playState.state === GameplayState.Completed
    );
    return (
      <foreignObject
        x={0}
        y={height - BottomLeftStatusLayout.Height}
        width={BottomLeftStatusLayout.Width}
        height={BottomLeftStatusLayout.Height}
      >
        <div className='bottom-left-status'>
          <div className='bottom-left-background'>
            {partnerCall && <div className='status-line'>
              Parner Call:
              <img
                className='card-image'
                src={getCardUrl(partnerCall)}
              />
            </div>}
            {renderDog && <div className='status-line'>
              <span className='title'>Dog:</span>
              {dog.map((card) => {
                return (
                  <img
                    key={`${card[0]}|${card[1]}`}
                    className='card-image'
                    src={getCardUrl(card)}
                  />
                );
              })}
            </div>}
          </div>
        </div>
      </foreignObject>
    )
  }
}
