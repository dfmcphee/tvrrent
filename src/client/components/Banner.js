import React from 'react';

export default class Banner extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="banner">
        <div className="banner__logo">
          <svg><use xlinkHref="#logo" /></svg>
        </div>
      </div>
    )
  }
}
