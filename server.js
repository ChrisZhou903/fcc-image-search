// require and instantiate express
var express = require('express');
var mongoose = require('mongoose');
var request = require('request');
var path = require('path')
var History = require('./searchHistory')

var app = express();
var dbUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/searchHistory'
var port = process.env.PORT || 8080
var BASE_URL = 'https://www.googleapis.com/customsearch/v1'
var API_KEY = process.env.API_KEY
var CSE_ID = process.env.CSE_ID
var API_URL = BASE_URL + '?&key=' + API_KEY + '&cx=' + CSE_ID + '&searchType=image'

// create a connection to our MongoDB
mongoose.connect(dbUrl);

app.get('/', function(req, res){
  // route to serve up the homepage (index.html)
  res.sendFile(path.join(__dirname, './index.html'));
});

app.get('/latest', function(req, res){
  
  History.find({}, null, {
    "limit": 10,
    "sort": {
      "when": -1
    }
  }, function(err, history) {
    if (err) return console.error(err);
    console.log(history);
    res.send(history.map(function(arg) {
      // Displays only the field we need to show.
      return {
        term: arg.term,
        when: arg.when
      };
    }));
  });
  
});

app.get('/api/imageserach/:query', function(req, res){
  // route to redirect the visitor to their original URL given the short URL
  var query = encodeURIComponent(req.params.query)
  var start = req.query.offset
  var url = API_URL + '&q=' + query
  var results = []
  var history = new History({
    term: query,
    when: new Date().toLocaleString(),
  });
  
  if (start) {
    url = url + '&start=' + start
  }
  
  // Save object into db.
  history.save(function(err, history) {
    if (err) throw err;
    console.log('Saved ' + history);
  });
  
  request(url, function (error, response, body) {
    var data = JSON.parse(body)
    console.log(url)
    console.log('error:', error) // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
    
    data.items.forEach(function(item) {
      results.push({
        url: item.link,
        snippet: item.snippet,
        thumbnail: item.image.thumbnailLink,
        context: item.image.contextLink,
      })
    })
    res.send(results)
  })
})

app.listen(port, function(){
  console.log('Server listening on port 8080')
});