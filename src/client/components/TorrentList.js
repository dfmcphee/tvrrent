import React from 'react';
import Torrent from './Torrent';

export default class TorrentList extends React.Component {
  constructor(props) {
    super(props);
  }

  renderItem(torrent) {
    return (
      <Torrent id={torrent._id}
        key={torrent._id}
        title={torrent.show}
        season={torrent.season}
        episode= {torrent.episode}
        url={torrent.link}
        path={torrent.path}
        downloading={torrent.downloading}
        totalDownloaded={torrent.totalDownloaded}
        size={torrent.size}
        complete={torrent.downloaded}
        poster={torrent.poster}
        socket={this.props.socket}
        published={torrent.published}
      />
    )
  }

  render() {
    return (
      <div className="torrent-list">
        {this.props.torrents.map(::this.renderItem)}
      </div>
    )
  }
}
