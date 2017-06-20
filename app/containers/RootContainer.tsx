import * as React from 'react';
import { connect } from 'react-redux';
import {IndexLink } from 'react-router';
import { push } from 'react-router-redux';

interface DispatchProps {
  push: (path: string) => void;
}

interface OwnProps {
  children: any[];
}

type Props = OwnProps & DispatchProps;

class Internal extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div>
        <div className="tarot-navbar pt-navbar pt-dark pt-fixed-top">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">
              <IndexLink className="pt-minimal pt-button brand-link" to="/">Palantarot V3</IndexLink>
            </div>
          </div>
          <div className="pt-navbar-group pt-align-right collapsable">
            <button className="pt-button pt-minimal pt-icon-manually-entered-data" onClick={() => this.props.push("enter")}>
              <span className="hide-on-small">Enter Score</span>
            </button>
            <button className="pt-button pt-minimal pt-icon-th" onClick={() => this.props.push("results")}>
              <span className="hide-on-small">Results</span>
            </button>
          </div>
        </div>
        <div className="pt-app">
          <div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    push: (path: string) => { dispatch(push(path)); },
  }
}

export const RootContainer = connect(undefined, mapDispatchToProps)(Internal);