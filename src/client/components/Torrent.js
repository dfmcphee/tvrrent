import React from 'react';

export default class Torrent extends React.Component {
  constructor(props) {
    super(props);
  }

  download() {
    this.props.socket.emit('download-torrent', {
      id: this.props.id,
      url: this.props.url
    });
  }

  formatDownloadTotal(total, size) {
    let percentage = (total / size) * 100;
    if (percentage > 100) {
      percentage = 100;
    } else {
      percentage = percentage.toFixed(2);
    }
    return percentage + '%';
  }

  render() {
    let url = `/downloads/${this.props.path}`;

    let totals = '';
    if (this.props.totalDownloaded) {
      totals = this.formatDownloadTotal(this.props.totalDownloaded, this.props.size);
    }

    let download = '';
    if (this.props.complete) {
      download = <p><a className="button button--secondary" href={url}>Play <svg className="icon"><use xlinkHref="#play" /></svg></a></p>;
    } else if (this.props.downloading) {
      let percentage = <span className="torrent__totals">{totals}</span>;
      download = <p><button className="button" disabled="disabled">Downloading <svg className="icon"><use xlinkHref="#download" /></svg></button>{percentage}</p>;
    } else {
      download = <p><button className="button" onClick={::this.download}>Download <svg className="icon"><use xlinkHref="#download" /></svg></button></p>;
    }

    let image = '';
    if (this.props.poster) {
      let imageStyle = {
        backgroundImage: `url(${this.props.poster})`
      };

      image = <div className="torrent__image" style={imageStyle}></div>;
    }

    return (
      <div className="torrent" key={this.props.title}>
        {image}
        <h3>{this.props.title}</h3>
        <p>Season: {this.props.season} Episode: {this.props.episode}</p>
        {download}
      </div>
    )
  }
}
