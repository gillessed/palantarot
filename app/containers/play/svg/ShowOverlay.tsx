import React from "react";
import { Player } from "../../../../server/model/Player";
import { Suit, TrumpCard } from "../../../../server/play/model/Card";
import { compareCards } from "../../../../server/play/model/CardUtils";
import { PlayerId } from "../../../../server/play/model/GameState";
import { Dispatchers } from "../../../services/dispatchers";
import { getPlayerName } from "../../../services/players/playerName";
import { ClientGame } from "../../../services/room/ClientGame";
import { ShowDetails } from "../../../services/room/ClientGameEventHandler";
import { ClientGameSelectors } from "../../../services/room/ClientGameSelectors";
import { ActionButton } from "./ActionButton";
import { CardHeight, CardWidth } from "./CardSpec";
import { CardSvg } from "./CardSvg";
import "./ShowOverlay.scss";

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: ClientGame;
  dispatchers: Dispatchers;
}

interface State {
  details?: {
    player: PlayerId;
    trumpCards: TrumpCard[];
  };
}

const WindowInset = 200;
const CardAreaMargin = 100;

export class ShowOverlay extends React.PureComponent<Props, State> {
  public state: State = {};

  public render() {
    const { game } = this.props;
    const canShow = ClientGameSelectors.canShow(game);
    return (
      <g>
        {canShow && (
          <ActionButton x={130} y={70} width={200} height={80} text="Show Trump" onClick={this.handleShowTrump} />
        )}
        {game.playState.showIndex !== null && this.renderShowWindow(game.playState.shows[game.playState.showIndex])}
      </g>
    );
  }

  private renderShowWindow(showDetail: ShowDetails) {
    const { width, height, players } = this.props;
    const shownCards = showDetail.trumpCards;
    shownCards.sort(compareCards());
    const cardy = height / 2 - CardHeight / 2;
    const cardOverlap = Math.min(
      (width - WindowInset * 2 - CardAreaMargin * 2 - CardWidth) / (shownCards.length - 1),
      CardWidth + 10
    );
    const showWidth = cardOverlap * (shownCards.length - 1) + CardWidth;
    const startX = width / 2 - showWidth / 2;
    const showPlayer = players.get(showDetail.player);
    const playerName = getPlayerName(showPlayer);
    return (
      <g>
        <rect
          className="show-window-back"
          x={WindowInset}
          y={WindowInset}
          width={width - WindowInset * 2}
          height={height - WindowInset * 2}
          rx={8}
        />
        <text
          className="show-window-text unselectable"
          x={width / 2}
          y={WindowInset + (cardy - WindowInset) / 2}
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {playerName} is showing their trump.
        </text>
        {shownCards.map((card, index) => {
          return <CardSvg key={index} x={startX + index * cardOverlap} y={cardy} card={card} />;
        })}
        <ActionButton
          x={width / 2}
          y={height - WindowInset - (height - WindowInset - cardy - CardHeight) / 2}
          width={150}
          height={80}
          text="Close"
          onClick={this.handleCloseShowWindow}
        />
      </g>
    );
  }

  private handleShowTrump = () => {
    const { game, dispatchers } = this.props;
    const trump = game.playState.hand.filter(([suit]) => suit === Suit.Trump) as TrumpCard[];
    dispatchers.room.play(game.playerId).showTrump(trump);
  };

  private handleCloseShowWindow = () => {
    this.props.dispatchers.room.closeShowWindow();
  };
}
