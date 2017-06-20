import * as React from 'react';

interface Props {
  size?: string;
  intent?: string;
  text?: string;
};

export class SpinnerOverlay extends React.PureComponent<Props, {}> {
  public static defaultProps: Partial<Props> = { 
    size: 'pt-large',
    intent: 'pt-intent-primary',
  };
  constructor(props: Props) {
    super(props);
  }
  render() {
    return (
      <div className="pt-spinner-overlay-container">
        {this.renderText()}
        <div className={`pt-spinner ${this.props.size} ${this.props.intent}`}>
          <div className='pt-spinner-svg-container'>
            <svg viewBox='0 0 100 100'>
              <path className='pt-spinner-track' d="M 50,50 m 0,-44.5 a 44.5,44.5 0 1 1 0,89 a 44.5,44.5 0 1 1 0,-89"></path>
              <path className='pt-spinner-head' d="M 94.5 50 A 44.5 44.5 0 0 0 50 5.5"></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  private renderText() {
    if (this.props.text) {
      return <div className="pt-spinner-overlay-text">{this.props.text}</div>;
    }
  }
}