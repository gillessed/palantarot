import React from "react";
import { Player } from "../../../../server/model/Player";
import { Card } from "../../../../server/play/model/Card";
import { GameplayState } from "../../../../server/play/model/GameState";
import { ClientGame } from "../../../services/room/ClientGame";
import { ClientGameSelectors } from "../../../services/room/ClientGameSelectors";
import { isSpectatorModeObserver, SpectatorMode } from "../SpectatorMode";
import "./BottomLeftStatus.scss";
import { CardGroup } from "./CardGroup";
import { getCardUrl } from "./CardSvg";

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

function renderCard(card: Card) {
  return <img key={`${card[0]}|${card[1]}`} className="card-image" src={getCardUrl(card)} />;
}

export class BottomLeftStatus extends React.PureComponent<BottomLeftStatus.Props> {
  public render() {
    const { height, game, spectatorMode } = this.props;
    const partnerCall = game.playState.partnerCard;
    const dog = game.playState.dog;
    const renderDog =
      dog.length > 0 &&
      (isSpectatorModeObserver(spectatorMode) ||
        game.playState.state === GameplayState.DogReveal ||
        game.playState.state === GameplayState.Playing ||
        game.playState.state === GameplayState.Completed);
    const previousTrick = ClientGameSelectors.getPreviousTrick(game);
    return (
      <>
        <CardGroup title="Previous Trick" cards={previousTrick ?? []} x={0} y={height - 300} width={310} height={150} />
        <CardGroup title="Dog" cards={dog} x={0} y={height - 150} width={200} height={150} />
        <CardGroup
          title="Partner Call"
          cards={partnerCall ? [partnerCall] : []}
          x={190}
          y={height - 150}
          width={120}
          height={150}
          showEmptyIcon
        />
      </>
    );
  }
}
