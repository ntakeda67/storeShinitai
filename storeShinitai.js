var twitter  = require('mtwitter')
    , mongoose = require('mongoose')
    , Schema   = mongoose.Schema
;
var stream = require('stream');
var util = require('util');


function TimeLineStream() {
    this.writable = true;
    this.readable = false;
    this.ended = false;
    this.buf = '';
    this.searched = false;
};
util.inherits(TimeLineStream, stream.Writable);
TimeLineStream.prototype.write =function(chunk, encoding){
  var jsonString = JSON.parse(chunk.toString('utf8'));
  if ( !('id' in jsonString) ) {
      return;
  }
  
  if (!isSchemaDefined) {
      PostSchema = new Schema( makeSchema(jsonString, '') )
          Post       = mongoose.model('Post', PostSchema)
          isSchemaDefined = true;
  }
  var post = new Post(jsonString);
  post.save( function(err) {
          if (err) console.error(err);
      });
}

// typeof
var typeMap = {
    number   : Number,
    string   : String,
    boolean  : Boolean,
    object   : Object,
    function : Function
};

function makeSchema(data) {
    var schema = {};
    for (var x in data) {
        var type = typeof data[x];
        if (data[x] === null) {
            schema[x] = Object;
        } else if (type === 'object') {
            schema[x] = makeSchema(data[x]) ;
        } else {
            schema[x] = typeMap[type];
        }
    }
    return schema;
}

mongoose.connect('mongodb://localhost/Twitter');
var PostSchema, Post, isSchemaDefined = false;

new twitter({
        consumer_key        : 'your consumer key',
        consumer_secret     : 'your cousumer secret key',
        access_token_key    : 'your access token key',
        access_token_secret : 'your access token secret key'
        }).stream.raw(
           'GET',
           'https://stream.twitter.com/1.1/statuses/filter.json',
           {track:'しにたい,死にたい,シニタイ,ｼﾆﾀｲ,shinitai'}, 
           new TimeLineStream()
           );

process.on('uncaughtException', function (err) {
        console.log('uncaughtException => ' + err);
});
