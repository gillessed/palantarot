import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { GameplayState } from '../../../play/state';
import { InGameSelectors } from '../../../services/ingame/InGameSelectors';
import { InGameState } from '../../../services/ingame/InGameTypes';
import { getPlayerName } from '../../../services/players/playerName';
import './TopRightStatus.scss';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
}

export class TopRightStatus extends React.PureComponent<Props> {
  public render() {
    const { width, game, players } = this.props;
    let text: string | JSX.Element | null = null;
    switch (game.state.state) {
      case GameplayState.Bidding:
        const bidderId = game.state.playerOrder[game.state.toBid ?? 0];
        const bidderName = getPlayerName(players.get(bidderId));
        text = `${bidderName} is bidding`;
        break;
      case GameplayState.PartnerCall:
        const callingId = game.state.winningBid?.player ?? "";
        const calledName = getPlayerName(players.get(callingId));
        text = `${calledName} is choosing their partner`;
        break;
      case GameplayState.DogReveal:
        const revealId = game.state.winningBid?.player ?? "";
        const revealName = getPlayerName(players.get(revealId));
        text = `${revealName} is dropping their dog`; break;
      case GameplayState.Playing: text = this.getPlayingStatus(); break;
    }
    if (text === null) {
      return null;
    }
    return (
      <foreignObject x={width - 250} y={0} width={250} height={120}>
        <div className='top-right-status unselectable'>
          {text}
        </div>
      </foreignObject>
    )
  }

  private getPlayingStatus(): string | JSX.Element {
    const { game, players } = this.props;
    const trickCards = InGameSelectors.getTrickCards(game.state.trick);
    const playerName = getPlayerName(players.get(game.state.toPlay ?? ""));
    const playerCount = game.state.playerOrder.length;
    const totalTrickCount = playerCount === 3 ? 24
      : playerCount === 4 ? 18
      : playerCount === 5 ? 15
      : 0;
    const innerText = (trickCards.length === 0 || game.state.trick.completed)
      ? "turn to lead" : "turn to player";
    return (
      <>
        <p>{playerName}'s {innerText}</p>
        <p>Trick {game.state.completedTricks.length + 1}/{totalTrickCount}</p>
      </>
    );
  }
}
