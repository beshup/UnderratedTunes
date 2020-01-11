var express    = require('express'),
 	app        = express(),
 	bodyParser = require('body-parser'),
 	mongoose   = require('mongoose')

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect('mongodb://localhost:27017/underratedTunes');

//schema set up

var tuneSchema = new mongoose.Schema({
	name: String,
	artist: String,
	image: String
});

var Tune = mongoose.model("Tune", tuneSchema);
/*
Tune.create({
	name: "Location", 
	artist: "Dave", 
	image: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"
}, function(err, tune){
	if(err){
		console.log("error");
		console.log(err);
	}
	else{
		console.log("added tune to db");
		console.log(tune);
	}
});
*/

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('landing');
});

app.get('/tunes', function(req, res){
	
	Tune.find({}, function(err, tunes){
		if (err){
			console.log(err);
		}
		else{
			res.render('tunes', {tunes: tunes});
		}
	});
});

app.post('/tunes', function(req, res){
	// get data from form 
	// add to tunes array
	// redirect back to tunes page
	var name = req.body.name;
	var image = req.body.image;
	var newTune = {name: name, image: image};
	// create new tunes and save to dB
	Tune.create(newTune, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect('/tunes');
		}
	});
});

app.get('/tunes/new', function(req, res){
	res.render('new');
});

app.listen(3000, function(){
	console.log('Underrated Tunes server has started.');
});