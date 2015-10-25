import React from 'react';

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="navbar__background">
        <div className="wrapper">
          <div className="navbar">
            <div className="navbar__logo">
              <svg><use xlinkHref="#logo" /></svg>
            </div>
            <nav className="navbar__nav">
              <button className="button button--nav" onClick={this.props.toggleFeeds}>
                <svg className="icon"><use xlinkHref="#feed" /></svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    )
  }
}
