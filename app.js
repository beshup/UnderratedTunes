var express    = require('express'),
 	app        = express(),
 	bodyParser = require('body-parser'),
 	mongoose   = require('mongoose'),
	request    = require('request'),
	fetch      = require('isomorphic-fetch'),
	Spotify    = require('node-spotify-api')
 
require('dotenv').config();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost:27017/underratedTunes');

//schema set up

var spotify = new Spotify({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET
});

var tuneSchema = new mongoose.Schema({
	dbtrack: String,
	dbtrackId: String,
	dbimageurl: String,
	dbartist: String,
	dblinkToTrack: String,
	dbpopularity: Number,
	dbalbumName: String,
	dbupvotes: Number
});

var Tune = mongoose.model("Tune", tuneSchema);

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('landing');
});


//INDEX - show all tunes
app.get('/tunes', function(req, res){
	
	Tune.find({}, function(err, tunes){
		if (err){
			console.log(err);
		}
		else{
			res.render('index', {tunes: tunes});
		}
	});
});


//CREATE - add new tune to DB
app.post('/tunes', function(req, res){
	// get data from form 
	// add to tunes array
	// redirect back to tunes page
	var link = req.body.link;
	var track = String,
		trackID = String,
		imageurl = String,
		artist = String,
		linkToTrack = String,
		popularity = String,
		albumName = String,
		upvotes = 0;
	
	//console.log(link);
	
	var kcharPos=0;
	for (var i=0; i<link.length; i++){
		if(link.charAt(i)=='k'){
			kcharPos = i;
			break;
		}
	}
	kcharPos += 2;
	
	var questioncharPos=0;
	
	for (var i=kcharPos; i<link.length; i++){
		if(link.charAt(i)=='?'){
			questioncharPos = i;
			break;
		}
	}
	
	trackID = link.slice(kcharPos, questioncharPos);
	//console.log(trackID);
	
	//now gotta call spotify's API and get access token to access data
	
	spotify.request('https://api.spotify.com/v1/tracks/' + trackID)
	.then(function(data) {
    	//console.log(data); 
		track = data['name'];
		linkToTrack = data['external_urls']['spotify'];
		popularity = data['popularity'];
		artist = data['artists'][0]['name'];
		if (data['artists'].length > 1){
			for (var i=1; i<data['artists'].length; i++){
				if (i==1){
					artist += ' ft. ' + data['artists'][i]['name'];
				}
				else{
					artist += ', ' + data['artists'][i]['name'];
				}
			}
		}
		albumName = data['album']['name'];
		if (data['album']['images'].length > 0){
			imageurl = data['album']['images'][0]['url'];
		}
		/*
		console.log(track);
		console.log(trackID);
		console.log(albumName);
		console.log(imageurl);
		console.log(popularity);
		console.log(artist);
		console.log(linkToTrack);
		*/
		
		var newTune = {dbtrack: track, dbtrackID: trackID, dbalbumName: albumName, dbimageurl: imageurl, 									dbpopularity: popularity, dbartist: artist, dblinkToTrack: linkToTrack};
		// create new tunes and save to dB
		
		Tune.create(newTune, function(error, newlyCreated){
			if(error){
				console.log(error);
			}
			else{
				res.redirect('/tunes');
			}		
    });
	}).catch(function(err) {
    	console.error('Error occurred: ' + err); 
	});
});


//NEW - show form to create new tune
app.get('/tunes/new', function(req, res){
	res.render('new');
});

//SHOW - show more info about particular tune
app.get('/tunes/:id', function(req, res){
	//find tune with given id
	Tune.findById(req.params.id, function(err, foundTune){
		if(err){
			console.log(err);
		}
		else{
			//render show template with that tune
			res.render('show', {tune: foundTune});
		}
	});
});
	
app.listen(3000, function(){
	console.log('Underrated Tunes server has started.');
});