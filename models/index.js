var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/eatswithjeet');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
 
var Page;
var Schema = mongoose.Schema;

var keywordSchema = new Schema({
	text: String,
	relevance: String,
	sentiment: {}
});
 
var pageSchema = new Schema({
  name:  String,
  url_name: String,
  keywords: [keywordSchema]
});
 

 
Page = mongoose.model('Page', pageSchema);
 
module.exports = {"Page": Page};