import React from "react";
import { Spinner, ISpinnerProps } from "@blueprintjs/core";

interface Props extends ISpinnerProps {
  text?: string;
}

export class SpinnerOverlay extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div className="pt-spinner-overlay-container">
        {this.renderText()}
        <Spinner {...this.props} />
      </div>
    );
  }

  private renderText() {
    if (this.props.text) {
      return <div className="pt-spinner-overlay-text">{this.props.text}</div>;
    }
  }
}
