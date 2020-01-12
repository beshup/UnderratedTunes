var express    = require('express'),
 	app        = express(),
 	bodyParser = require('body-parser'),
 	mongoose   = require('mongoose'),
	request    = require('request'),
	fetch      = require('isomorphic-fetch'),
	Spotify    = require('node-spotify-api'),
	Tune       = require('./models/tune'),
	seedDB     = require('./seeds'),
	Comment    = require('./models/comments'),
	passport   = require('passport'),
	LocalStrategy = require('passport-local'),
	User       = require('./models/user')

seedDB();
require('dotenv').config();
app.use(express.static(__dirname + '/public'));

//passport config
app.use(require('express-session')({
	secret: "Will I ever remember this statement?",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

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
			res.render('tunes/index', {tunes: tunes, currentUser: req.user});
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
	res.render('tunes/new');
});

//SHOW - show more info about particular tune
app.get('/tunes/:id', function(req, res){
	//find tune with given id
	Tune.findById(req.params.id).populate('comments').exec(function(err, foundTune){
		if(err){
			console.log(err);
		}
		else{
			console.log(foundTune);
			//render show template with that tune
			res.render('tunes/show', {tune: foundTune});
		}
	});
});

// ================
// COMMENTS ROUTES
// ================

app.get('/tunes/:id/comments/new', isLoggedIn, function(req, res){
	// find tune by id and sent that through when we render
	Tune.findById(req.params.id, function(err, tune){
		if(err){
			console.log(err);
		}
		else{
			res.render('comments/new', {tune: tune});
		}
	});
});

app.post('/tunes/:id/comments', isLoggedIn, function(req, res){
	// look up tune using ID
	// create new comment
	//connect new comment to campground
	// redirect back to tune show page
	Tune.findById(req.params.id, function(err, tune){
		if(err){
			console.log(err);
			res.redirect('/tunes');
		}
		else{
			// we can do this because we named our inputs like 'comment[text]' so create a comment object for us
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				}
				else{
					tune.comments.push(comment);
					tune.save();
					res.redirect('/tunes/' + tune._id);
				}
			});
		}
	})
});

// ===========
//AUTH ROUTES
// ==========

// show register form

app.get('/register', function(req, res){
	res.render('register');
});

//handle sgn up logic
app.post('/register', function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, function(){
			res.redirect('/tunes');
		});
	});
})

//show login form

app.get('/login', function(req, res){
	res.render('login');
});

// handles login logic
app.post('/login', passport.authenticate("local", 
		{
			successRedirect: "/tunes",
			failureRedirect: '/login'						  
		}), function(req, res){
	
});
	
//logout route
app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/tunes');
});

//have this act as middleware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

app.listen(3000, function(){
	console.log('Underrated Tunes server has started.');
});