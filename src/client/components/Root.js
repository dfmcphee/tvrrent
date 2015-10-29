import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import Banner from './Banner';
import Nav from './Nav';
import FeedList from './FeedList';
import TorrentList from './TorrentList';
import TorrentForm from './TorrentForm';
import routes from '../config/routes';

export default class Root extends React.Component {
  // Set default state for component
  constructor(props) {
    super(props);
    this.socket = io();
    this.state = {
      torrents: [],
      feeds: [],
      navItem: false
    };
  }

  // Event fired before component is loaded
  componentWillMount() {
    this.socket.on('feed-updated', ::this.updateFeed);
    this.socket.on('feeds-updated', ::this.updateFeeds);
  }

  updateFeed(torrents) {
    if (torrents && torrents.length) {
      this.setState({
        torrents: torrents
      });
    }
  }

  updateFeeds(feeds) {
    if (feeds && feeds.length) {
      this.setState({
        feeds: feeds
      });
    }
  }

  addFeed(url) {
    this.socket.emit('add-feed', url);
  }

  addTorrent(url) {
    this.socket.emit('add-torrent', url);
  }

  toggleNavItem(route) {
    let state = {};
    if (this.state.navItem === route) {
      state = { navItem: false };
    } else {
      state = { navItem: route };
    }
    this.setState(state);
  }

  isActive(item) {
    return (this.state.navItem === item);
  }

  // Render the markup for component
  render() {
    return (
      <div className="container">
        <div className="container__banner">
          <Banner />
        </div>
        <div className="container__body">
          <div className="layout">
            <div className="layout__sidebar">
              <Nav active={this.state.navItem}
                toggleItem={::this.toggleNavItem} />
              { this.isActive('torrent-form') ? <TorrentForm addTorrent={::this.addTorrent} /> : null }
              { this.isActive('feed-list') ? <FeedList addFeed={::this.addFeed} feeds={this.state.feeds} /> : null }
            </div>
            <div className="layout__main">
              <TorrentList torrents={this.state.torrents} socket={this.socket} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
