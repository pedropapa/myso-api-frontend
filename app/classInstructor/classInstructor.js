(function (angular, noty) {
  "use strict";

  angular.module('ClassInstructorModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/classInstructor', {
        templateUrl: 'classInstructor/show.html',
        controller: 'ClassInstructorController',
        resolve: {
          classInstructors: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/ClassInstructors', {params: {filter: {include: [{"instructor": "user"}, "class"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          classes: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Classes').then(function (response) {
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

    .controller('ClassInstructorController', ['$scope', 'instructors', 'classes', 'classInstructors', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, instructors, classes, classInstructors, ngDialog, $http, consts, $route) {
        $scope.edit = function (classInstructor) {
          ngDialog.open({
            template: 'classInstructor/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ClassInstructorEditController',
            resolve: {
              classInstructor: [function () {
                return classInstructor;
              }],
              instructors: [function () {
                return instructors;
              }],
              classes: [function () {
                return classes;
              }]
            }
          });
        };

        $scope.remove = function (classInstructor) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this ClassInstructor?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/ClassInstructors/' + classInstructor.id)
              .then(function (response) {

                noty({type: 'warning', text: 'ClassInstructor removed'});
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
            template: 'classInstructor/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ClassInstructorNewController',
            resolve: {
              instructors: [function () {
                return instructors;
              }],
              classes: [function () {
                return classes;
              }]
            }
          });
        };

        $scope.classInstructors = classInstructors;
        $scope.instructors = instructors;
        $scope.classes = classes;
      }])
    .controller('ClassInstructorEditController', ['$scope', 'classes', 'instructors', 'classInstructor', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, classes, instructors, classInstructor, ngDialog, $http, $route, consts) {
        $scope.submit = function (classInstructor) {
          $http.post(consts.apiUrl + '/ClassInstructors/update', classInstructor, {params: {where: {id: classInstructor.id}}})
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

        $scope.classInstructor = angular.copy(classInstructor);
        $scope.instructors = angular.copy(instructors);
        $scope.classes = classes;
      }])
    .controller('ClassInstructorNewController', ['$scope', 'classes', 'instructors', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, classes, instructors, ngDialog, $http, $route, consts) {
        $scope.submit = function (classInstructor) {
          classInstructor.dt_create = new Date();

          $http.post(consts.apiUrl + '/ClassInstructors', classInstructor)
            .then(function (response) {

              noty({type: 'success', text: 'ClassInstructor saved'});
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

        $scope.classInstructor = {};
        $scope.instructors = instructors;
        $scope.classes = classes;
      }])
  ;
})(angular, noty);