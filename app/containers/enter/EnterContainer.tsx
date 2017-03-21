import * as React from 'react';
import { GameForm } from '../../components/gameForm/GameForm';

interface Props {
  children: any[];
}

interface State {
  numberOfPlayers: 5,
}

export class EnterContainer extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      numberOfPlayers: 5,
    };
  }

  public render() {
    return (
      <div className='enter-container pt-ui-text-large'>
        <div className='title'>
          <h1>Enter Score</h1>
        </div>
        <GameForm
          players={[]}
        />
      </div>
    );
  }
}