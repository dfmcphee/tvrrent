import express from 'express';
import http from 'http';
import io from 'socket.io';
import nedb from 'nedb';
import torrentManager from './TorrentManager';

let exec = require('child_process').exec;
let app = express();
let server = http.Server(app);
let sockets = io(server);
let feeds = new nedb({ filename: 'feeds.db', autoload: true });

let handleError = function(err) {
  if (err) {
    console.log(err);
  }
};

feeds.ensureIndex({ fieldName: 'url', unique: true }, handleError);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res) {
  let appScript = '/js/app.js';

  if (process.env.NODE_ENV !== 'production') {
    appScript = 'http://localhost:8080' + appScript;
  }

  res.render('index.html.ejs', {
    appScript: appScript
  });
});

torrentManager.setSockets(sockets);

sockets.on('connection', function(socket) {
  feeds.find({}, function (err, feeds) {
    if (feeds && feeds.length) {
      torrentManager.refreshFeed(feeds[0].url);
    }
  });

  socket.on('add-feed', function(url) {
    if (url) {
      feeds.insert({
        url: url
      }, function (err, newFeed) {
        torrentManager.refreshFeed(newFeed.url);
      });
    }
  });

  socket.on('add-torrent', function(url) {
    torrentManager.add(url);
  });

  socket.on('download-torrent', function(torrent) {
    torrentManager.download(torrent);
  });
});

// Start server
server.listen((process.env.PORT || 3000), function() {
  console.log('Server started.');
});
