(function (angular, noty) {
  "use strict";

  angular.module('RoleMappingModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/roleMapping', {
        templateUrl: 'roleMapping/show.html',
        controller: 'RoleMappingController',
        resolve: {
          roleMappings: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/RoleMappings', {params: {filter: {include: ["role"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          roles: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Roles').then(function (response) {
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

    .controller('RoleMappingController', ['$scope', 'users', 'roles', 'roleMappings', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, users, roles, roleMappings, ngDialog, $http, consts, $route) {
        $scope.edit = function (roleMapping) {
          ngDialog.open({
            template: 'roleMapping/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'RoleMappingEditController',
            resolve: {
              roleMapping: [function () {
                return roleMapping;
              }],
              roles: [function () {
                return roles;
              }],
              users: [function () {
                return users;
              }]
            }
          });
        };

        $scope.remove = function (roleMapping) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this RoleMapping?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/RoleMappings/' + roleMapping.id)
              .then(function (response) {

                noty({type: 'warning', text: 'RoleMapping removed'});
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
            template: 'roleMapping/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'RoleMappingNewController',
            resolve: {
              roles: [function () {
                return roles;
              }],
              users: [function () {
                return users;
              }]
            }
          });
        };

        $scope.roleMappings = roleMappings;
        $scope.roles = roles;
        $scope.users = users;

        _.forEach(roleMappings, function(roleMapping) {
            if(roleMapping.principalType == 'USER') {
              console.log(users, roleMapping.principalId);
              roleMapping.user = _.find(users, {id: parseInt(roleMapping.principalId)});
              roleMapping.principalId = parseInt(roleMapping.principalId);
            }
        });
      }])
    .controller('RoleMappingEditController', ['$scope', 'users', 'roles', 'roleMapping', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, users, roles, roleMapping, ngDialog, $http, $route, consts, Upload) {
        $scope.dsAvatar = {};

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

        $scope.submit = function (roleMapping) {
          $http.post(consts.apiUrl + '/RoleMappings/update', roleMapping, {params: {where: {id: roleMapping.id}}})
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

        $scope.roleMapping = angular.copy(roleMapping);
        $scope.roles = roles;
        $scope.users = users;
      }])
    .controller('RoleMappingNewController', ['$scope', 'users', 'roles', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, users, roles, ngDialog, $http, $route, consts, Upload) {
        $scope.dsAvatar = {};

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

        $scope.submit = function (roleMapping) {
          roleMapping.dt_create = new Date();

          $http.post(consts.apiUrl + '/RoleMappings', roleMapping)
            .then(function (response) {

              noty({type: 'success', text: 'RoleMapping saved'});
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

        $scope.roleMapping = {
          principalType: 'USER'
        };
        $scope.roles = roles;
        $scope.users = users;
      }])
  ;
})(angular, noty);