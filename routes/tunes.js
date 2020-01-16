var express = require('express');
var router = express.Router();
var Tune = require('../models/tune');
var methodOverride = require('method-override');
router.use(methodOverride("_method"));

var Spotify = require('node-spotify-api');
	
require('dotenv').config();

var spotify = new Spotify({
  id: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET
});

router.get('/', function(req, res){
	
	Tune.find({}, function(err, tunes){
		if (err){
			console.log(err);
		}
		else{
			res.render('tunes/index', {tunes: tunes, currentUser: req.user});
		}
	});
});


//CREATE - add new tune to DB
router.post('/', function(req, res){
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
		albumName = String
	
	//console.log(link);
	var check1 = link.slice(0, 31);
	if (check1 != "https://open.spotify.com/track/" || link.charAt(53) != "?"){
		req.flash("spotifyLinkErr", "You didn't enter a spotify link to a track.");
		res.redirect('/tunes');
	}
	
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
		if (!data['album']['images']){
			req.flash("spotifyLinkErr", "You didn't enter a spotify link to a track.");
			res.redirect('/tunes');
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
		var author = {
			id: req.user._id,
			username: req.user.username
		}
		var newTune = {dbtrack: track, dbtrackID: trackID, dbalbumName: albumName, dbimageurl: imageurl, 									dbpopularity: popularity, dbartist: artist, dblinkToTrack: linkToTrack, author:author};
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
router.get('/new', isLoggedIn, function(req, res){
	res.render('tunes/new');
});

//SHOW - show more info about particular tune
router.get('/:id', function(req, res){
	//find tune with given id
	Tune.findById(req.params.id).populate('comments').exec(function(err, foundTune){
		if(err){
			console.log(err);
		}
		else{
			//console.log(foundTune);
			//console.log(foundTune.author);
			//render show template with that tune
			res.render('tunes/show', {tune: foundTune});
		}
	});
});

//destroy tune route
/*
router.delete("/:id", checkTuneOwnerShip, (req, res) => {
    Tune.findById(req.params.id, (err, foundTune) => {
        if(err) {
            console.log(err);
        } else { // if there are comments, delete comments first		
	    if(foundTune.comments.length > 0){				
	        foundTune.comments.forEach((comment)=>{
	            comment.findByIdAndRemove(comment, (err) => {
		        if(err) {
                            console.log(err);
		        } 
                    });					
	        });	
            } 
        }
    });	
    Tune.findByIdAndRemove(req.params.id, (err)=> {
        if(err) {
	    console.log(err);
            res.redirect("/tunes");
        } else {
    	    res.redirect("/tunes");
        }
    });	
 
}); 
*/


router.delete("/:id", checkTuneOwnerShip, function(req, res){
	Tune.findByIdAndRemove(req.params.id, function(err){
		if(err){
			req.flash("error", "Something went wrong.");
			res.redirect("/tunes");
		}
		else{
			req.flash("Deleted post.");
			res.redirect("/tunes");
		}
	});
});

//have this act as middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('error', 'You need to be logged in to do that.')
	res.redirect('/login');
}

//other middleware
//check post ownership

function checkTuneOwnerShip(req, res, next){
	if (req.isAuthenticated()){
		Tune.findById(req.params.id, function(err, foundTune){
			if(err){
				res.redirect('back');
			}
			else{
				// is it their post?
				if(foundTune.author.id.equals(req.user._id)){
					next();
				}
				else{
					res.redirect('back');
				}
			}
		})
	}
	else{
		res.redirect('back');
	}
}



module.exports = router;