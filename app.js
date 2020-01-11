var express = require('express');
var app = express();
var bodyParser= require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	res.render('landing');
});

var tunes = [
		{name: "Location", artist: "Dave", image: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg"},
		{name: "Thiago Silva", artist: "Dave x AJ Tracey", image: "https://cdn.pixabay.com/photo/2012/03/01/00/21/bridge-19513__480.jpg"},
		{name: "Fashion Week", artist: "Steel Banglez", image: "https://cdn.pixabay.com/photo/2013/07/18/20/26/boat-164989__480.jpg"}
	];

app.get('/tunes', function(req, res){
	
	res.render('tunes', {tunes: tunes});
});

app.post('/tunes', function(req, res){
	// get data from form 
	// add to tunes array
	// redirect back to tunes page
	var name = req.body.name;
	var image = req.body.image;
	var newTune = {name: name, image: image};
	tunes.push(newTune);
	res.redirect('/tunes');
});

app.get('/tunes/new', function(req, res){
	res.render('new');
});

app.listen(3000, function(){
	console.log('Underrated Tunes server has started.');
});