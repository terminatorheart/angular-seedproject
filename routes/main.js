module.exports = function( envConfig ){
    var options = {
        root : envConfig.rootPath
    }
    return {
        index : function( req, res ){
            res.sendFile( '/modules/core/frame.tpl.html', options );
        },
        signin : function( req, res ){
            res.sendFile( '/modules/core/frame.tpl.html', options );
        }
    }
}
