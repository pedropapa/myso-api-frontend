(function (angular, noty) {
  "use strict";

  angular.module('PlanModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/plan', {
        templateUrl: 'plan/show.html',
        controller: 'PlanController',
        resolve: {
          plans: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Plans').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          studios: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Studios').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('PlanController', ['$scope', 'studios', 'plans', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, studios, plans, ngDialog, $http, consts, $route) {
        $scope.edit = function (plan) {
          ngDialog.open({
            template: 'plan/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'PlanEditController',
            resolve: {
              plan: [function () {
                return plan;
              }],
              studios: [function () {
                return studios;
              }]
            }
          });
        };

        $scope.remove = function (plan) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Plan?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/Plans/' + plan.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Plan removed'});
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
            template: 'plan/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'PlanNewController',
            resolve: {
              studios: [function () {
                return studios;
              }]
            }
          });
        };

        $scope.plans = plans;
        $scope.studios = studios;
      }])
    .controller('PlanEditController', ['$scope', 'studios', 'plan', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, studios, plan, ngDialog, $http, $route, consts) {
        $scope.submit = function (plan) {
          var _plan = {
            name: plan.name
          };

          $http.post(consts.apiUrl + '/Plans/update', _plan, {params: {where: {id: plan.id}}})
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

        $scope.plan = angular.copy(plan);
        $scope.studios = studios;
      }])
    .controller('PlanNewController', ['$scope', 'studios', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, studios, ngDialog, $http, $route, consts) {
        $scope.submit = function (plan) {
          $http.post(consts.apiUrl + '/Plans', plan)
            .then(function (response) {

              noty({type: 'success', text: 'Plan saved'});
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

        $scope.plan = {};
        $scope.studios = studios;
      }])
  ;
})(angular, noty);