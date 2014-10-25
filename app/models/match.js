var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var matchSchema   = new Schema({
	users: []
});

module.exports = mongoose.model('Match', matchSchema);


