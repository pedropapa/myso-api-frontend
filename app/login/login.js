(function (angular, noty) {
  "use strict";

  angular.module('LoginModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginController'
      });
    }])

    .controller('LoginController', ['$scope', 'ApiInfo', 'ApiService', 'ngDialog', '$location', '$route', '$cookies',
      function ($scope, ApiInfo, ApiService, ngDialog, $location, $route, $cookies) {
        $scope.ApiInfo = ApiInfo;
        $scope.form = {};
        $scope.token = $cookies.get('token')?JSON.parse($cookies.get('token')):false;
        
        $scope.resetToken = function() {
          $cookies.put('token', "");
          $route.reload();
        }

        $scope.login = function (form) {
          ApiService.doLogin(form.username, form.password)
            .then(function (response) {
              $cookies.put('token', JSON.stringify(response.data) );
              $('#mainNoty').noty({type: 'success', text: 'login succeed, cookie set!'});
              $route.reload();
            }, function (err) {
              if (err.data.error && err.data.error.message) {
                $('#mainNoty').noty({type: 'error', text: err.data.error.message});
              } else {
                console.error(err);
                $('#mainNoty').noty({
                  type: 'error',
                  text: 'An unknown error has ocurred, check browser\'s console for more info'
                });
              }
            });
        };
      }]);
})(angular, noty);