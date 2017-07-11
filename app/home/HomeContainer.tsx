import * as React from 'react';
import { Link } from 'react-router';
import { Button, Intent } from '@blueprintjs/core';

interface Props {
  children: any[];
}

export class HomeContainer extends React.PureComponent<Props, {}> {

  public render() {
    return (
      <div className='home-container pt-ui-text-large'>
        <div className='logo'>
          <p className='pt-running-text'>Welcome to the new French Tarot website, where the points are fake, and no one really knows that they are doing.</p>
        </div>
        <div className='menu'>
          {this.renderMenuItem('Enter Score', 'manually-entered-data', '/enter')}
          {this.renderMenuItem('Results', 'th', '/results')}
          {this.renderMenuItem('Recent Games', 'history', '/recent')}
          {this.renderMenuItem('Advanced Search', 'search', '/search')}
          {this.renderMenuItem('Records', 'glass', '/records')}
          {this.renderMenuItem('Add New Player', 'add', '/add-player')}
          {this.renderMenuItem('Tarothon', 'ninja', '/tarothon')}
        </div>
      </div>
    );
  }

  private renderMenuItem(
    title: string,
    logo: string,
    to: string,
  ) {
    return (
      <Link className='link' to={to}>
        <Button
          type='button'
          iconName={logo}
          text={title}
          intent={Intent.PRIMARY}
        />
      </Link>
    );
  }
}