import React from "react";
import { Player } from "../../../server/model/Player";
import { Result } from "../../../server/model/Result";
import { playersLoader } from "../../services/players/index";
import { getPlayerName } from "../../services/players/playerName";
import { resultsLoader } from "../../services/results/index";
import { loadContainer } from "../LoadingContainer";

interface Props {
  playerId: string;
  players: Map<string, Player>;
  results: Result[];
}

class PlayerBannerInternal extends React.PureComponent<Props, {}> {
  public render() {
    const player = this.props.players.get(this.props.playerId)!;
    const playerName = getPlayerName(player);
    const sortedResults = this.props.results.sort((r1: Result, r2: Result) => {
      if (r1.all.points > r2.all.points) {
        return -1;
      } else if (r1.all.points < r2.all.points) {
        return 1;
      } else {
        return 0;
      }
    });
    const playerOrder = sortedResults.map((result) => result.id);
    const rankIndex = playerOrder.indexOf(player.id);
    const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;
    const playerCount = playerOrder.length;
    const playerResult = sortedResults.find((result) => result.id === player.id);
    const score = playerResult ? playerResult.all.points : undefined;
    const rankString = rank ? `${rank} / ${playerCount}` : "N/A";
    return (
      <div>
        <div className="player-banner">
          <div className="player-title-container">
            <span>
              <h1 className="bp3-heading"> {playerName} </h1>
            </span>
            <h6 className="bp3-heading"> Monthly Rank: {rankString} </h6>
          </div>
          {this.renderScore(score)}
        </div>
      </div>
    );
  }

  public renderScore(score: number | undefined) {
    const scoreText = score !== undefined ? (score > 0 ? "+" + score : score) : "N/A";
    const scoreClass = score !== undefined ? (score > 0 ? " game-win" : " game-loss") : "none";
    return <div className={"player-point-display" + scoreClass}>{scoreText}</div>;
  }
}

const loaders = {
  players: playersLoader,
  results: resultsLoader,
};

export const PlayerBanner = loadContainer(loaders)(PlayerBannerInternal);
