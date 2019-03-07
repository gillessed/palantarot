import * as React from 'react';
import { GameTable, GameOutcome, DEFAULT_COUNT } from '../../components/gameTable/GameTable';
import { Player } from '../../../server/model/Player';
import { Game } from '../../../server/model/Game';
import { playersLoader } from '../../services/players/index';
import { recentGamesLoader } from '../../services/recentGames/index';
import { loadContainer } from '../LoadingContainer';
import { Dispatchers } from '../../services/dispatchers';
import { RecentGameQuery } from '../../../server/db/GameQuerier';

interface InternalProps {
  playerId: string;
  players: Map<string, Player>;
  recentGames: Game[];
  dispatchers: Dispatchers;
  offset: number;
  onOffsetChange: (offset: number) => void;
}

class PlayerRecentGamesTabInternal extends React.PureComponent<InternalProps, {}> {
  constructor(props: InternalProps) {
    super(props);
  }

  public render() {
    const pageState = {
      offset: this.props.offset,
      onOffsetChange: this.props.onOffsetChange,
    };
    return (
      <div className='player-games-table-container table-container'>
        <GameTable
          players={this.props.players}
          games={this.props.recentGames}
          winLossValidator={this.gameWinLossValidator}
          pageState={pageState}
        />
      </div>
    );
  }

  private gameWinLossValidator = (game: Game): GameOutcome => {
    if (!game.handData) {
      return GameOutcome.UNKNOWN;
    }
    let playerOnBidderTeam = false;
    if (game.handData.bidder.id === this.props.playerId ||
      (game.handData.partner && game.handData.partner.id === this.props.playerId)) {
      playerOnBidderTeam = true;
    }
    if (playerOnBidderTeam === (game.points >= 0)) {
      return GameOutcome.WIN;
    } else {
      return GameOutcome.LOSS;
    }
  }
}

const loaders = {
  players: playersLoader,
  recentGames: recentGamesLoader,
};

const PlayerRecentGamesTabLoader = loadContainer(loaders)(PlayerRecentGamesTabInternal);

interface Props {
  playerId: string;
}

interface State {
  query: RecentGameQuery;
  offset: number;
}

export class PlayerRecentGamesTab extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      offset: 0,
      query: { count: DEFAULT_COUNT, player: this.props.playerId },
    };
  }

  public render() {
    return (
      <PlayerRecentGamesTabLoader
        playerId={this.props.playerId}
        onOffsetChange={this.onOffsetChange}
        recentGames={this.state.query}
        offset={this.state.offset}
      />
    )
  }

  private onOffsetChange = (offset: number) => {
    let query: RecentGameQuery;
    if (offset === 0) {
      query = { count: DEFAULT_COUNT, player: this.props.playerId };
    } else {
      query = { count: DEFAULT_COUNT, offset: DEFAULT_COUNT * offset, player: this.props.playerId };
    }
    this.setState({ query, offset });
  }
}
