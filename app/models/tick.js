var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var tickSchema   = new Schema({
	userId: String,
	location: [Number,Number],
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Tick', tickSchema);


