import * as React from 'react';
import { StateViewProps } from '../state/StateViewProps';
import { BottomLeftStatus } from './BottomLeftStatus';
import { CurrentStateStatus } from './CurrentStateStatus';

export class StatusOverlay extends React.PureComponent<StateViewProps> {
  public render() {
    return (<g>
      <BottomLeftStatus {...this.props} />
      <CurrentStateStatus {...this.props} />
    </g>)
  }
}
