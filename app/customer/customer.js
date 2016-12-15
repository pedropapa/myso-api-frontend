(function (angular, noty) {
  "use strict";

  angular.module('CustomerModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/customer', {
        templateUrl: 'customer/show.html',
        controller: 'CustomerController',
        resolve: {
          customers: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Customers', {params: {filter: {include: ["user"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          users: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Users').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('CustomerController', ['$scope', 'users', 'customers', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, users, customers, ngDialog, $http, consts, $route) {
        $scope.edit = function (customer) {
          ngDialog.open({
            template: 'customer/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'CustomerEditController',
            resolve: {
              customer: [function () {
                return customer;
              }],
              users: [function () {
                return users;
              }]
            }
          });
        };

        $scope.remove = function (customer) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Customer?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/Customers/' + customer.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Customer removed'});
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
            template: 'customer/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'CustomerNewController',
            resolve: {
              users: [function () {
                return users;
              }]
            }
          });
        };

        $scope.customers = customers;
        $scope.users = users;
      }])
    .controller('CustomerEditController', ['$scope', 'users', 'customer', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, users, customer, ngDialog, $http, $route, consts) {
        $scope.submit = function (customer) {
          $http.post(consts.apiUrl + '/Customers/update', customer, {params: {where: {id: customer.id}}})
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

        $scope.users = angular.copy(users);
        $scope.customer = angular.copy(customer);
      }])
    .controller('CustomerNewController', ['$scope', 'users', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, users, ngDialog, $http, $route, consts) {
        $scope.submit = function (customer) {
          customer.dt_create = new Date();

          $http.post(consts.apiUrl + '/Customers', customer)
            .then(function (response) {

              noty({type: 'success', text: 'Customer saved'});
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

        $scope.customer = {};
        $scope.users = users;
      }])
  ;
})(angular, noty);