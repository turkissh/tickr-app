// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '494507530694280', // your App ID
		'clientSecret' 	: '85bed0fc6a7be8d4f7de832fbf9c4e41', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/api/auth/facebook/callback'
	}

};