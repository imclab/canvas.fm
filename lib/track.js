var http = require('http'),
    url = require('url'),
    clientId = '3bf80245493b4d50ce93429b9b8cfacb';

var optionsForRequest = function (trackId) {
  return {
    host: 'api.soundcloud.com',
    path: '/tracks/' + trackId + '/stream?client_id=' + clientId,
    headers: {
      'User-Agent': 'node.js'
    }
  }
}

var optionsFromLocation = function (location) {
  return {
    host: location.host,
    path: location.pathname + location.search,
    headers: {
      'User-Agent': 'node.js'
    }
  }
}

var Track = function (trackId) {
  this.trackId = trackId
  this.onEndCallback = function () {}
}

Track.create = function (trackId) {
  return new Track (trackId)
}

Track.prototype = {
  get: function (fn) {
    var self = this
    http.get(optionsForRequest(this.trackId), function (res) {
      var location = url.parse(res.headers.location)
      http.get(optionsFromLocation(location), function (res) {
        res.on('data', fn)
        res.on('end', self.onEndCallback)
      })
    })
  },

  onEnd: function (fn) {
    this.onEndCallback = fn
  }
}

module.exports = Track