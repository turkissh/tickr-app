//Call the packages needed for the application
var express    		= require('express'); 		// call express
var app        		= express(); 				// define our app using express
var bodyParser 		= require('body-parser');
var mongoose   		= require('mongoose');
var passport   		= require('passport');
//var flash    		= require('connect-flash');
var cookieParser 	= require('cookie-parser');
var session      	= require('express-session');



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// required for passport
app.use(session({ 
                    secret: 'thisistickerbitch' ,
                    cookie : {
                        maxAge: 1800000, //previously set to just 1800 - which was too low
                        httpOnly: true
                    }
                })); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//app.use(flash()); // use connect-flash for flash messages stored in session

var port = process.env.PORT || 8080; 		// set our port

//Connect database
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database


require('./config/passport')(passport); // pass passport for configuration


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router
require('./app/routes')(router,passport);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);