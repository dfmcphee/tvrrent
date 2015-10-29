import _ from 'underscore';
import torrentStream from 'torrent-stream';
import readTorrent from 'read-torrent';
import feed from 'feed-read';
import nedb from 'nedb';
import omdb from 'omdb';
import episode from 'episode';

let handleError = function(err) {
  if (err) {
    console.log(err);
  }
};

let sockets;

let db = new nedb({ filename: 'torrents.db', autoload: true });
db.ensureIndex({ fieldName: 'link', unique: true }, handleError);

let engines = {};
let engineOptions = {
  path: './public/downloads'
};

let updateMetadata = function(torrent) {
  let title = torrent.title.split(/ (\d)+x(\d)+| S(\d)+E(\d)+|.S(\d)+E(\d)+/i);
  omdb.search({terms: title[0], type: 'series'}, (err, results) => metaSearch(err, results, torrent, title[0]));
};

let updateAllMetadata = function() {
  db.find({}, (err, torrents) => {
    torrents.forEach((torrent) => updateMetadata(torrent));
  });
};

let updateTorrents = function() {
  db.find({}).sort({ published: -1 }).exec((err, torrents) => {
    sockets.emit('feed-updated', torrents);
  });
};

let metaSearch = function(err, results, torrent, title) {
  handleError(err);

  if (!results[0]) {
    console.log(torrent);
    return console.log('No results found');
  }

  let result = results[0];

  omdb.get(result.imdb, (err, show) => metaResult(err, show, torrent, title));
};

let metaResult = function(err, show, torrent, title) {
  handleError(err);

  let episodeMeta = episode(torrent.title);

  let update = {
    show: title,
    season: episodeMeta.season,
    episode: episodeMeta.episode
  };

  if (show.poster) {
    update.poster = show.poster;
  }

  db.update({ _id: torrent._id }, { $set: update }, {}, updateTorrents);
};

let addFile = function(torrentId, file, size) {
  let update = {
    path: file.path,
    size: size,
    downloading: true
  };

  db.update({ _id: torrentId }, { $set: update }, {}, updateTorrents);
};

let torrentManager = {
  setSockets: function (incomingSockets) {
    sockets = incomingSockets;
  },

  refreshFeed: function(url) {
    db.find({}, (err, torrents) => {
      feed(url, (err, incomingTorrents) => {
        let newTorrents = incomingTorrents.filter(function(torrent) {
          let exists = _.findWhere(torrents, { link: torrent.link });
          return !exists;
        });
        db.insert(newTorrents, (err) => updateAllMetadata());
      });
    });
  },

  download: function(torrent) {
    db.find({_id: torrent.id}, (err, foundTorrent) => {
      if (torrent) {
        let engine = torrentStream(torrent.url, engineOptions);

        engine.on('ready', function() {
          let selectedFile;
          let size = 0;

          engine.files.forEach(function(file) {
            if (file.name.includes('.mp4')) {
              let stream = file.createReadStream();
              selectedFile = file
            } else {
              file.deselect();
            }
            size += file.length;
          });

          addFile(torrent.id, selectedFile, size);
        });

        engine.on('download', function() {
          let update = {
            totalDownloaded: engine.swarm.downloaded,
            downloading: true
          };

          db.update({ _id: torrent.id }, { $set: update }, {}, function(err) {
            updateTorrents();
          });
        });

        engine.on('idle', function() {
          let update = {
            downloaded: true,
            downloading: false
          };

          db.update({ _id: torrent.id }, { $set: { downloaded: true } }, {}, updateTorrents);
        });

        engines[torrent.id] = engine;
      }
    });
  },

  add: function(url) {
    readTorrent(url, (err, torrent) => {
      let published = torrent.created ? torrent.created : Date();

      let insert = {
        title: torrent.name,
        link: url,
        published: published
      };

      db.insert(insert, (err, newTorrent) => {
        if (err) {
          return console.error(err);
        }
        updateMetadata(newTorrent);
      });
    });
  }
}

export default torrentManager;
