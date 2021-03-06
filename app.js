var express    = require('express'),
 	app        = express(),
 	bodyParser = require('body-parser'),
 	mongoose   = require('mongoose'),
	request    = require('request'),
	flash      = require('connect-flash'),
	//fetch      = require('isomorphic-fetch'),
	//Spotify    = require('node-spotify-api'),
	Tune       = require('./models/tune'),
	seedDB     = require('./seeds'),
	Comment    = require('./models/comments'),
	passport   = require('passport'),
	methodOverride = require('method-override'),
	LocalStrategy = require('passport-local'),
	User       = require('./models/user')

var commentRoutes = require('./routes/comments'),
	tuneRoutes = require('./routes/tunes'),
	indexRoutes = require('./routes/index')


//seedDB(); //seeding the database
require('dotenv').config();
app.use(express.static(__dirname + '/public'));
app.use(flash());

//passport config
app.use(require('express-session')({
	secret: "Will I ever remember this statement?",
	resave: false,
	saveUninitialized: false
}));
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success"); 
	res.locals.spotifyLinkErr = req.flash("spotifyLinkErr");
	next();
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost:27017/underratedTunes');

//schema set up


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.use('/', indexRoutes);
app.use('/tunes', tuneRoutes);
app.use('/tunes/:id/comments', commentRoutes);
app.use(methodOverride("_method"));


app.listen(3000, function(){
	console.log('Underrated Tunes server has started.');
});