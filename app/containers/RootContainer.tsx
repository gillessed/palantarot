import * as React from 'react';
import {IndexLink, Link} from 'react-router';

interface Props {
  children: any[];
}

export class RootContainer extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div>
        <div className="pt-navbar pt-dark pt-fixed-top">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">
              <IndexLink className="pt-minimal pt-button brand-link" to="/">Palantarot V3</IndexLink>
            </div>
          </div>
          <div className="pt-navbar-group pt-align-right">
            <Link className="pt-button pt-minimal pt-icon-manually-entered-data" to="enter">Enter Score</Link>
            <Link className="pt-button pt-minimal pt-icon-th" to="enter">Results</Link>
          </div>
        </div>
        <div className="pt-app">
          {this.props.children}
        </div>
      </div>
    );
  }
}