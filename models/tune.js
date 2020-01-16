var mongoose = require('mongoose');

var tuneSchema = new mongoose.Schema({
	dbtrack: String,
	dbtrackID: String,
	dbimageurl: String,
	dbartist: String,
	dblinkToTrack: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	dbpopularity: Number,
	createdAt: {
		type: Date, 
		default: Date.now
	},
	dbalbumName: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Tune", tuneSchema);