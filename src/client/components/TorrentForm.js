import React from 'react';

export default class TorrentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      torrentUrl: null
    };
  }

  feedUrlChanged() {
    this.setState({
      torrentUrl: event.target.value
    });
  }

  render() {
    return (
      <div className="torrent-form">
        <input value={this.state.torrentUrl} onChange={::this.torrentUrlChanged} placeholder="Torrent URL" />
        <button onClick={() => this.props.addTorrent(this.state.torrentUrl)}>Add</button>
      </div>
    )
  }
}
