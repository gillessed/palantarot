import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { StaticRoutes } from '../../routes';
import { withRouter } from 'react-router-dom';
import history from '../../history';

type Props = RouteComponentProps<any>;

class Internal extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div>
        <div className='tarot-navbar pt-navbar pt-dark pt-fixed-top'>
          <div className='pt-navbar-group pt-align-left'>
            <div className='pt-navbar-heading'>
              <Link className='pt-minimal pt-button brand-link' to='/'>
                <img src='/static/images/joker.png' style={{ height: 40 }}/>
                Palantarot V3
              </Link>
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
                onClick={() => history.push(StaticRoutes.enter())}>
          <span className='text hide-on-small'>Enter Score</span>
        </button>
      );
    }
  }

  private renderResults() {
    if (!this.props.location || this.props.location.pathname !== StaticRoutes.results()) {
      return (
        <button className='pt-button pt-minimal pt-icon-th'
                onClick={() => history.push(StaticRoutes.results())}>
          <span className='text hide-on-small'>Results</span>
        </button>
      );
    }
  }
}

export const AppContainer = withRouter<Props>(Internal);