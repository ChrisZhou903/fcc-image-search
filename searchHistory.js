var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a schema for search history
var historySchema = new Schema({
  term: String,
  when: Date
});

var History = mongoose.model('searchHistory', historySchema);

module.exports = History;