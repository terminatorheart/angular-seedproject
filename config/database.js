var mongoose = require( 'mongoose' );

mongoose.Promise = global.Promise;

module.exports = function( envConfig ){

    mongoose.connect( envConfig.database, function(){
        console.log( 'connect success' );
    });

}
