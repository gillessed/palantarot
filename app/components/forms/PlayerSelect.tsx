import { Button, MenuItem } from '@blueprintjs/core';
import { ItemRenderer, Select } from '@blueprintjs/select';
import classNames from 'classnames';
import * as React from 'react';
import { createSelector } from 'reselect';
import { Player } from '../../../server/model/Player';
import { loadContainer } from '../../containers/LoadingContainer';
import { playersLoader } from '../../services/players/index';
import { findMatches } from '../../utils/stringMatch';

const PlayerSelectInput = Select.ofType<PlayerSelect.Item>();

export namespace PlayerSelect {
  export interface Props {
    players: Map<string, Player>;
    recentPlayers?: Player[];
    selectedPlayers?: Player[];
    unselectedLabel?: string;
    onPlayerSelected: (player?: Player) => void;
    selectedPlayer?: Player;
  }

  export interface State {
    selectedPlayer: Player | null;
  }

  export interface Item {
    text: string;
    activatible?: boolean;
    selects?: Player | null;
    recent?: boolean;
    queryText: string;
    hightlights?: [number, number][];
  }
}

const NO_FILTER_ITEM: PlayerSelect.Item = {
  text: 'Search for a player...',
  queryText: '',
};

export class PlayerSelect extends React.PureComponent<PlayerSelect.Props, PlayerSelect.State> {
  private unselectedItem: PlayerSelect.Item;
  constructor(props: PlayerSelect.Props) {
    super(props);
    this.state = {
      selectedPlayer: this.props.selectedPlayer || null,
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
      const items: PlayerSelect.Item[] = players.map((p) => {
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

  private queryPlayers = (query: string, items: PlayerSelect.Item[]): PlayerSelect.Item[] => {
    if (query === '') {
      const start = this.props.unselectedLabel ? [
        this.unselectedItem,
        NO_FILTER_ITEM,
      ] : [NO_FILTER_ITEM];
      start.push(...items.filter((item) => item.recent));
      return start;
    }
    const filtered = findMatches(query, items);
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

  private renderItem: ItemRenderer<PlayerSelect.Item> = (item, { handleClick, modifiers }) => {
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
    const text = item.hightlights ? this.renderHightlights(item.text, item.hightlights) : item.text;
    return (
      <MenuItem
        className={classes}
        disabled={item.selects === undefined}
        key={item.text}
        text={text}
        label={label}
        onClick={handleClick}
      />
    );
  }

  private renderHightlights = (text: string, highlights: [number, number][]) => {
    const nodes: JSX.Element[] = [];
    let startText = highlights[0][0] > 0 ? text.substring(0, highlights[0][0]) : undefined;
    if (startText !== undefined) {
      nodes.push(<span key='start'>{startText}</span>);
    }
    for (let hightlightIndex = 0; hightlightIndex < highlights.length; hightlightIndex++) {
      const highlighted = text.substring(highlights[hightlightIndex][0], highlights[hightlightIndex][1] + 1);
      nodes.push(<span className='highlighted' key={`h-${hightlightIndex}`}>{highlighted}</span>);
      if (hightlightIndex < highlights.length - 1) {
      const unhighlighted = text.substring(highlights[hightlightIndex][1] + 1, highlights[hightlightIndex + 1][0]);
      nodes.push(<span key={`u-${hightlightIndex}`}>{unhighlighted}</span>);
      } else if (highlights[hightlightIndex][1] < text.length) {
        const unhighlighted = text.substring(highlights[hightlightIndex][1] + 1, text.length);
        nodes.push(<span key={`u-${hightlightIndex}`}>{unhighlighted}</span>);
      }
    }
    return (
      <span className='hightlighted-match'>
        {nodes}
      </span>
    );
  }

  private onPlayerSelected = (item: PlayerSelect.Item) => {
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
