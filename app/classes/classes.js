(function (angular, noty) {
  "use strict";

  angular.module('ClassesModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/classes', {
        templateUrl: 'classes/show.html',
        controller: 'ClassesController',
        resolve: {
          classStyles: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/ClassStyles').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          classes: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Classes', {params: {filter: {include: "classStyle"}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('ClassesController', ['$scope', 'classStyles', 'classes', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, classStyles, classes, ngDialog, $http, consts, $route) {
        $scope.edit = function (_class) {
          ngDialog.open({
            template: 'classes/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ClassesEditController',
            resolve: {
              _class: [function () {
                return _class;
              }],
              classStyles: [function () {
                return classStyles;
              }]
            }
          });
        };

        $scope.remove = function (_class) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Class?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/Classes/' + _class.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Class removed'});
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
            template: 'classes/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ClassesNewController',
            resolve: {
              classStyles: [function () {
                return classStyles;
              }]
            }
          });
        };

        $scope.classStyles = classStyles;
        $scope.classes = classes;
      }])
    .controller('ClassesEditController', ['$scope', 'classStyles', '_class', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, classStyles, _class, ngDialog, $http, $route, consts) {
        $scope.submit = function (_class) {
          $http.post(consts.apiUrl + '/Classes/update', _class, {params: {where: {id: _class.id}}})
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

        $scope.classStyles = angular.copy(classStyles);
        $scope._class = angular.copy(_class);
      }])
    .controller('ClassesNewController', ['$scope', 'classStyles', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, classStyles, ngDialog, $http, $route, consts) {
        $scope.submit = function (_class) {
          _class.dt_create = new Date();

          $http.post(consts.apiUrl + '/Classes', _class)
            .then(function (response) {

              noty({type: 'success', text: 'Class style saved'});
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

        $scope._class = {};
        $scope.classStyles = classStyles;
      }])
  ;
})(angular, noty);