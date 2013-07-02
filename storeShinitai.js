var twitter  = require('mtwitter')
    , mongoose = require('mongoose')
    , Schema   = mongoose.Schema
;
var stream = require('stream');
var util = require('util');
var tweetSeparator = "\r";
var remainChunkStr = "";

function TimeLineStream() {
    this.writable = true;
    this.readable = false;
    this.ended = false;
    //this.oncoding = 'utf8';
    this.buf = '';
    this.searched = false;
};
util.inherits(TimeLineStream, stream.Writable);

TimeLineStream.prototype.write =function(chunk, encoding){
    remainChunkStr +=  chunk.toString('utf8');
    var tweetSeparatorIndex = remainChunkStr.indexOf(tweetSeparator);

    if(tweetSeparatorIndex < 0){
	// tweet is not completed.
	return;
    }

    var tweetString = remainChunkStr.slice(0, tweetSeparatorIndex);
    var jsonString = parseJsonString(tweetString);
    if(jsonString === "" || jsonString === tweetSeparator){
	return;
    }

    remainChunkStr = remainChunkStr.slice(tweetSeparatorIndex + 1);

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
	    if (err) {
		console.error(err);
	    }
	});

    function parseJsonString(string){
	console.log(string);
	try{
	    return jsonString = JSON.parse(string);
	} catch(e){
	    console.error('json parse error', e);
	    return "";
	}
    }


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
	} else if (x==='created_at'){
	    schema[x] = Date;
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
        consumer_key        : 'xCk9CG2JwaKS0LmAX6XR6Q',
        consumer_secret     : 'VQGxiPIA3W1Sv5mPfWYq0eoT7dlorjcr8JGBGxmUk',
        access_token_key    : '15029018-Ku4dweUBlRaWUdBSsrz4V3nHuY6vPkzqURRtfS4Kw',
        access_token_secret : 'pfUqbdxQJ6C92FjqMyGyuz9FUaROlyo2OyrJS03nc'
        }).stream.raw(
           'GET',
           'https://stream.twitter.com/1.1/statuses/filter.json',
           {track:'しにたい,死にたい,シニタイ,ｼﾆﾀｲ,shinitai'}, 
           new TimeLineStream()
           );

process.on('uncaughtException', function (err) {
        console.log('uncaughtException => ',err);
});
