(function (angular, noty) {
  "use strict";

  angular.module('StudioOpeningHourModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/studioOpeningHour', {
        templateUrl: 'studioOpeningHour/show.html',
        controller: 'StudioOpeningHourController',
        resolve: {
          studios: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Studios').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          studioOpeningHours: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/StudioOpeningHours', {params: {filter: {include: ['studio']}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('StudioOpeningHourController', ['$scope', 'studios', 'studioOpeningHours', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, studios, studioOpeningHours, ngDialog, $http, consts, $route) {
        $scope.edit = function (studioOpeningHour) {
          ngDialog.open({
            template: 'studioOpeningHour/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'StudioOpeningHourEditController',
            resolve: {
              studios: [function () {
                return studios;
              }],
              studioOpeningHour: [function () {
                return studioOpeningHour;
              }]
            }
          });
        };

        $scope.remove = function (studioOpeningHour) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this StudioOpeningHour?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/StudioOpeningHours/' + studioOpeningHour.id)
              .then(function (response) {

                noty({type: 'warning', text: 'StudioOpeningHour removed'});
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

        $scope.new = function () {
          ngDialog.open({
            template: 'studioOpeningHour/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'StudioOpeningHourNewController',
            resolve: {
              studios: [function () {
                return studios;
              }],
              studioOpeningHours: [function () {
                return studioOpeningHours;
              }]
            }
          });
        };

        $scope.studioOpeningHours = studioOpeningHours;
        $scope.studios = studios;
      }])
    .controller('StudioOpeningHourEditController', ['$scope', 'studios', 'studioOpeningHour', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, studios, studioOpeningHour, ngDialog, $http, $route, consts) {
        $scope.submit = function (studioOpeningHour) {
          $http.post(consts.apiUrl + '/StudioOpeningHours/update', studioOpeningHour, {params: {where: {id: studioOpeningHour.id}}})
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

        $scope.studios = studios;
        $scope.studioOpeningHour = studioOpeningHour  ;
      }])
    .controller('StudioOpeningHourNewController', ['$scope', 'studios', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, studios, ngDialog, $http, $route, consts) {
        $scope.submit = function (studioOpeningHour) {
          studioOpeningHour.dt_create = new Date();

          $http.post(consts.apiUrl + '/StudioOpeningHours', studioOpeningHour)
            .then(function (response) {

              noty({type: 'success', text: 'StudioOpeningHour saved'});
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

        $scope.studios = studios;
      }])
    .filter('translateWeekday', function() {
      return function(val) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][val];
      };
    })
  ;
})(angular, noty);