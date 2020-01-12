var mongoose = require("mongoose");
var Tune = require("./models/tune");
var Comment   = require("./models/comments");
 
var data = [
    {
        dbtrack:'Good Vibes',
		dbtrackId:'5Mjz2PQbnvWSW9emQCyGRz',
		dbimageurl:'https://i.scdn.co/image/ab67616d0000b273e48db7a505cfd2d1de7dd2ac',
		dbartist:'JAY1',
		dblinktoTrack:'https://open.spotify.com/track/5Mjz2PQbnvWSW9emQCyGRz',
		dbpopularity:'62',
		dbalbumName:'One Wave'
    },
	{
        dbtrack:'Thiago Silva',
		dbtrackId:'3DKCTIiJ97bS9TGiqcABjo',
		dbimageurl:'https://i.scdn.co/image/ab67616d0000b273263fee830189352a873d32fe',
		dbartist:'Dave ft. AJ Tracey',
		dblinktoTrack:'https://open.spotify.com/track/3DKCTIiJ97bS9TGiqcABjo',
		dbpopularity:'74',
		dbalbumName:'Thiago Silva'
    },
	{
        dbtrack:'Fashion Week (feat. AJ Tracey & MoStack)',
		dbtrackId:'78KyOmqWmqLkQcXO1cA7MO',
		dbimageurl:'https://i.scdn.co/image/ab67616d0000b273e64d6a5253656d32d0874859',
		dbartist:'Steel Banglez ft. AJ Tracey, MoStack',
		dblinktoTrack:'https://open.spotify.com/track/78KyOmqWmqLkQcXO1cA7MO',
		dbpopularity:'71',
		dbalbumName:'Fashion Week (feat. AJ Tracey & MoStack)'
    }   
]
 
function seedDB(){
   //Remove all tunes
   Tune.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed tunes!");
        Comment.deleteMany({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed comments!");
             //add a few campgrounds
            data.forEach(function(seed){
                Tune.create(seed, function(err, tune){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("added a tune");
                        //create a comment
                        Comment.create(
                            {
                                text: "Crazyy track no cap",
                                author: "Homer"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    tune.comments.push(comment);
                                    tune.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
                });
            });
        });
    }); 
    //add a few comments
}
 
module.exports = seedDB;