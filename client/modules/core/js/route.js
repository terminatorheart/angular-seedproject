;(function(){
    'use strict';

    angular
        .module( 'seedApp' )
        .config( config );

    config.$inject = [ '$routeProvider', '$locationProvider', '$httpProvider' ];
    injectToken.$inject = [ '$q', '$location', '$localStorage' ];

    function config( $routeProvider, $locationProvider, $httpProvider ){
        $routeProvider
            .when( '/', {
                templateUrl : '/modules/bootstrap/index.tpl.html',
                controller : 'indexCtrl'
            })
            .when( '/signup', {
                templateUrl : '/modules/account/signup.tpl.html',
                controller : 'signupCtrl'
            })
            .when( '/signin', {
                templateUrl : '/modules/account/signin.tpl.html',
                controller : 'signinCtrl'
            });

        $locationProvider.html5Mode( true );
    }

    function injectToken( $q, $location, $localStorage ){
        return {
            'request' : function( config ){
                config.headers = config.headers || {};
                if( $localStorage.token ){
                    config.headers.token = $localStorage.token;
                }
                return config;
            },
            'responseError' : function( response ){
                if( response.status === 401 || response.status === 403 ){
                    window.location = '';
                }
                return $q.reject( response );
            }
        }
    };
})();
