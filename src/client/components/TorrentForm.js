import React from 'react';

export default class TorrentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      torrentUrl: null
    };
  }

  torrentUrlChanged(event) {
    this.setState({
      torrentUrl: event.target.value
    });
  }

  addTorrent() {
    this.setState({
      torrentUrl: null
    });
    this.props.addTorrent(this.state.torrentUrl);
  }

  render() {
    return (
      <div className="slide-panel">
        <h2 className="slide-panel__header">Add a torrent</h2>
        <div className="torrent-form">
          <input value={this.state.torrentUrl} onChange={::this.torrentUrlChanged} placeholder="Torrent URL" />
          <button className="button" onClick={::this.addTorrent}>Add</button>
        </div>
      </div>
    )
  }
}
