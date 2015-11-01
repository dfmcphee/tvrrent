import React from 'react';
import moment from 'moment';

export default class Torrent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: this.props.title,
      editingTitle: false
    };
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

  startEditing() {
    this.setState({
      editingTitle: true
    });
  }

  titleChanged(event) {
    this.setState({
      title: event.target.value
    });
  }

  updateTitle() {
    this.props.socket.emit('update-torrent-title', {
      id: this.props.id,
      title: this.state.title
    });
    this.setState({
      editingTitle: false
    });
  }

  render() {
    let totals;
    if (this.props.totalDownloaded) {
      totals = this.formatDownloadTotal(this.props.totalDownloaded, this.props.size);
    }

    let streamURL = `/stream?path=${encodeURIComponent(this.props.path)}`;
    let playButton = <a className="button button--secondary" href={streamURL} target="_blank">Play <svg className="icon"><use xlinkHref="#play" /></svg></a>;

    let download;
    if (this.props.complete) {
      download = <div className="torrent__actions">{playButton}</div>;
    } else if (this.props.downloading) {
      let percentage = <span className="torrent__totals">{totals}</span>;
      let downloadButton = <button className="button" disabled="disabled"><svg className="icon"><use xlinkHref="#download" /></svg> {percentage}</button>;
      download = <div className="torrent__actions">{downloadButton}{playButton}</div>
    } else {
      download = <div className="torrent__actions"><button className="button" onClick={::this.download}>Download <svg className="icon"><use xlinkHref="#download" /></svg></button></div>;
    }

    let image;
    if (this.props.poster) {
      let url = encodeURI(`/cover?url=${this.props.poster}`);
      let imageStyle = {
        backgroundImage: `url(${url})`
      };

      image = <div className="torrent__image" style={imageStyle}></div>;
    }

    let meta;
    if (this.props.show) {
      meta = <p>Season: {this.props.season} Episode: {this.props.episode}</p>;
    } else {
      meta = <p>{this.props.year}</p>;
    }

    let title;
    if (this.state.editingTitle) {
      title = (
        <div className="input-with-addon">
          <input value={this.state.title} onChange={::this.titleChanged} />
          <button className="button" onClick={::this.updateTitle}>Update</button>
        </div>
      );
    } else {
      title = <h3 onDoubleClick={::this.startEditing}>{this.state.title}</h3>;
    }

    return (
      <div className="torrent" key={this.props.id}>
        {image}
        {title}
        {meta}
        {download}
        <p>{moment(this.props.published).from(moment())}</p>
      </div>
    )
  }
}
