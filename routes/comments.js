var express = require('express');
var router = express.Router({mergeParams: true});
var Tune = require('../models/tune');
var Comment = require('../models/comments');
// ================
// COMMENTS ROUTES
// ================

router.get('/new', isLoggedIn, function(req, res){
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

router.post('/', isLoggedIn, function(req, res){
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
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					tune.comments.push(comment);
					tune.save();
					res.redirect('/tunes/' + tune._id);
				}
			});
		}
	})
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

module.exports = router;