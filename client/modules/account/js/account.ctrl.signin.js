;(function(){
    'use strict';

    angular
        .module( 'seedApp.account' )
        .controller( 'signinCtrl', signinCtrl );

    signinCtrl.$inject = [];

    function signinCtrl(){
        // jshint validthis: true 
        var vm = this;

        vm.signin   = signin;
        vm.username = "";                       // 初始化用户名
        vm.password = "";                       // 初始化密码

        /*
         * @description 用户登录，不接收参数
         */
        function signin(){
            // invoke verify form
        }


    }
})();
