import React from "react";
import { Player } from "../../../../server/model/Player";
import { GameplayState } from "../../../../server/play/model/GameState";
import { getPlayerName } from "../../../services/players/playerName";
import { ClientGame } from "../../../services/room/ClientGame";
import { ClientGameSelectors } from "../../../services/room/ClientGameSelectors";
import { isSpectatorModeObserver, SpectatorMode } from "../SpectatorMode";
import "./CurrentStateStatus.scss";

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: ClientGame;
  spectatorMode: SpectatorMode;
}

export class CurrentStateStatus extends React.PureComponent<Props> {
  public render() {
    const { width, height, game, players, spectatorMode } = this.props;
    let text: string | JSX.Element | null = null;
    switch (game.playState.state) {
      case GameplayState.Bidding:
        const bidderId = game.playState.playerOrder[game.playState.toBid ?? 0];
        const bidderName = getPlayerName(players.get(bidderId));
        text = `${bidderName} is bidding`;
        break;
      case GameplayState.PartnerCall:
        const callingId = game.playState.winningBid?.player ?? "";
        const calledName = getPlayerName(players.get(callingId));
        text = `${calledName} is choosing their partner`;
        break;
      case GameplayState.DogReveal:
        const revealId = game.playState.winningBid?.player ?? "";
        const revealName = getPlayerName(players.get(revealId));
        text = `${revealName} is dropping their dog`;
        break;
      case GameplayState.Playing:
        text = this.getPlayingStatus();
        break;
    }
    if (text === null) {
      return null;
    }
    const statusWidth = 250;
    const statusHeight = 120;
    const sx = isSpectatorModeObserver(spectatorMode) ? width - statusWidth - 100 : width - statusWidth;
    const sy = isSpectatorModeObserver(spectatorMode) ? height - statusHeight : 0;
    return (
      <foreignObject x={sx} y={sy} width={statusWidth} height={statusHeight}>
        <div className="current-state-status unselectable">{text}</div>
      </foreignObject>
    );
  }

  private getPlayingStatus(): string | JSX.Element {
    const { game, players } = this.props;
    const trickCards = ClientGameSelectors.getTrickCards(game.playState.trick);
    const playerName = getPlayerName(players.get(game.playState.toPlay ?? ""));
    const playerCount = game.playState.playerOrder.length;
    const totalTrickCount = playerCount === 3 ? 24 : playerCount === 4 ? 18 : playerCount === 5 ? 15 : 0;
    const innerText = trickCards.length === 0 || game.playState.trick.completed ? "turn to lead" : "turn to play";
    return (
      <>
        <p>
          {playerName}'s {innerText}
        </p>
        <p>
          Trick {game.playState.completedTricks.length + 1}/{totalTrickCount}
        </p>
      </>
    );
  }
}
