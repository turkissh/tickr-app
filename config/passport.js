var FacebookStrategy = require('passport-facebook').Strategy;

// load up the user model
var User       = require('../app/models/user.js');

// load the auth variables
var configAuth = require('./auth.js');

module.exports = function(passport) {

	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
        	if(err) done(err,null);
            done(null, user);
        });
    });
   


	// =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

    	console.log("Response from facebook");

		// // asynchronous
		// process.nextTick(function() {

			// find the user in the database based on their facebook id
	        User.findOne({ 'userId' : profile.id }, function(err, user) {

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err){
	            	console.error("Error finding user existance");
	                return done(err);
	            }

				// if the user is found, then log them in
	            if (user) {
	            	console.info("User exists");
	                done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser            = new User();

					// set all of the facebook information in our user model
	                newUser.userId 		   = profile.id; // set the users facebook id	                
	                //newUser.token 		   = token; // we will save the token that facebook provides to the user	                
	                newUser.userName  	   = profile.displayName; // look at the passport user profile to see how names are returned
	                console.info("Adding new user: " + newUser.userName );
	                newUser.info.email 	   = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
	                newUser.info.fb 	   = profile.profileUrl;
	                newUser.photo 		   = getUserPhotoUrl(profile.id); //Get the facebook photo

					//save our user to the database
	                newUser.save(function(err) {
	                    if (err){
	                    	console.error("Error saving new user");
	                        throw err;
	                    }
	                    console.info("User saved");
	                    // if successful, return the new user
	                    done(null, newUser);
	                });
	            }

	        });

    }));

};

//Creates a graph url for getting the user photo
function getUserPhotoUrl(userId) {
	return "https://graph.facebook.com/" + userId + "/picture?width=200&height=200";
}
