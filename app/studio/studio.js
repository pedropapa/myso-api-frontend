(function (angular, noty) {
  "use strict";

  angular.module('StudioModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/studio', {
        templateUrl: 'studio/show.html',
        controller: 'StudioController',
        resolve: {
          studios: ['consts', '$http', 'ApiService', function(consts, $http) {
            return $http.get(consts.apiUrl + '/Studios').then(function(response) {
              return response.data;
            }, function(err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('StudioController', ['$scope', 'studios', 'ngDialog', '$http', 'consts', '$route', function($scope, studios, ngDialog, $http, consts, $route) {
      $scope.edit = function(studio) {
        ngDialog.open({
          template: 'studio/edit.html',
          className: 'ngdialog-theme-default',
          width: '70%',
          controller: 'StudioEditController',
          resolve: {
            studio: [function() {
              return studio;
            }]
          }
        });
      };

      $scope.remove = function(studio) {
        ngDialog.openConfirm({
          template:'\
                <p>Do you really want to remove this Studio?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
          plain: true
        }).then(function(confirm) {
          $http.delete(consts.apiUrl + '/Studios/' + studio.id)
            .then(function (response) {

              noty({type: 'warning', text: 'Studio removed'});
              $route.reload();
            }, function (err) {
              if (err.data.error && err.data.error.message) {
                noty({type: 'error', text: err.data.error.message});
              } else {
                console.error(err);
                noty({
                  type: 'error',
                  text: 'An unknown error has ocurred, check browser\'s console for more info'
                });
              }
            });
        });
      }

      $scope.new = function() {
        ngDialog.open({
          template: 'studio/new.html',
          className: 'ngdialog-theme-default',
          width: '70%',
          controller: 'StudioNewController',
          resolve: {

          }
        });
      };

      $scope.studios = studios;
    }])
    .controller('StudioEditController', ['$scope', 'studio', 'ngDialog', '$http', '$route', 'consts',
      function($scope, studio, ngDialog, $http, $route, consts) {
      $scope.submit = function(studio) {
        $http.post(consts.apiUrl + '/Studios/update', studio, {params: {where: {id: studio.id}}})
          .then(function (response) {

            noty({type: 'success', text: 'Changes saved '});
            $scope.closeThisDialog();
            $route.reload();
          }, function (err) {
            if (err.data.error && err.data.error.message) {
              noty({type: 'error', text: err.data.error.message});
            } else {
              console.error(err);
              noty({
                type: 'error',
                text: 'An unknown error has ocurred, check browser\'s console for more info'
              });
            }
          });
      };

      $scope.studio = angular.copy(studio);
    }])
    .controller('StudioNewController', ['$scope', 'ngDialog', '$http', '$route', 'consts',
      function($scope, ngDialog, $http, $route, consts) {
        $scope.submit = function(studio) {
          $http.post(consts.apiUrl + '/Studios', studio)
            .then(function (response) {

              noty({type: 'success', text: 'Studio saved'});
              $scope.closeThisDialog();
              $route.reload();
            }, function (err) {
              if (err.data.error && err.data.error.message) {
                noty({type: 'error', text: err.data.error.message});
              } else {
                console.error(err);
                noty({
                  type: 'error',
                  text: 'An unknown error has ocurred, check browser\'s console for more info'
                });
              }
            });
        };

        $scope.studio = {};
      }])
  ;
})(angular, noty);