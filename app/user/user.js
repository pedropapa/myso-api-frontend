(function (angular, noty) {
  "use strict";

  angular.module('UserModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/user', {
        templateUrl: 'user/show.html',
        controller: 'UserController',
        resolve: {
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

    .controller('UserController', ['$scope', 'users', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, users, ngDialog, $http, consts, $route) {
        $scope.edit = function (user) {
          ngDialog.open({
            template: 'user/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'UserEditController',
            resolve: {
              user: [function () {
                return user;
              }],
              users: [function () {
                return users;
              }]
            }
          });
        };

        $scope.remove = function (user) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this User?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/Users/' + user.id)
              .then(function (response) {

                noty({type: 'warning', text: 'User removed'});
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
            template: 'user/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'UserNewController',
            resolve: {
              users: [function () {
                return users;
              }]
            }
          });
        };

        $scope.users = users;
      }])
    .controller('UserEditController', ['$scope', 'users', 'user', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, users, user, ngDialog, $http, $route, consts, Upload) {
        $scope.dsProfilePicture = {};

        $scope.submit = function (user) {
          $http.post(consts.apiUrl + '/Users/update', user, {params: {where: {id: user.id}}})
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

        $scope.upload = function (file, model, formModel, formModelVar) {
          Upload.upload({
            url: consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/upload',
            data: {file: file}
          }).then(function (resp) {
            model.location = formModel[formModelVar] = consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/download/' + resp.config.data.file.name;
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

        $scope.users = angular.copy(users);
        $scope.user = angular.copy(user);
      }])
    .controller('UserNewController', ['$scope', 'users', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, users, ngDialog, $http, $route, consts, Upload) {
        $scope.dsProfilePicture = {};

        $scope.upload = function (file, model, formModel, formModelVar) {
          Upload.upload({
            url: consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/upload',
            data: {file: file}
          }).then(function (resp) {
            model.location = formModel[formModelVar] = consts.apiUrl + '/AWSS3s/' + consts.s3bucket + '/download/' + resp.config.data.file.name;
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

        $scope.submit = function (user) {
          user.dt_create = new Date();

          $http.post(consts.apiUrl + '/Users', user)
            .then(function (response) {

              noty({type: 'success', text: 'User saved'});
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

        $scope.user = {};
        $scope.users = users;
      }])
  ;
})(angular, noty);