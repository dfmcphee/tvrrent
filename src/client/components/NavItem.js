import React from 'react';
import routes from '../config/routes';

export default class NavItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let icon = `#${this.props.route.icon}`;
    let className = 'button button--nav';
    if (this.props.active) {
      className += ' button--active';
    }
    return (
      <div className="nav__item">
        <button className={className} onClick={() => this.props.toggleItem(this.props.route.name)}>
          <svg className="icon"><use xlinkHref={icon} /></svg>
        </button>
      </div>
    )
  }
}
