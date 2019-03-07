import React from 'react';

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
                <span className='pt-icon-standard pt-icon-chevron-down'/>
            );
        } else if (this.props.sort === 'desc') {
            return (
                <span className='pt-icon-standard pt-icon-chevron-up'/>
            );
        }
    }

    private onClick = () => {
        this.props.onClick(this.props.index);
    }
}