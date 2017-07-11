import * as React from 'react';
import { Link } from 'react-router';
import { Routes } from '../../routes';

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
          {this.renderMenuItem('Enter Score', 'pt-icon-manually-entered-data', Routes.enter())}
          {this.renderMenuItem('Results', 'pt-icon-th', Routes.results())}
          {this.renderMenuItem('Recent Games', 'pt-icon-history', Routes.recent())}
          {this.renderMenuItem('Advanced Search', 'pt-icon-search', Routes.search())}
          {this.renderMenuItem('Records', 'pt-icon-glass', Routes.records())}
          {this.renderMenuItem('Add New Player', 'pt-icon-add', Routes.addPlayer())}
          {this.renderMenuItem('Tarothon', 'pt-icon-ninja', Routes.tarothon())}
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
      <div className='menu-item'>
        <Link className='link' to={to}>
          <div className={`${logo}`} />
        </Link>
        <h4>{title}</h4>
      </div>
    );
  }
}