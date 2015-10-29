import React from 'react';
import ReactDOM from 'react-dom';

export default class FeedList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null
    };
  }

  urlChanged(event) {
    this.setState({
      url: event.target.value
    });
  }

  addFeed() {
    this.setState({
      url: null
    });
    this.props.addFeed(this.state.url);
  }

  renderItem(feed) {
    return (
      <li key={feed._id}>{feed.url}</li>
    )
  }

  render() {
    let url = this.state.url;
    return (
      <div className="slide-panel">
        <h2 className="slide-panel__header">Add an RSS feed</h2>
        <div className="feed-form">
          <input type="text" value={url} onChange={::this.urlChanged} />
          <button className="button" onClick={::this.addFeed}>Add</button>
        </div>
        <ul className="feed-list">
          {this.props.feeds.map(::this.renderItem)}
        </ul>
      </div>
    )
  }
}
