var mongoose = require('mongoose');

var tuneSchema = new mongoose.Schema({
	dbtrack: String,
	dbtrackID: String,
	dbimageurl: String,
	dbartist: String,
	dblinkToTrack: String,
	dbpopularity: Number,
	dbalbumName: String,
	dbupvotes: Number,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Tune", tuneSchema);