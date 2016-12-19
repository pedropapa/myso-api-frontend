(function (angular, noty) {
  "use strict";

  angular.module('ReferralModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/referral', {
        templateUrl: 'referral/show.html',
        controller: 'ReferralController',
        resolve: {
          referrals: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/CustomerReferrals', {params: {filter: {include: ["user", "referral"]}}}).then(function (response) {
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
          instructors: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Instructors', {params: {filter: {include: ["user"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('ReferralController', ['$scope', 'instructors', 'customers', 'referrals', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, instructors, customers, referrals, ngDialog, $http, consts, $route) {
        $scope.edit = function (referral) {
          ngDialog.open({
            template: 'referral/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ReferralEditController',
            resolve: {
              referral: [function () {
                return referral;
              }],
              customers: [function () {
                return customers;
              }],
              instructors: [function () {
                return instructors;
              }]
            }
          });
        };

        $scope.remove = function (referral) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Referral?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/CustomerReferrals/' + referral.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Referral removed'});
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
            template: 'referral/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ReferralNewController',
            resolve: {
              customers: [function () {
                return customers;
              }],
              instructors: [function () {
                return instructors;
              }]
            }
          });
        };

        $scope.referrals = referrals;
        $scope.customers = customers;
        $scope.instructors = instructors;
      }])
    .controller('ReferralEditController', ['$scope', 'instructors', 'customers', 'referral', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, instructors, customers, referral, ngDialog, $http, $route, consts) {
        $scope.submit = function (referral) {
          $http.post(consts.apiUrl + '/CustomerReferrals/update', referral, {params: {where: {id: referral.id}}})
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
        $scope.referral = angular.copy(referral);
        $scope.instructors = instructors;
      }])
    .controller('ReferralNewController', ['$scope', 'instructors', 'customers', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, instructors, customers, ngDialog, $http, $route, consts) {
        $scope.submit = function (referral) {
          referral.dt_create = new Date();

          $http.post(consts.apiUrl + '/CustomerReferrals', referral)
            .then(function (response) {

              noty({type: 'success', text: 'Referral saved'});
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

        $scope.referral = {};
        $scope.customers = customers;
        $scope.instructors = instructors;
      }])
  ;
})(angular, noty);