jest.dontMock('../../src/client/components/Torrent.js');

describe('Torrent', function() {
  it('renders a title', function() {
    var React = require('react');
    var ReactDOM = require('react-dom');
    var ReactTestUtils = require('react-addons-test-utils');
    var Torrent = require('../../src/client/components/Torrent.js');

    var torrent = ReactTestUtils.renderIntoDocument(
      <Torrent title="Torrent Title" />
    );

    var title = ReactTestUtils.findRenderedDOMComponentWithTag(torrent, 'h3');
    expect(ReactDOM.findDOMNode(title).textContent).toEqual('Torrent Title');
  });

  it('renders a poster', function() {
    var React = require('react');
    var ReactDOM = require('react-dom');
    var ReactTestUtils = require('react-addons-test-utils');
    var Torrent = require('../../src/client/components/Torrent.js');

    var torrent = ReactTestUtils.renderIntoDocument(
      <Torrent title="Torrent Title" poster="test-image.jpg" />
    );

    var poster = ReactTestUtils.findRenderedDOMComponentWithClass(torrent, 'torrent__image');
    expect(ReactTestUtils.isDOMComponent(poster)).toBe(true);
  });
});
