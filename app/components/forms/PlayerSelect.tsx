import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { createSelector } from 'reselect';
import { MenuItem, Button, Classes, HTMLTable, Spinner } from '@blueprintjs/core';
import { loadContainer } from '../../containers/LoadingContainer';
import { playersLoader } from '../../services/players/index';
import classNames from 'classnames';

const PlayerSelectInput = Select.ofType<Item>();

interface Props {
  players: Map<string, Player>;
  recentPlayers?: Player[];
  selectedPlayers?: Player[];
  unselectedLabel?: string;
  onPlayerSelected: (player?: Player) => void;
}

interface State {
  selectedPlayer: Player | null;
}

interface Item {
  text: string;
  activatible?: boolean;
  selects?: Player | null;
  recent?: boolean;
  queryText: string;
}

const NO_FILTER_ITEM: Item = {
  text: 'Search for a player...',
  queryText: '',
};

export class PlayerSelect extends React.PureComponent<Props, State> {
  private unselectedItem: Item;
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedPlayer: null,
    };
    this.unselectedItem = {
      text: this.props.unselectedLabel || '',
      activatible: true,
      selects: null,
      queryText: '',
    };
  }

  private getItemList = createSelector(
    (playerMap: Map<string, Player>) => playerMap,
    (playerMap: Map<string, Player>) => {
      const players: Array<Player> = Array.from(playerMap.values());
      const items: Item[] = players.map((p) => {
        const text = `${p.firstName} ${p.lastName}`;
        return {
          text,
          queryText: text.toLowerCase(),
          activatible: true,
          selects: p,
          recent: !!(this.props.recentPlayers && this.props.recentPlayers.find((rp) => rp.id === p.id)),
        };
      });
      items.sort((p1, p2) => {
        if (p1.recent && !p2.recent) {
          return -1;
        } else if (p2.recent && !p1.recent) {
          return 1;
        }
        return p1.text.localeCompare(p2.text);
      });
      return items;
    },
  );

  public render() {
    const itemList = this.getItemList(this.props.players);
    let filterText = this.props.unselectedLabel;
    if (this.state.selectedPlayer) {
      filterText = `${this.state.selectedPlayer.firstName} ${this.state.selectedPlayer.lastName}`;
    } else {
      filterText = 'Select Player';
    }
    return (
      <div className="player-select-container">
        <PlayerSelectInput
          resetOnClose
          resetOnSelect
          items={itemList}
          itemRenderer={this.renderItem}
          itemListPredicate={this.queryPlayers}
          onItemSelect={this.onPlayerSelected}
          noResults={<MenuItem disabled={true} text='No results.' />}
        >
          <Button text={filterText} rightIcon='caret-down' fill />
        </PlayerSelectInput>
      </div>
    );
  }

  private queryPlayers = (query: string, items: Item[]): Item[] => {
    const lowerCaseQuery = query.toLowerCase();
    if (query === '') {
      const start = this.props.unselectedLabel ? [
        this.unselectedItem,
        NO_FILTER_ITEM,
      ] : [NO_FILTER_ITEM];
      start.push(...items.filter((item) => item.recent));
      return start;
    }
    const startsWith: Item[] = [];
    const substring: Item[] = [];
    items.map((item: Item) => {
      if (item.queryText === 'alex baker' && lowerCaseQuery === 'alex b') {
        console.log('match?: ', item.queryText.startsWith(lowerCaseQuery));
      }
      if (item.queryText.startsWith(lowerCaseQuery)) {
        startsWith.push(item);
      } else if (item.queryText.indexOf(lowerCaseQuery) >= 0) {
        substring.push(item);
      }
    });
    const filtered = [
      ...startsWith,
      ...substring,
    ];
    if (this.props.unselectedLabel) {
      filtered.unshift(this.unselectedItem);
    }
    if (filtered.length === 1 && this.props.unselectedLabel) {
      return [];
    } else if (filtered.length > 13) {
      const slice = filtered.slice(0, 13);
      slice.push({
        text: `${filtered.length - 13} more...`,
        queryText: '',
      });
      return slice;
    } else {
      return filtered;
    }
  }

  private renderItem: ItemRenderer<Item> = (item, { handleClick, modifiers }) => {
    const recent = !!item.recent;
    const selectedPlayers = this.props.selectedPlayers;
    const selects = item.selects;
    const selected = !!(selectedPlayers && selects && selectedPlayers.find((sp) => sp.id === selects.id));
    const classes = classNames('player-select-item', {
      'recent': recent && !selected,
      'selected': selected,
    });
    const label = selected ? 'Selected' :
      recent ? 'Recent' : undefined;
    return (
      <MenuItem
        className={classes}
        disabled={item.selects === undefined}
        key={item.text}
        text={item.text}
        label={label}
        onClick={handleClick}
      />
    );
  }

  private onPlayerSelected = (item: Item) => {
    if (item.selects !== undefined) {
      this.setState({
        selectedPlayer: item.selects,
      }, () => {
        this.props.onPlayerSelected(item.selects || undefined);
      });
    }
  }
}

export const PlayerSelectContainer = loadContainer({
  players: playersLoader,
})(PlayerSelect);
