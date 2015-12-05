var express = require( 'express' ),
    jwt = require( 'express-jwt' ),
    _ = require( 'lodash' );

module.exports = function( app, envConfig ){
    var main = require( '../routes/main' )( envConfig );

    app.get( '/', main.index );
    app.get( '/signin', main.index );
    app.get( '/signup', main.index );
}
