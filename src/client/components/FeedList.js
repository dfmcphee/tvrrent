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
    console.log(event.target.value);
    this.setState({
      url: event.target.value
    });
  }

  addFeed() {
    console.log(this.state.feedUrl);
    this.props.addFeed(this.state.url);
  }

  render() {
    let url = this.state.url;
    return (
      <div className="slide-panel">
        <div className="feed-list">
          <input type="text" value={url} onChange={::this.urlChanged} />
          <button onClick={::this.addFeed}>Add</button>
        </div>
      </div>
    )
  }
}
