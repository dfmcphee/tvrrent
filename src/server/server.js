import express from 'express';
import http from 'http';
import request from 'request';
import fs from 'fs';
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

app.get('/stream', function(req, res) {
  if (!req.query.path) {
    res.send('Stream not found.');
  }

  var path = decodeURIComponent(req.query.path);
  path = './public/downloads/' + path;
  var stat = fs.statSync(path);
  var total = stat.size;

  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = (end - start)+1;

    var file = fs.createReadStream(path, {
      start: start,
      end: end
    });

    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    });

    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': 'video/mp4'
    });
    fs.createReadStream(path).pipe(res);
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
    else {
      torrentManager.update();
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

  socket.on('update-torrent-title', function(data) {
    torrentManager.updateTitle(data.id, data.title);
  });

  socket.on('download-torrent', function(torrent) {
    torrentManager.download(torrent);
  });
});

// Start server
server.listen((process.env.PORT || 3000), function() {
  console.log('Server started.');
});
