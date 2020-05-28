import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { GameplayState } from '../../../play/state';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import './TopRightStatus.scss';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
}

export class TopRightStatus extends React.PureComponent<Props> {
  public render() {
    const { width, game } = this.props;
    let text = '';
    switch (game.state.state) {
      case GameplayState.Bidding: text = `${game.state.playerOrder[game.state.toBid ?? 0]} is bidding`; break;
      case GameplayState.PartnerCall: text = `${game.state.winningBid?.player ?? 'Unknown'} is choosing their partner`; break;
      case GameplayState.DogReveal: text = `${game.state.winningBid?.player ?? 'Unknown'} is dropping their dog`; break;
      case GameplayState.Playing: text = this.getPlayingStatus(); break;
    }
    if (text.length === 0) {
      return null;
    }
    return (
      <foreignObject x={width - 250} y={0} width={250} height={120}>
        <div className='top-left-status unselectable'>
          {text}
        </div>
      </foreignObject>
    )
  }

  private getPlayingStatus(): string {
    const { game } = this.props;
    const trickCards = InGameSelectors.getTrickCards(game.state.trick);
    if (trickCards.length === 0 || game.state.trick.completed) {
      return `${game.state.toPlay}'s turn to lead`;
    } else {
      return `${game.state.toPlay}'s turn to play`;
    }
  }
}
