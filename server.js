var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8003,
    Converter = require('./lib/converter'),
    track = require('./lib/track'),
    pathRegex = /^\/stream\/(\d+)/;

http.createServer(function (req, res) {
  var uri = url.parse(req.url).pathname,
      filename = path.join(process.cwd(), uri);

  var respondWith404 = function () {
    res.writeHead(404, {"Content-Type": "text/plain"})
    res.write("404 Not Found\n")
    res.end()
  }

  var respondWith500 = function (err) {
    res.writeHead(500, {"Content-Type": "text/plain"})
    res.write(err + "\n")
    res.end()
  }

  var matcher = pathRegex.exec(req.url)

  if (matcher) {
    res.writeHead(200, {"Content-Type": "application/ogg"})

    var trackId = matcher[1],
        converter = Converter.create()
  
    track.get(trackId, function (data) {
      converter.send(data)
    })

    converter.onData(function (data) {
      res.write(data, 'binary')
    })

    converter.onComplete(function () {
      res.end()
    })
  } else {
    path.exists(filename, function (exists) {
      if (!exists) return respondWith404()

      if (fs.statSync(filename).isDirectory()) filename += '/index.html'

      fs.readFile(filename, 'binary', function (err, file) {
        if (err) return respondWith500(err)

        res.writeHead(200)
        res.write(file, 'binary')
        res.end()
      })
    })
  }

}).listen(port)

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");