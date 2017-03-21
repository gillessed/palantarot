import * as React from 'react';
import { Player } from '../../../server/model/Player';


interface Props {
  players: Player[];
  selectedPlayer?: Player;
  label: string;
  style?: any;
}

interface State {
  selected?: Player;
}

export class PlayerSelector extends React.PureComponent<Props, State> {
  public render() {
    return (
      <label className="pt-label" style={{textAlign: 'center'}}>
        {this.props.label}
        <div className="pt-select" style={{...this.props.style}}>
          <select onChange={this.onChange}>
            <option value=""></option>
            {this.props.players.map(this.renderPlayerOption)}
          </select>
        </div>
      </label>
    );
  }

  private renderPlayerOption(player: Player) {
    return <option value={player.id}>{player.firstName} {player.lastName}</option>;
  }

  private onChange = () => {

  }
}