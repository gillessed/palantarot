import * as React from 'react';
import { Dispatchers } from '../../services/dispatchers';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players/index';
import { DeltasService } from '../../services/deltas/index';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Player } from '../../../server/model/Player';
import { Deltas, Delta } from '../../../server/model/Delta';
import { connect } from 'react-redux';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { createSelector } from 'reselect';
import { MenuItem, Button, Classes, HTMLTable } from '@blueprintjs/core';

const PlayerSelect = Select.ofType<Player | string>();

interface Props {
  players: PlayersService;
  deltas: DeltasService;
}

interface State {
  filterPlayer?: Player;
}

class DeltasTabComponent extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;

  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
    this.state = {};
  }

  public componentWillMount() {
    this.dispatchers.deltas.request({
      length: 10,
    });
  }

  public render() {
    return (
      <div className='deltas-table-container table-container'>
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
    if (this.props.players.loading || this.props.deltas.loading) {
      return <SpinnerOverlay size='pt-large' />;
    } else if (this.props.players.value && this.props.deltas.value) {
      return this.renderTable(this.props.players.value, this.props.deltas.value)
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (this.props.deltas.error) {
      return <p>Error loading deltas games: {this.props.deltas.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderTable(players: Map<string, Player>, deltas: Deltas) {
    return (
      <>
        <h3 className='bp3-heading'> Highest Deltas </h3>,
        {this.renderDeltaTable(players, deltas.maximums, 'Highest Deltas')}
        <h3 className='bp3-heading'> Lowest Deltas </h3>,
        {this.renderDeltaTable(players, deltas.minimums, 'Lowest Deltas')}
      </>
    );
  }

  private renderDeltaTable(players: Map<string, Player>, deltaList: Delta[], title: string) {
    return (
      <HTMLTable className='deltas-table' bordered>
        <thead>
          <tr>
            <th>Player</th>
            <th>{title}</th>
            <th>Date</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          {deltaList.map((delta, index) => this.renderDelta(players, delta, index))}
        </tbody>
      </HTMLTable>
    );
  }

  private renderDelta = (players: Map<string, Player>, delta: Delta, index: number) => {
    const player = players.get(delta.playerId);
    let playerName = delta.playerId;
    if (player) {
      playerName = `${player.firstName} ${player.lastName}`;
    }
    return (
      <tr key={index}>
        <td>{playerName}</td>
        <td>{this.renderDeltaNumber(delta.delta)}</td>
        <td>{delta.date}</td>
        <td>{delta.gameCount}</td>
      </tr>
    );
  }

  private renderDeltaNumber(delta: number) {
    if (delta < 0) {
      return (
        <span className='score-delta' style={{ color: 'red' }}>
          <span className='pt-icon pt-icon-arrow-down'></span>
          {delta}
        </span>
      );
    } else if (delta > 0) {
      return (
        <span className='score-delta' style={{ color: 'green' }}>
          <span className='pt-icon pt-icon-arrow-up'></span>
          {delta}
        </span>
      );
    } else {
      return (
        <span className='score-delta'>
          {delta}
        </span>
      );
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
      all.unshift('All Players');
      return all;
    },
  );

  private renderFilter = (players: Map<string, Player>) => {
    const playerList = this.getPlayerList(players);
    let filterText = 'All Players';
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
          text='All Players'
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
      this.dispatchers.deltas.request({
        playerId: typeof player === 'string' ? undefined : player.id,
        length: 10,
      });
    });
  }
}

const mapStateToProps = (state: ReduxState): Props => {
  return {
    players: state.players,
    deltas: state.deltas,
  }
}

export const DeltasTab = connect(mapStateToProps)(DeltasTabComponent);