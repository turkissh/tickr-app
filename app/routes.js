module.exports = function(router,passport){

	//Imports
	var Tick = require('./models/tick.js');
	var User = require('./models/user.js');
	var Match = require('./models/match.js');


	// middleware to use for all requests
	router.use(function(req, res, next) {
		// do logging
		res.contentType('application/json');
		console.log('New request recieved!');
		next();
	});

	// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
	router.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});



	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	//login
	router.get('/auth/facebook',
		passport.authenticate('facebook', { scope : 'email' }));

	//callback
	router.get('/auth/facebook/callback', function(req, res, next) {
	  console.log("Response from facebook");
	  passport.authenticate('facebook', function(err, user, info) {
	    if (err) { res.jsonp({status:1}); }
	    if (!user) { res.jsonp({status:1}); }
	    req.logIn(user, function(err) {
	      if (err) { res.jsonp({status:1}); }
	      res.redirect('http://localhost:8100/#/main');
	      //res.jsonp({status:0});
	    });
	  })(req, res, next);
	});

	//Logout
	router.get('/auth/logout',function(req,res){
		req.logout();
		res.jsonp({status:0});
	});

	//Get the user id from the session
	router.get('/auth/userid',function(req,res){
		res.jsonp({"userId": req.user.userId});
	});

	//Check if the user is logged or not
	router.get('/auth/hasSession',function (req,res) {
		
		if ( !isEmptyObject(req.session.passport) ){
			res.jsonp({status:0});
		}else{
			res.jsonp({status:2});
		}
		
	});




	


	//-------------------------USER INFO things!
	
	router.route('/user/info')

		//Get user info
		.get(isLoggedIn,function(req,res){

			console.log("Getting info of: " + req.body.userId);

			User.findOne({ userId: req.body.userId},
						{userName:1,photo:1,info:1},
						function(err,user){
				if(err){
					console.error("Error getting user profile");
					console.error(err);
					res.jsonp({status:1});
				}

				res.jsonp(user);
			});
		})

		//Set user info
		.post(isLoggedIn,function(req,res){

			console.info("Setting user info");

			var userId = req.body.userId;

			//Validate the user exists
			User.findOne({'userId':userId},function(err,user){
				if(err){
					console.error("Error updating user info");
					console.error(err);
					res.jsonp({status:1});
				}

				if (!user) {
					console.info("User dont exists!");
					res.jsonp({status:1});
				}else{

					//Create the object to save
					var newInfo = {
						tel: req.body.tel,
						telVisibility: req.body.telVisibility,
						email: req.body.email,
						emailVisibility: req.body.emailVisibility,
						fb: req.body.fb,
						fbVisibility:req.body.fbVisibility 
					};

					//Update the user info
					User.update({'userId':user.userId},
								{$set : {'info':newInfo}},
								function(err,save){
									if(err){
										console.error("Error saving new info :@");
										console.error(err);
										res.jsonp({status:1});
									}

									if(save){
										console.log("Info updated");
										res.jsonp({status:0});
									}else{
										console.warn("No user updated");
										res.jsonp({status:1});
									}
					});

				};

			});

	});




	//---------------------------TICKS things!
	router.route('/tick')

		// create a tick (accessed at POST http://localhost:8080/api/tick)
		.post(isLoggedIn,function(req, res) {
			
			console.log("New tick recieved from: " + req.body.userId);

			Tick.remove({userId:req.body.userId},function(err,removed){
				if(err){
					console.error("Error removing previous tick");
					console.error(err);
					res.jsonp({status:1});
				}

				var tick = new Tick(); 		// create a new instance of the Bear model
				tick.userId = req.body.userId;  // set the bears name (comes from the request)
				tick.location = [ req.body.long , req.body.lat ];

				// save the bear and check for errors
				tick.save(function(err) {
					if (err){
						console.error("Error saving tick " + err);
						res.jsonp({status : 1});
					}

					res.json({ status : 0 });
				});

			});

			
		})

		// Gettings ticks near specified user
		.get(isLoggedIn,function(req, res) {
			console.log("Checking ticks for: " + req.body.userId);
			
			Tick.findOne({userId:req.body.userId},function(err,firstTick){
				if(err){
					console.error("Error getting the initial tick");
					res.jsonp({status:1});
				}

				if(firstTick){

					console.info("First tick of " + firstTick.userId + " in " 
						+ firstTick.location);

					//If there was a first tick, checks nears ticks
					if(firstTick){
						Tick.find({location : { "$near" : firstTick.location, "$maxDistance" : 1/111.12}},
						function (err, ticks) {
		      				if(err){
		      					console.error("Error getting ticks near: " + req.body.userId);
		      					console.error(err);
		      					res.jsonp({status:1});
		      				}	      				

		      				if(ticks)
		      					ticks.splice(findIndexByUserId(ticks,firstTick.userId),1);

		      				if(ticks.length > 0){
		      					console.log(ticks);
		      					res.jsonp({status:0,status:ticks});
		      				}else{
		      					console.warn("No ticks near :( you seems to be alone");
		      					res.jsonp({status:1});
		      				}


						});

	      			}else{
	      				console.info("There wasn't first tick");
	      				res.jsonp({status:1});
	      			}


	      		}else{

	      			console.warn("There is not first tick!");
	      			res.jsonp({status:1});

	      		}
			});

	});


	//--------------------------------MATCHS things!
	router.route('/match')


		//Get user matches
		.get(isLoggedIn,function(req,res){

			console.log("Getting ticks for: " + req.query.id);
			User.findOne({userId:req.query.id},function(err,user){

				if (err){
					console.error("Error getting ticks:" + err);
					res.jsonp( null );
				}

				if(user){
					console.log("Res(" + user.userId + ") ticks: " + user.matches);

					var matches = [];

					matches = getUserMatches(User,user.matches);

					res.jsonp( matches );
				}else{
					console.warn("User dont exists..!");
					res.jsonp({status:1});
				}
			});
		})


		// Setting a match to a user
		.post(isLoggedIn,function(req,res){

			console.log("Setting match from " + req.body.userId + " to " + req.params.userId);
			var requester = req.body.userId;
			var matched = req.params.userId;

			//Checks if the matchs is the second one
			Match.findOne({ users : { $in : [ requester , matched ] }} , 
				function(err , match){



					if(err){
						console.error("Error getting the second match!");
						console.error(err);
						res.jsonp({status:1});
					}

					if(match){

						//Match realized, adding match to users doc
						User.update({userId: requester},
							{ $addToSet: {matches : matched}},
							function(err,user){
								if(err){
									console.error("Error finding requester to match");
									res.jsonp({status:1});
								}

							console.log("Requester matched!");


							User.update({userId: matched},
							{ $addToSet : {matches: requester}},
							function(err,user){
								if(err){
									console.error("Error finding matched to match");
									res.jsonp({status:1});
								}
							console.log("Matched matched!");

							console.log("Match realized, yupi!");

								//Remove the match
								Match.remove({ users : { $in : [ requester , matched ] }},
									function(err,match){
										if(err){
											console.error("Error removing the match :(");
											res.jsonp({status:1});
										}
									console.info("Match removed");

									Tick.remove({ userId : { $in : [ requester , matched ] }},
										function(err,tick){
											if(err){
												console.error("Error removing ticks!");
												res.jsonp({status:1});
											}

											console.info("Ticks removed, have a nice day ;)");
											res.jsonp({status:0});
										})

								});

							});


						});

						
					}else{

						//Is the first match, add to the match collection

						var match = new Match();
						match.users = [requester , matched];
						match.save(function(err){
							if(err){
								console.error("Error saving first match!");
								res.jsonp({status:1});
							}

							console.info("Match saved, waiting for a roommate!");
							res.jsonp({status:0});
						});

					}


				});

		});

}

//Find the index of the userId in an array
function findIndexByUserId(ticks , thisUserId ){

	for (var i = 0; i < ticks.length; i++) {
		
		if(ticks[i].userId == thisUserId){
			return i;
		}
	};
	return -1;
};


//Creates an array with the info of all the matches
function getUserMatches(User,userMatches) {
	
	var matches = [];

	for (var i = 0; i < userMatches.length; i++) {

		User.findOne({userId:userMatches[i]},{userId:1,userName:1,photo:1,info:1},function(err,user){

			matches.push(user);

		})
	};
	return matches;
}

//make sure the user is logged
function isLoggedIn (req,res,next) {
	
	if (!isEmptyObject(req.session.passport)){
		return next();
	}else{
		res.jsonp({status:2});
	}

}

//Check if a object is empty
function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}
