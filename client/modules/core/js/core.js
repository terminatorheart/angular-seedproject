;(function(){
    'use strict';

    angular
        .module( 'seedApp', [
            'ngRoute',
            'ngStorage',
            'seedApp.bootstrap',
            'seedApp.account'
        ] );
})();
