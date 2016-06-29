var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var http = require('http')

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

const options = {
  'host': 'stats.nba.com',
  'headers': {
    'referer': 'http://stats.nba.com/scores'
  }
}

app.get('/players', (req, res) => {
  http.get(Object.assign(options, {
    'path': encodeURI('/stats/commonallplayers?IsOnlyCurrentSeason=1&LeagueID=00&Season=2015-16'),
  }), (resp) => {
    var output = '';

    resp.setEncoding('utf8');
    resp.on('data', function (chunk) {
      output += chunk;
    });

    resp.on('end', function() {
      var obj = JSON.parse(output);
      res.statusCode = 200;
      res.send(obj);
    });
  });
});

app.get('/careerstats/:id', (req, res) => {
  const id = req.params.id;
  console.log(id);

  http.get(Object.assign(options, {
    'path': encodeURI(`/stats/playercareerstats?LeagueID=00&PerMode=PerGame&PlayerID=${id}`),
  }), (resp) => {
    var output = '';

    resp.setEncoding('utf8');
    resp.on('data', function (chunk) {
      output += chunk;
    });

    resp.on('end', function() {
      var obj = JSON.parse(output);
      res.statusCode = 200;
      res.send(obj);
    });
  });
});



app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
