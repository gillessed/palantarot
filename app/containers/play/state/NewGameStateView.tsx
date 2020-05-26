import * as React from 'react';
import { Player } from '../../../../server/model/Player';
import { InGameSelectors } from '../../../play/ingame/InGameSelectors';
import { InGameState } from '../../../play/ingame/InGameService';

interface Props {
  width: number;
  height: number;
  players: Map<string, Player>;
  game: InGameState;
}

export class NewGameStateView extends React.PureComponent<Props> {
  public render() {
    return (<g>
      {this.renderTitles()}
    </g>);
  }

  private renderTitles() {
    const playerOrder = InGameSelectors.getRotatedPlayerOrder(this.props.game);
    return (<g>
      {playerOrder.length}
    </g>)
  }
}
