import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import Navbar from './Navbar';
import FeedList from './FeedList';
import TorrentList from './TorrentList';
import TorrentForm from './TorrentForm';

export default class Root extends React.Component {
  // Set default state for component
  constructor(props) {
    super(props);
    this.socket = io();
    this.state = {
      torrents: [],
      showFeeds: false,
      showTorrentForm: false
    };
  }

  // Event fired before component is loaded
  componentWillMount() {
    this.socket.on('feed-updated', ::this.updateFeed);
  }

  updateFeed(torrents) {
    if (torrents && torrents.length) {
      this.setState({
        torrents: torrents
      });
    }
  }

  addFeed(url) {
    console.log(url);
    this.socket.emit('add-feed', url);
  }

  addTorrent(url) {
    this.socket.emit('add-torrent', url);
  }

  toggleFeeds() {
    this.setState({
      showFeeds: !this.state.showFeeds
    });
  }

  toggleTorrentForm() {
    this.setState({
      showTorrentForm: !this.state.showTorrentForm
    });
  }

  // Render the markup for component
  render() {
    return (
      <div className="container">
        <Navbar toggleFeeds={::this.toggleFeeds} />
        <div className="wrapper">
          <div className="layout">
            <div className="layout__main">
              <TorrentList torrents={this.state.torrents} socket={this.socket} />
            </div>
            <div className="layout__sidebar">
              { this.state.showTorrentForm ? <TorentForm addTorrent={::this.addTorrent} /> : null }
              { this.state.showFeeds ? <FeedList addFeed={::this.addFeed} /> : null }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
