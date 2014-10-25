var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var userSchema   = new Schema({
	userId: String,
	token: String,
	userName: String,
	photo: String,
	info: {
		tel: Number,
		telVisibility: {type:Boolean,default:true},
		email: {type: String, lowercase:true},
		emailVisibility:{type:Boolean,default:true},
		fb: String,
		fbVisibility:{type:Boolean,default:true}
	},
	matches: []
});

module.exports = mongoose.model('User', userSchema);


