import * as React from 'react';
import { Dispatchers } from '../../services/dispatchers';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players/index';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Player } from '../../../server/model/Player';
import { connect } from 'react-redux';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { createSelector } from 'reselect';
import { MenuItem, Button, Classes, NonIdealState } from '@blueprintjs/core';
import { BidsService } from '../../services/bids/index';
import { BidStats } from '../../../server/model/Bid';
import { BidsGraph } from './BidsGraph';

const PlayerSelect = Select.ofType<Player | string>();

interface Props {
  players: PlayersService;
  bids: BidsService;
}

interface State {
  filterPlayer?: Player;
}

class BidsTabComponent extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {};
  }

  public render() {
    return (
      <div className='bids-table-container table-container'>
        {this.renderFilterContainer()}
        {this.renderTableContainer()}
      </div>
    );
  }

  private renderFilterContainer = () => {
    if (this.props.players.loading) {
      return <SpinnerOverlay size='pt-large' />;
    } else if (this.props.players.value) {
      return this.renderFilter(this.props.players.value);
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderTableContainer() {
    if (this.props.players.loading || this.props.bids.loading) {
      return <SpinnerOverlay size='pt-large' />;
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (this.props.bids.error) {
      return <p>Error loading bid stats: {this.props.bids.error}</p>;
    } else {
      return this.renderGraph(this.props.bids.value);
    }
  }

  private renderGraph(bids?: BidStats) {
    if (this.state.filterPlayer && bids) {
      const name = `${this.state.filterPlayer.firstName} ${this.state.filterPlayer.lastName}`;
      return (
        <div>
          <h3> {name}'s Bid Breakdown </h3>
          <BidsGraph bids={bids} />
        </div>
      );
    } else {
      return <NonIdealState visual='search' title='Select a player'/>;
    }
  }

  private getPlayerList = createSelector(
    (playerMap: Map<string, Player>) => playerMap,
    (playerMap: Map<string, Player>) => {
      const players: Array<Player> = Array.from(playerMap.values());
      players.sort((p1, p2) => {
        return `${p1.firstName} ${p1.lastName}`.localeCompare(`${p2.firstName} ${p2.lastName}`);
      });
      const all = (players as Array<Player | string>);
      all.unshift('Selet a Player');
      return all;
    },
  );

  private renderFilter = (players: Map<string, Player>) => {
    const playerList = this.getPlayerList(players);
    let filterText = 'Select a Player';
    if (this.state.filterPlayer) {
      filterText = `${this.state.filterPlayer.firstName} ${this.state.filterPlayer.lastName}`;
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <PlayerSelect
          resetOnClose
          resetOnSelect
          items={playerList}
          itemRenderer={this.renderPlayer}
          itemPredicate={this.queryPlayers}
          onItemSelect={this.onPlayerSelected}
          noResults={<MenuItem disabled={true} text='No results.' />}
        >
          <Button text={filterText} rightIcon='caret-down' />
        </PlayerSelect>
      </div>
    );
  }

  private queryPlayers = (query: string, player: Player | string) => {
    if (typeof player === 'string') { 
      return true;
    }
    const name = `${player.firstName} ${player.lastName}`;
    return name.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }

  private renderPlayer: ItemRenderer<Player | string> = (player, { handleClick, modifiers }) => {
    if (typeof player === 'string') {
      return (
        <MenuItem
          className={modifiers.active ? Classes.ACTIVE : ''}
          key={'All'}
          text='Select a Player'
          onClick={handleClick}
        />
      );
    }
    return (
      <MenuItem
        className={modifiers.active ? Classes.ACTIVE : ''}
        key={player.id}
        text={`${player.firstName} ${player.lastName}`}
        onClick={handleClick}
      />
    );
  }

  private onPlayerSelected = (player: Player | string) => {
    this.setState({
      filterPlayer: (typeof player === 'string' ? undefined : player),
    }, () => {
      const playerId = typeof player === 'string' ? undefined : player.id;
      if (playerId) {
        this.dispatchers.bids.request({
          playerId,
        });
      }
    });
  }
}

const mapStateToProps = (state: ReduxState): Props => {
  return {
    players: state.players,
    bids: state.bids,
  }
}

export const BidsTab = connect(mapStateToProps)(BidsTabComponent);