import React from "react";
import { MultiSelect, ItemRenderer } from "@blueprintjs/select";
import { MenuItem, Button } from "@blueprintjs/core";

export const AllBids = [10, 20, 40, 80, 160];

export namespace BidQueryComponent {
  export interface Props {
    bidQuery: number[];
    onChange: (bidQuery: number[]) => void;
  }
}

const BidSelect = MultiSelect.ofType<number>();

export class BidQueryComponent extends React.PureComponent<BidQueryComponent.Props> {
  public render() {
    const clearButton =
      this.props.bidQuery.length > 0 ? <Button icon="cross" minimal={true} onClick={this.handleClear} /> : undefined;

    return (
      <BidSelect
        items={AllBids}
        itemRenderer={this.renderItem}
        tagRenderer={this.renderTag}
        onItemSelect={this.handleItemSelect}
        selectedItems={this.props.bidQuery}
        tagInputProps={{ onRemove: this.handleTagRemove, rightElement: clearButton }}
      />
    );
  }

  public renderItem: ItemRenderer<number> = (bid: number, { handleClick }) => {
    return <MenuItem key={bid} text={`${bid}`} onClick={handleClick} />;
  };

  private renderTag = (bid: number) => {
    return `${bid}`;
  };

  private handleItemSelect = (bid: number) => {
    if (this.props.bidQuery.indexOf(bid) < 0) {
      const newBids = [...this.props.bidQuery, bid];
      newBids.sort((b1, b2) => (b1 < b2 ? -1 : b1 > b2 ? 1 : 0));
      this.props.onChange(newBids);
    }
  };

  private handleTagRemove = (_bid: string, index: number) => {
    const { bidQuery } = this.props;
    const newBids = [...bidQuery];
    newBids.splice(index, 1);
    this.props.onChange(newBids);
  };

  private handleClear = () => {
    this.props.onChange([]);
  };
}
