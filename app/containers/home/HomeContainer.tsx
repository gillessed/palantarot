import * as React from 'react';
import { Link } from 'react-router';
import { Button, Intent } from '@blueprintjs/core';
import { StaticRoutes } from '../../routes';

interface Props {
  children: any[];
}

export class HomeContainer extends React.PureComponent<Props, {}> {

  public render() {
    return (
      <div className='home-container pt-ui-text-large'>
        <div className='logo dark'>Palantarot</div>
        <div className='subtitle dark'>Where all the points are fake</div>
        <div className='menu'>
          {this.renderMenuItem('Enter Score', 'manually-entered-data', StaticRoutes.enter(), Intent.SUCCESS)}
          {this.renderMenuItem('Results', 'th', StaticRoutes.results())}
          {this.renderMenuItem('Recent Games', 'history', StaticRoutes.recent())}
          {this.renderMenuItem('Advanced Search', 'search', StaticRoutes.search())}
          {this.renderMenuItem('Records', 'glass', StaticRoutes.records())}
          {this.renderMenuItem('Add New Player', 'add', StaticRoutes.addPlayer())}
          {this.renderMenuItem('Tarothon', 'ninja', StaticRoutes.tarothon(), Intent.WARNING)}
        </div>
        <div className='info-overlay'>
          <span className='callout'>
            <span className='callout-text'>Join us on our </span>
            <img className='slack-logo' src='/static/images/Slack_Mark_Web.png'/>
            <span className='callout-text'><a href='https://join.slack.com/t/palantarot/shared_invite/MjQxOTUyMjE3NjAzLTE1MDU1MDcwNjMtMDBjMjIyNDYyNQ'>Slack Channel</a></span>
          </span>
          <span className='callout'>
            <span className='callout-text'>Contribute on </span>
            <img className='github-logo' src='/static/images/GitHub-Mark-32px.png'/>
            <span className='callout-text'><a href='https://github.com/gillessed/palantarot'>Github</a></span>
          </span>
        </div>
      </div>
    );
  }

  private renderMenuItem(
    title: string,
    logo: string,
    to: string,
    intent?: Intent,
  ) {
    return (
      <div className='menu-item'>
        <Link className='link' to={to}>
          <Button
            className='pt-large'
            type='button'
            iconName={logo}
            text={title}
            intent={intent || Intent.PRIMARY}
          />
        </Link>
      </div>
    );
  }
}