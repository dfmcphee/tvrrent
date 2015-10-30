import express from 'express';
import http from 'http';
import request from 'request';
import io from 'socket.io';
import nedb from 'nedb';
import torrentManager from './torrentManager';

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
  let environment = process.env.NODE_ENV || 'development';
  let appScript = '/js/app.js';

  if (environment === 'development') {
    appScript = 'http://localhost:8080' + appScript;
  }

  res.render('index.html.ejs', {
    appScript: appScript
  });
});

app.get('/cover', function(req, res) {
  if (req.query.url) {
    let url = decodeURI(req.query.url);
    request.get(url).pipe(res);
  }
});

torrentManager.setSockets(sockets);

let updateFeeds = function() {
  feeds.find({}, (err, feedList) => {
    sockets.emit('feeds-updated', feedList);
  });
};

sockets.on('connection', function(socket) {
  feeds.find({}, function (err, feedList) {
    if (feedList && feedList.length) {
      sockets.emit('feeds-updated', feedList);
      feedList.forEach(function(feed){
        torrentManager.refreshFeed(feed.url);
      });
    }
  });

  socket.on('add-feed', function(url) {
    if (url) {
      feeds.insert({
        url: url
      }, function (err, newFeed) {
        updateFeeds();
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
