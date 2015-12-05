var jwt = require( 'express-jwt' ),
    jsonwebtoken = require( 'jsonwebtoken' ),
    _ = require( 'lodash' ),
    TOKEN_EXPIRATION = 60,
    TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION*60;

module.exports = function( envConfig ){
    return {
        /*
         * @param { String } header
         * @description 从header中获取token
         */
        fetch : function( headers ){
            if( headers && headers.authorization ){
                var authorization = headers.authorization;
                var part = authorization.split( ' ' );
                if( part.length === 2 ){
                    var token = part[1];
                    return token;
                }else{
                    return null;
                }
            }else{
                return null;
            }
        },
        /*
         * @param { Object } user
         * @param { String } req
         * @param { String } res
         * @param { Function } next
         * @description 创建token
         */
        create : function( user, req, res, next ){
            if( _.isEmpty( user ) ){
                return next( new Error( "User data cannot be empty" ) );
            }

            var data = {
                _id : user._id,
                username : user.username,
                token : jsonwebtoken.sign( { _id : user._id }, envConfig.secret, {
                    expiresMinutes : TOKEN_EXPIRATION
                }) 
            };

            req.user = data;

            next();

            //return data;

        },
        /*
         * @param { String } id
         * @param { Function } done
         * @description 恢复token
         */ 
        /*
        retrieve : function( id, done ){
            if( _.isNull( id ) ){
                return done( new Error( 'token_invalid' ),{
                    "message" : "Invalid token"
                });
            }
        },
        */
        /*
         * @param { String } req
         * @param { String } res
         * @param { Function } next
         * @description 验证token
         */ 
        verify : function( req, res, next ){
            var token = exports.fetch( req.headers );
            jsonwebtoken.verify( token,config.secret, function( err, decoded ){
                if( err ){
                    req.user = undefined;
                    return next( new UnauthorizedAccessError( 'invalid_token' ) );
                }else{
                    req.user = decoded;
                    next();
                }
            });
        }
    }
}
