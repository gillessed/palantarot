import React from 'react';
import { Icon } from '@blueprintjs/core';

interface Props {
  text: string;
  index: number;
  sort: 'asc' | 'desc' | undefined;
  onClick: (index: number) => void;
}

export class AllWinPercentagesTableHeader extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <th className='sortable' onClick={this.onClick}>{this.props.text}{this.renderIcon()}</th>
    );
  }

  private renderIcon = () => {
    if (this.props.sort === 'asc') {
      return (
        <Icon icon='chevron-down'/>
      );
    } else if (this.props.sort === 'desc') {
      return (
        <Icon icon='chevron-up'/>
      );
    }
  }

  private onClick = () => {
    this.props.onClick(this.props.index);
  }
}