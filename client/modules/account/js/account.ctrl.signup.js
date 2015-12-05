;(function(){
    'use strict';

    angular
        .module( 'seedApp.account' )
        .controller( 'signupCtrl', signupCtrl );

    signupCtrl.$inject = [];

    function signupCtrl(){
        // jshint validthis: true
        var vm = this;

        vm.signup          = signup;
        vm.username        = "";                       // 初始化用户名表单域
        vm.password        = "";                       // 初始化密码表单域
        vm.confirmPassword = "";                       // 初始化确认密码表单域

        /*
         * @description 用户登录，不接收参数
         */
        function signup(){
            // invoke verify form
        }

    }
})();
