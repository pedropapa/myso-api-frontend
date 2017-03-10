(function (angular, noty) {
  "use strict";

  angular.module('ClassStyleModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/classStyle', {
        templateUrl: 'classStyle/show.html',
        controller: 'ClassStyleController',
        resolve: {
          studios: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Studios').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          classStyles: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/ClassStyles').then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('ClassStyleController', ['$scope', 'classStyles', 'studios', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, classStyles, studios, ngDialog, $http, consts, $route) {
        $scope.edit = function (classStyle) {
          ngDialog.open({
            template: 'classStyle/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ClassStyleEditController',
            resolve: {
              classStyle: [function () {
                return classStyle;
              }],
              studios: [function () {
                return studios;
              }]
            }
          });
        };

        $scope.remove = function (studio) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this Class Style?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/ClassStyles/' + studio.id)
              .then(function (response) {

                noty({type: 'warning', text: 'Class Style removed'});
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
            template: 'classStyle/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'ClassStyleNewController',
            resolve: {
              studios: [function () {
                return studios;
              }]
            }
          });
        };

        _.forEach(classStyles, function (classStyle) {
          classStyle.studio = _.find(studios, {id: classStyle.studioId});
        });

        $scope.classStyles = classStyles;
        $scope.studios = studios;
      }])
    .controller('ClassStyleEditController', ['$scope', 'classStyle', 'studios', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, classStyle, studios, ngDialog, $http, $route, consts, Upload) {
        $scope.dsThumbnail = {};

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

        $scope.submit = function (classStyle) {
          $http.post(consts.apiUrl + '/ClassStyles/update', classStyle, {params: {where: {id: classStyle.id}}})
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

        $scope.classStyle = angular.copy(classStyle);
        $scope.studios = studios;
      }])
    .controller('ClassStyleNewController', ['$scope', 'studios', 'ngDialog', '$http', '$route', 'consts', 'Upload',
      function ($scope, studios, ngDialog, $http, $route, consts, Upload) {
        $scope.dsThumbnail = {};

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

        $scope.submit = function (classStyle) {
          $http.post(consts.apiUrl + '/ClassStyles', classStyle)
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

        $scope.classStyle = {};
        $scope.studios = studios;
      }])
  ;
})(angular, noty);