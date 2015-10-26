import React from 'react';

export default class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <nav className="nav">
        <div className="nav__item">
          <button className="button button--nav" onClick={this.props.toggleFeeds}>
            <svg className="icon"><use xlinkHref="#feed" /></svg>
          </button>
        </div>
        <div className="nav__item">
          <button className="button button--nav" onClick={this.props.toggleTorrentForm}>
            <svg className="icon"><use xlinkHref="#link" /></svg>
          </button>
        </div>
      </nav>
    )
  }
}
