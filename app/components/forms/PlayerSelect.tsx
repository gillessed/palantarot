import * as React from 'react';
import { Player } from '../../../server/model/Player';
import { Select, ItemRenderer } from '@blueprintjs/select';
import { createSelector } from 'reselect';
import { MenuItem, Button, Classes, HTMLTable, Spinner } from '@blueprintjs/core';
import { loadContainer } from '../../containers/LoadingContainer';
import { playersLoader } from '../../services/players/index';

const PlayerSelectInput = Select.ofType<Item>();

interface Props {
  players: Map<string, Player>;
  unselectedLabel: string;
  onPlayerSelected: (player?: Player) => void;
}

interface State {
  selectedPlayer: Player | null;
}

interface Item {
  text: string;
  activatible?: boolean;
  selects?: Player | null;
}

const NO_FILTER_ITEM: Item = {
  text: 'Search for a player...',
};

export class PlayerSelect extends React.PureComponent<Props, State> {
  private unselectedItem: Item;
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedPlayer: null,
    };
    this.unselectedItem = {
      text: this.props.unselectedLabel,
      activatible: true,
      selects: null,
    };
  }

  private getItemList = createSelector(
    (playerMap: Map<string, Player>) => playerMap,
    (playerMap: Map<string, Player>) => {
      const players: Array<Player> = Array.from(playerMap.values());
      const items: Item[] = players.map((p) => {
        return {
          text: `${p.firstName} ${p.lastName}`,
          activatible: true,
          selects: p,
        }
      });
      items.sort((p1, p2) => {
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
    }
    return (
      <div style={{ marginBottom: 20 }}>
        <PlayerSelectInput
          resetOnClose
          resetOnSelect
          items={itemList}
          itemRenderer={this.renderItem}
          itemListPredicate={this.queryPlayers}
          onItemSelect={this.onPlayerSelected}
          noResults={<MenuItem disabled={true} text='No results.' />}
        >
          <Button text={filterText} rightIcon='caret-down' />
        </PlayerSelectInput>
      </div>
    );
  }

  private queryPlayers = (query: string, items: Item[]): Item[] => {
    if (query === '') {
      return [
        this.unselectedItem,
        NO_FILTER_ITEM,
      ];
    }
    const startsWith: Item[] = [];
    const substring: Item[] = [];
    items.map((item: Item) => {
      if (item.text.toLowerCase().startsWith(query.toLowerCase())) {
        startsWith.push(item);
      } else if (item.text.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        substring.push(item);
      }
    });
    const filtered = [
      this.unselectedItem,
      ...startsWith,
      ...substring,
    ];
    if (filtered.length === 1) {
      return [];
    } else if (filtered.length > 10) {
      const slice = filtered.slice(0, 10);
      slice.push({
        text: `${filtered.length - 10} more...`,
      });
      return slice;
    } else {
      return filtered;
    }
  }

  private renderItem: ItemRenderer<Item> = (item, { handleClick, modifiers }) => {
    return (
      <MenuItem
        className={modifiers.active ? Classes.ACTIVE : ''}
        disabled={item.selects === undefined}
        key={item.text}
        text={item.text}
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
