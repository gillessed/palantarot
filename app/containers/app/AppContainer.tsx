import * as React from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LocationDescriptorObject } from "history";
import { push } from 'react-router-redux';
import { StaticRoutes } from '../../routes';

interface DispatchProps {
  push: (path: string) => void;
  // injected
  location?: LocationDescriptorObject;
}

interface OwnProps {
  children: any[];
}

type Props = OwnProps & DispatchProps;

class Internal extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div>
        <div className='tarot-navbar pt-navbar pt-dark pt-fixed-top'>
          <div className='pt-navbar-group pt-align-left'>
            <div className='pt-navbar-heading'>
              <IndexLink className='pt-minimal pt-button brand-link' to='/'>
                <img src='/static/images/joker.png' style={{ height: 40 }}/>
                Palantarot V3
              </IndexLink>
            </div>
          </div>
            <div className='pt-navbar-group pt-align-right collapsable'>
              {this.renderEnter()}
              {this.renderResults()}
            </div>
        </div>
        <div className='pt-app'>
          <div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }

  private renderEnter() {
    if (!this.props.location || this.props.location.pathname !== StaticRoutes.enter()) {
      return (
        <button className='pt-button pt-minimal pt-icon-manually-entered-data'
                onClick={() => this.props.push(StaticRoutes.enter())}>
          <span className='text hide-on-small'>Enter Score</span>
        </button>
      );
    }
  }

  private renderResults() {
    if (!this.props.location || this.props.location.pathname !== StaticRoutes.results()) {
      return (
        <button className='pt-button pt-minimal pt-icon-th'
                onClick={() => this.props.push(StaticRoutes.results())}>
          <span className='text hide-on-small'>Results</span>
        </button>
      );
    }
  }
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
  return {
    push: (path: string) => { dispatch(push(path)); },
  }
}

export const AppContainer = connect(undefined, mapDispatchToProps)(Internal);