(function (angular, noty) {
  "use strict";

  angular.module('InstructorModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/instructor', {
        templateUrl: 'instructor/show.html',
        controller: 'InstructorController',
        resolve: {
          instructors: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Instructors', {params: {filter: {include: ["user", "studio"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          instructorLevels: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/InstructorLevels').then(function (response) {
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

    .controller('InstructorController', ['$scope', 'instructorLevels', 'studios', 'users', 'instructors', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, instructorLevels, studios, users, instructors, ngDialog, $http, consts, $route) {
        $scope.edit = function (instructor) {
          ngDialog.open({
            template: 'instructor/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'InstructorEditController',
            resolve: {
              instructor: [function () {
                return instructor;
              }],
              users: [function () {
                return users;
              }],
              studios: [function () {
                return studios;
              }],
              instructorLevels: [function () {
                return instructorLevels;
              }]
            }
          });
        };

        $scope.remove = function (instructor) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Instructor?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/Instructors/' + instructor.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Instructor removed'});
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
            template: 'instructor/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'InstructorNewController',
            resolve: {
              users: [function () {
                return users;
              }],
              studios: [function () {
                return studios;
              }],
              instructorLevels: [function () {
                return instructorLevels;
              }]
            }
          });
        };

        $scope.instructors = instructors;
        $scope.users = users;
        $scope.studios = studios;
      }])
    .controller('InstructorEditController', ['$scope', 'instructorLevels', 'studios', 'users', 'instructor', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, instructorLevels, studios, users, instructor, ngDialog, $http, $route, consts, Upload) {
        $scope.dsAvatar = {};

        $scope.upload = function (file, model, formModel, formModelVar) {
          Upload.upload({
            url: consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/upload',
            data: {file: file}
          }).then(function (resp) {
            model.location = formModel[formModelVar] = consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/download/' + resp.data.result.files.file[0].name;
          }, function (resp) {
            noty({
              type: 'error',
              text: 'An error has ocurred while uploading the image to the server.'
            });

            console.error(resp);
          }, function (evt) {
            model.progress = parseInt(100.0 * evt.loaded / evt.total);
          });
        };

        $scope.submit = function (instructor) {
          $http.post(consts.apiUrl + '/Instructors/update', instructor, {params: {where: {id: instructor.id}}})
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
        $scope.instructor = angular.copy(instructor);
        $scope.studios = studios;
        $scope.instructorLevels = angular.copy(instructorLevels);

        $scope.instructor.nu_level = ""+ $scope.instructor.nu_level;

        console.log($scope.instructor, instructorLevels);

        // $scope.instructor.nu_level = _.find(instructorLevels, {nu_level: instructor.nu_level});
      }])
    .controller('InstructorNewController', ['$scope', 'instructorLevels', 'studios', 'users', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, instructorLevels, studios, users, ngDialog, $http, $route, consts, Upload) {
        $scope.dsAvatar = {};

        $scope.upload = function (file, model, formModel, formModelVar) {
          Upload.upload({
            url: consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/upload',
            data: {file: file}
          }).then(function (resp) {
            model.location = formModel[formModelVar] = consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/download/' + resp.data.result.files.file[0].name;
          }, function (resp) {
            noty({
              type: 'error',
              text: 'An error has ocurred while uploading the image to the server.'
            });

            console.error(resp);
          }, function (evt) {
            model.progress = parseInt(100.0 * evt.loaded / evt.total);
          });
        };

        $scope.submit = function (instructor) {
          instructor.dt_create = new Date();

          $http.post(consts.apiUrl + '/Instructors', instructor)
            .then(function (response) {

              noty({type: 'success', text: 'Instructor saved'});
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

        $scope.instructor = {};
        $scope.users = users;
        $scope.studios = studios;
        $scope.instructorLevels = instructorLevels;
      }])
  ;
})(angular, noty);