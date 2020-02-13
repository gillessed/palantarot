import * as React from 'react';
import { MultiSelect, ItemRenderer } from '@blueprintjs/select';
import { MenuItem, Button } from '@blueprintjs/core';

export const AllBids = [3, 4, 5];

export namespace BidQueryComponent {
  export interface Props {
    numberOfPlayers: number[];
    onChange: (numberOfPlayers: number[]) => void;
  }
}

const BidSelect = MultiSelect.ofType<number>();

export class PlayerCountQueryComponent extends React.PureComponent<BidQueryComponent.Props> {
  public render() {
    const clearButton =
      this.props.numberOfPlayers.length > 0 ? <Button icon="cross" minimal={true} onClick={this.handleClear} /> : undefined;

    return (
      <BidSelect
        items={AllBids}
        itemRenderer={this.renderItem}
        tagRenderer={this.renderTag}
        onItemSelect={this.handleItemSelect}
        selectedItems={this.props.numberOfPlayers}
        tagInputProps={{ onRemove: this.handleTagRemove, rightElement: clearButton }}
      />
    );
  }

  public renderItem: ItemRenderer<number> = (playerNumber: number, { handleClick }) => {
    return (
      <MenuItem
        key={playerNumber}
        text={`${playerNumber}`}
        onClick={handleClick}
      />
    );
  }

  private renderTag = (bid: number) => {
    return `${bid}`;
  }

  private handleItemSelect = (bid: number) => {
    if (this.props.numberOfPlayers.indexOf(bid) < 0) {
      const newNumberOfPlayers = [...this.props.numberOfPlayers, bid];
      newNumberOfPlayers.sort((n1, n2) => n1 < n2 ? -1 : n1 > n2 ? 1 : 0);
      this.props.onChange(newNumberOfPlayers);
    }
  }

  private handleTagRemove = (_bid: string, index: number) => {
    const { numberOfPlayers } = this.props;
    const newNumberOfPlayers = [...numberOfPlayers];
    newNumberOfPlayers.splice(index, 1);
    this.props.onChange(newNumberOfPlayers);
  }

  private handleClear = () => {
    this.props.onChange([]);
  }
}
