import * as React from 'react';
import { Link } from 'react-router';

interface Props {
  children: any[];
}

export class HomeContainer extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div className='home-container pt-ui-text-large'>
        <div className='logo'>
          <p className='pt-running-text'>Welcome to the new French Tarot website</p>
        </div>
        <div className='menu'>
          {this.renderMenuItem('Enter Score', 'pt-icon-manually-entered-data', '/enter')}
          {this.renderMenuItem('Results', 'pt-icon-th', '/results')}
          {this.renderMenuItem('Recent Games', 'pt-icon-history', '/recent')}
          {this.renderMenuItem('Advanced Search', 'pt-icon-search', '/search')}
          {this.renderMenuItem('Records', 'pt-icon-glass', '/records')}
          {this.renderMenuItem('Add New Player', 'pt-icon-add', '/add-player')}
          {this.renderMenuItem('Tarothon', 'pt-icon-ninja', '/tarothon')}
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
          <span className={`${logo}`} />
        </Link>
        <h4>{title}</h4>
      </div>
    );
  }
}