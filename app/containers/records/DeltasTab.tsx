import * as React from 'react';
import { Dispatchers } from '../../services/dispatchers';
import { DispatchersContextType, DispatchContext } from '../../dispatchProvider';
import { ReduxState } from '../../services/rootReducer';
import { PlayersService } from '../../services/players/index';
import { DeltasService } from '../../services/deltas/index';
import { SpinnerOverlay } from '../../components/spinnerOverlay/SpinnerOverlay';
import { Player } from '../../../server/model/Player';
import { Deltas, Delta } from '../../../server/model/Delta';
import { connect } from 'react-redux';

interface Props {
  players: PlayersService;
  deltas: DeltasService;
}

interface State {
    filterPlayer?: string;
}

class DeltasTabComponent extends React.PureComponent<Props, State> {
  public static contextTypes = DispatchersContextType;
  private dispatchers: Dispatchers;
  
  constructor(props: Props, context: DispatchContext) {
    super(props, context);
    this.dispatchers = context.dispatchers;
  }

  public componentWillMount() {
    this.dispatchers.deltas.request({
      length: 10,
    });
  }

  public render() {
    return (
      <div className='deltas-table-container table-container'>
        {this.renderFilter()}
        {this.renderContainer()}
      </div>
    );
  }

  private renderContainer() {
    if (this.props.players.loading || this.props.deltas.loading) {
      return <SpinnerOverlay size='pt-large'/>;
    } else if (this.props.players.value && this.props.deltas.value) {
      return this.renderContents(this.props.players.value, this.props.deltas.value);
    } else if (this.props.players.error) {
      return <p>Error loading players: {this.props.players.error}</p>;
    } else if (this.props.deltas.error) {
      return <p>Error loading deltas games: {this.props.deltas.error}</p>;
    } else {
      return <p>Something went wrong...</p>;
    }
  }

  private renderContents(players: Map<string, Player>, deltas: Deltas) {
    return [
      <h3> Highest Deltas </h3>,
      this.renderDeltaTable(players, deltas.maximums, 'Highest Deltas'),
      <h3> Lowest Deltas </h3>,
      this.renderDeltaTable(players, deltas.minimums, 'Lowest Deltas'),
    ];
  }

  private renderDeltaTable(players: Map<string, Player>, deltaList: Delta[], title: string) {
    return (
      <table key={title} className='deltas-table pt-html-table pt-html-table-bordered'>
        <thead>
          <tr>
            <th>Player</th>
            <th>{title}</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {deltaList.map((delta, index) => this.renderDelta(players, delta, index))}
        </tbody>
      </table>
    );
  }

  private renderDelta = (players: Map<string, Player>, delta: Delta, index: number) => {
    const player = players.get(delta.playerId);
    let playerName = delta.playerId;
    if (player) {
      playerName = `${player.firstName} ${player.lastName}`;
    }
    return (
      <tr key={index}>
        <td>{playerName}</td>
        <td>{this.renderDeltaNumber(delta.delta)}</td>
        <td>{delta.date}</td>
      </tr>
    );
  }

  private renderDeltaNumber(delta: number) {
    if (delta < 0) {
      return (
        <span className='score-delta' style={{color: 'red'}}>
          <span className='pt-icon pt-icon-arrow-down'></span>
          {delta}
        </span>
      );
    } else if (delta > 0) {
      return (
        <span className='score-delta' style={{color: 'green'}}>
          <span className='pt-icon pt-icon-arrow-up'></span>
          {delta}
        </span>
      );
    } else {
      return <div/>;
    }
  }

  private renderFilter = () => {
    // return (
    //   <select
    //     label='Filter by player'
    //   />
    // );
  }

  // private renderLowTable() {

  // }

//   private renderHeader = (text: string, index: number) => {
//     let sort: 'asc' | 'desc' | undefined;
//     if (this.state.sort === index) {
//       sort = this.state.order;
//     }
//     return (
//       <WinPercentagesTableHeader
//         key={index}
//         text={text}
//         index={index}
//         sort={sort}
//         onClick={this.onHeaderClicked}
//       />
//     );
//   }

//   private onHeaderClicked = (index: number) => {
//     if (index === this.state.sort) {
//       this.setState({
//         order: this.state.order === 'asc' ? 'desc' : 'asc',
//       });
//     } else {
//       this.setState({
//         sort: index,
//         order: 'asc',
//       });
//     }
//   }

//   private onFilterRecordsChanged = () => {
//     this.setState({
//       filterPlayers: !this.state.filterPlayers,
//     });
//   }

//   private renderRow = (row: Row) => {
//     return (
//       <tr key={row[0]}>
//         {this.renderCell(row[0])}
//         {this.renderCell(row[1], true)}
//         {this.renderCell(row[2])}
//         {this.renderCell(row[3], true)}
//         {this.renderCell(row[4], true)}
//         {this.renderCell(row[5])}
//         {this.renderCell(row[6], true)}
//         {this.renderCell(row[7], true)}
//         {this.renderCell(row[8])}
//         {this.renderCell(row[9], true)}
//         {this.renderCell(row[10], true)}
//         {this.renderCell(row[11])}
//       </tr>
//     );
//   }

//   private renderCell = (entry: string | number | undefined, percent?: boolean) => {
//     if (typeof entry === 'string') {
//       return <td>{entry}</td>;
//     } else if (entry !== undefined) {
//       let value = `${chop(entry * (percent ? 100 : 1), 1)}`;
//       if (percent) {
//         value += '%';
//       }
//       return <td>{value}</td>
//     } else {
//       return <td className='not-applicable'>N/A</td>;
//     }
//   }
}

const mapStateToProps = (state: ReduxState): Props => {
  return {
    players: state.players,
    deltas: state.deltas,
  }
}

export const DeltasTab = connect(mapStateToProps)(DeltasTabComponent);