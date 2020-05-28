import { IconName } from '@blueprintjs/core';
import { IconSvgPaths16 } from '@blueprintjs/icons';
import * as React from 'react';

interface Props extends React.SVGProps<SVGGeometryElement> {
  x: number;
  y: number;
  icon: IconName;
}

export class SvgBlueprintIcon extends React.PureComponent<Props> {
  public render() {
    const { x, y, icon, ...svgProps } = this.props;
    return (
      <g transform={`translate(${x},${y}) scale(2, 2)`} {...svgProps}>
        {IconSvgPaths16[icon].map(this.renderPath)}
      </g>
    )
  }

  private renderPath = (path: string, i: number) => {
    return <path key={i} d={path} fillRule='evenodd'/>;
  }
}