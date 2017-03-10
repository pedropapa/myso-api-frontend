(function (angular, noty) {
  "use strict";

  angular.module('RoleModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/role', {
        templateUrl: 'role/show.html',
        controller: 'RoleController',
        resolve: {
          roles: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Roles').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('RoleController', ['$scope', 'roles', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, roles, ngDialog, $http, consts, $route) {
        $scope.edit = function (role) {
          ngDialog.open({
            template: 'role/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'RoleEditController',
            resolve: {
              role: [function () {
                return role;
              }]
            }
          });
        };

        $scope.remove = function (role) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Role?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/Roles/' + role.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Role removed'});
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
            template: 'role/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'RoleNewController',
            resolve: {
            }
          });
        };

        $scope.roles = roles;
      }])
    .controller('RoleEditController', ['$scope', 'role', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, role, ngDialog, $http, $route, consts, Upload) {
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

        $scope.submit = function (role) {
          $http.post(consts.apiUrl + '/Roles/update', role, {params: {where: {id: role.id}}})
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

        $scope.role = angular.copy(role);
      }])
    .controller('RoleNewController', ['$scope', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, ngDialog, $http, $route, consts, Upload) {
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

        $scope.submit = function (role) {
          role.dt_create = new Date();

          $http.post(consts.apiUrl + '/Roles', role)
            .then(function (response) {

              noty({type: 'success', text: 'Role saved'});
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

        $scope.role = {};
      }])
  ;
})(angular, noty);