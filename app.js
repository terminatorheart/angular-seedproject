var express = require('express'),
    app = express(),
    path = require( 'path' ),
    bodyParser = require( 'body-parser' );


// Environments
var env = process.env.NODE_ENV || 'development';
var envConfig = require( './config/env' )[env];

app.use( express.static( path.join( __dirname, '/client/public' ) ) );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended : true } ) );

// Database config
//require( './config/database' )( envConfig, cachedData );


// Routes
require( './config/route' )( app, envConfig );

/*
require( './routes/api' )( app );
require( './config/route' )( app );

var apiRouter = express.Router();

app.use( '/api', apiRouter );
*/

// set static files root path 

// setting views folder
//app.set( 'views', __dirname + '/server/views' );

var server = app.listen( envConfig.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
