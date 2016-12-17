(function (angular, noty) {
  "use strict";

  angular.module('CustomerPlanModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/customerPlan', {
        templateUrl: 'customerPlan/show.html',
        controller: 'CustomerPlanController',
        resolve: {
          customerPlans: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/CustomerPlans', {params: {filter: {include: [{"customer": "user"}, "plan"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          customers: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Customers', {params: {filter: {include: ["user"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          plans: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Plans').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('CustomerPlanController', ['$scope', 'customers', 'plans', 'customerPlans', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, customers, plans, customerPlans, ngDialog, $http, consts, $route) {
        $scope.edit = function (customerPlan) {
          ngDialog.open({
            template: 'customerPlan/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'CustomerPlanEditController',
            resolve: {
              customerPlan: [function () {
                return customerPlan;
              }],
              customers: [function () {
                return customers;
              }],
              plans: [function () {
                return plans;
              }]
            }
          });
        };

        $scope.remove = function (customerPlan) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this CustomerPlan?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/CustomerPlans/' + customerPlan.id)
              .then(function (response) {

                noty({type: 'warning', text: 'CustomerPlan removed'});
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
            template: 'customerPlan/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'CustomerPlanNewController',
            resolve: {
              customers: [function () {
                return customers;
              }],
              plans: [function () {
                return plans;
              }]
            }
          });
        };

        $scope.customerPlans = customerPlans;
        $scope.customers = customers;
        $scope.plans = plans;
      }])
    .controller('CustomerPlanEditController', ['$scope', 'customers', 'plans', 'customerPlan', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, customers, plans, customerPlan, ngDialog, $http, $route, consts) {
        $scope.submit = function (customerPlan) {
          $http.post(consts.apiUrl + '/CustomerPlans/update', customerPlan, {params: {where: {id: customerPlan.id}}})
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

        $scope.customers = angular.copy(customers);
        $scope.plans = angular.copy(plans);
        $scope.customerPlan = angular.copy(customerPlan);
      }])
    .controller('CustomerPlanNewController', ['$scope', 'customers', 'plans', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, customers, plans, ngDialog, $http, $route, consts) {
        $scope.submit = function (customerPlan) {
          customerPlan.dt_create = new Date();

          $http.post(consts.apiUrl + '/CustomerPlans', customerPlan)
            .then(function (response) {

              noty({type: 'success', text: 'CustomerPlan saved'});
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

        $scope.customerPlan = {};
        $scope.customers = customers;
        $scope.plans = plans;
      }])
  ;
})(angular, noty);