import React from "react";

interface Props {
  match: {
    params: {
      gameId: string
      player: string
    }
  }
}

export class InGameContainer extends React.PureComponent<Props> {
  render() {
    return (
      <div>
        {this.props.match.params.gameId}-{this.props.match.params.player}
      </div>
    )
  }
}