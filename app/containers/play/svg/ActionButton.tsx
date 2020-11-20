import classNames from 'classnames';
import * as React from 'react';
import './ActionButton.scss';

interface Props {
  className?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  text: string;
  disabled?: boolean;
  selected?: boolean;
  color?: 'blue' | 'white';
  onClick: () => void;
}

export class ActionButton extends React.PureComponent<Props> {
  public render() {
    const { x, y, width, height, className, text, disabled, selected, color } = this.props;
    const left = x - width / 2;
    const top = y - height / 2;
    const classes = classNames(
      className ?? '',
      'action-button',
      {
        'enabled': !disabled,
        'disabled': disabled, 
      },
    );
    const rectClasses = classNames(
      'action-button-rect',
      color ?? 'blue',
      {
        'enabled': !disabled,
        'disabled': disabled, 
        'selected': selected,
      },
    );
    return (
      <g className={classes} opacity={disabled ? 0.5 : 1} onClick={this.onClick}>
        <rect
          className={rectClasses}
          width={width}
          height={height}
          x={left}
          y={top}
          rx={10}
        />
        <text
          className='action-button-text unselectable'
          x={x}
          y={y}
          textAnchor='middle'
          dominantBaseline='central'
        >
          {text}
        </text>
      </g>
    );
  }

  private onClick = () => {
    if (this.props.onClick && !this.props.disabled) {
      this.props.onClick();
    }
  }
}
