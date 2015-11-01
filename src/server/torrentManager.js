import _ from 'underscore';
import torrentStream from 'torrent-stream';
import readTorrent from 'read-torrent';
import feed from 'feed-read';
import nedb from 'nedb';
import omdb from 'omdb';
import episode from 'episode';
import guessit from 'guessit-wrapper';

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

let streams = {};

let updateMetadata = function(torrent) {
  guessit.parseName(torrent.title).then(function(result) {
    let title;
    if (result.type === 'episode') {
      omdb.search({terms: title, type: 'series'}, (err, results) => metaTVSearch(err, results, torrent, result.series));
    }
    else {
      title = result.unidentified.shift();
      if (/(\d){4}/.test(title)) {
        title = result.unidentified.shift();
      }
      omdb.search({terms: title}, (err, results) => metaUnidentifiedSearch(err, results, torrent, title, result.unidentified));
    }
  });
};

let updateMetaFromTitle = function(id, title) {
  db.findOne({ _id: id }, function (err, torrent) {
    if (torrent) {
      omdb.search({terms: title}, (err, results) => metaUnidentifiedSearch(err, results, torrent, title, []));
    }
  });
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

let metaTVSearch = function(err, results, torrent, title) {
  handleError(err);
  if (!results || !results[0]) {
    console.log('No TV results found');
    omdb.search({terms: title}, (err, results) => metaMovieSearch(err, results, torrent, title));
  }
  else {
    omdb.get(results[0].imdb, (err, show) => metaResult(err, show, torrent, title));
  }
};

let metaMovieSearch = function(err, results, torrent, title) {
  console.log(results);
  if (!results || !results[0]) {
    console.log('No movie results found');
    let update = {
      name: title,
      show: false
    };
    db.update({ _id: torrent._id }, { $set: update }, {}, updateTorrents);
  }
  else {
    omdb.get(results[0].imdb, (err, movie) => metaResult(err, movie, torrent, title));
  }
}

let metaUnidentifiedSearch = function(err, results, torrent, title, unidentified) {
  if (!results || !results.length) {
    if (unidentified.length === 0) {
      console.log('No movie results found');
      let update = {
        name: title,
        show: false
      };
      db.update({ _id: torrent._id }, { $set: update }, {}, updateTorrents);
    }
    else {
      let title = unidentified.shift();
      omdb.search({terms: title}, (err, results) => metaUnidentifiedSearch(err, results, torrent, title, unidentified));
    }
  }
  else {
    omdb.get(results[0].imdb, (err, movie) => metaResult(err, movie, torrent, title));
  }
}

let metaResult = function(err, result, torrent, title) {
  handleError(err);

  let update;
  if (result.type === 'movie') {
    update = {
      name: title,
      year: result.year,
      show: false
    };
  }
  else {
    let episodeMeta = episode(torrent.title);
    update = {
      name: title,
      show: true,
      season: episodeMeta.season,
      episode: episodeMeta.episode
    };
  }

  if (result.poster) {
    update.poster = result.poster;
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

  update: function() {
    updateTorrents();
  },

  updateTitle: function(id, title) {
    updateMetaFromTitle(id, title);
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
              streams[torrent.id] = stream;
              selectedFile = file;
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
          engine.destroy();
        });

        engines[torrent.id] = engine;
      }
    });
  },

  getStream: function(id) {
    return streams[id];
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
