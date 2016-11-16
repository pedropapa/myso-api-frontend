(function (angular) {
  'use strict';

  angular.module('routes', ['ngRoute'])
    .config(['$locationProvider', '$routeProvider', '$httpProvider', function ($locationProvider, $routeProvider, $httpProvider) {
      $locationProvider.hashPrefix('!');

      var originalWhen = $routeProvider.when;

      $routeProvider.when = function (path, route) {
        route.resolve || (route.resolve = {});

        angular.extend(route.resolve, {
          ApiInfo: ['ApiService', function (ApiService) {
            return ApiService.info();
          }],
          CurrentUser: ['ApiService', function (ApiService) {
            return ApiService.currentUser;
          }]
        });

        return originalWhen.call($routeProvider, path, route);
      };

      $routeProvider.otherwise({redirectTo: '/view1'});

      $httpProvider.interceptors.push('httpInterceptor');
    }])

  // Declare app level module which depends on views, and components
  angular.module('myApp', [
    'angular-tour',
    'ngDialog',
    'ngRoute',
    'ngCookies',
    'ckeditor',
    'routes',
    'LoginModule',
    'StudioModule',
    'ClassesModule',
    'ClassStyleModule',
    'myApp.version',
    'color.picker'
  ])
    .constant('consts', {
      url: 'http://107.170.68.212:5000',
      apiUrl: 'http://107.170.68.212:5000/api'
    })
    .factory('httpInterceptor', ['$q', '$location', '$cookies', function($q, $location, $cookies) {
      return {
        request : function(config) {
          var apiPattern = /\/api\//;

          config.params = config.params || {};

          if ($cookies.get('token') && apiPattern.test(config.url)) {
            var token = JSON.parse($cookies.get('token'));
            config.params.access_token = token.id;
          }
          return config || $q.when(config);
        }
      };
    }])
    .controller('AppController', ['$scope', '$cookies', function($scope, $cookies) {
      $scope.currentStep = $cookies.get('tour') || 0;

      // save cookie after each step
      $scope.stepComplete = function() {
        $cookies.put('tour', $scope.currentStep, { expires: new Date(Date.now() + 1000*60*60*24) });
      };
    }])
    .service('ApiService', ['consts', '$injector', '$cookies', function (consts, $injector, $cookies) {
      var $http = $injector.get("$http");

      return {
        info: function () {
          return $http.get(consts.url).then(function(response) {
            return response.data;
          }, function(err) {
            return false;
          });
        },
        currentUser: {
          token: $cookies.get('token')?JSON.parse($cookies.get('token')):false
        },
        doLogin: function(username, password) {
          return $http.post(consts.apiUrl + '/Users/login', {username: username, password: password});
        }
      };
    }])

    .run(['ApiService', function(ApiService) {

    }])
  ;
})(angular);