'use strict'; 

var path = require( 'path' );
var rootPath = path.normalize( __dirname + '/../client/public' );

module.exports = {
    development : {
        rootPath : rootPath,
        //database : '',
        port : process.env.PORT || 8000,
        secret : 'dev-secret'
    },
    production : {
        rootPath : rootPath,
        database : '',
        port : process.env.PORT || 8090,
        secret : 'production-secret'
    }
}
