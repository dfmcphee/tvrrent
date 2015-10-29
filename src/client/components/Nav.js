import React from 'react';
import NavItem from './NavItem';
import routes from '../config/routes';

export default class Nav extends React.Component {
  constructor(props) {
    super(props);
  }

  renderItem(route) {
    return(
      <NavItem key={route.name}
        route={route}
        active={this.props.active === route.name}
        toggleItem={this.props.toggleItem} />
    );
  }

  render() {
    return (
      <nav className="nav">
        {routes.map(::this.renderItem)}
      </nav>
    )
  }
}
