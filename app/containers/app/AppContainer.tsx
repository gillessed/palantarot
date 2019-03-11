import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { StaticRoutes } from '../../routes';
import { withRouter } from 'react-router-dom';
import history from '../../history';
import { Navbar, Classes, Alignment, Button } from '@blueprintjs/core';
import classNames from 'classnames';

type Props = RouteComponentProps<any>;

class Internal extends React.PureComponent<Props, {}> {
  public render() {
    const navbarClasses = classNames('tarot-navbar', Classes.DARK);
    return (
      <div>
        <Navbar className={navbarClasses} fixedToTop={true}>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <Link className='bp3-minimal bp3-button brand-link' to='/'>
                <img src='/static/images/joker.png' style={{ height: 40 }}/>
                Palantarot V3
              </Link>
            </Navbar.Heading>
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            {this.renderEnter()}
            {this.renderResults()}
          </Navbar.Group>
        </Navbar>
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
        <Button
          icon='manually-entered-data'
          minimal
          onClick={this.onEnterPressed}
        >
          <span className='hide-on-small'>Enter Score</span>
        </Button>
      );
    }
  }

  private onEnterPressed = () => {
    history.push(StaticRoutes.enter());
  }

  private renderResults() {
    if (!this.props.location || this.props.location.pathname !== StaticRoutes.results()) {
      return (
        <Button
          icon='th'
          minimal
          onClick={this.onResultsPressed}
        >
          <span className='hide-on-small'>Results</span>
        </Button>
      );
    }
  }

  private onResultsPressed = () => {
    history.push(StaticRoutes.results())
  }
}

export const AppContainer = withRouter<Props>(Internal);