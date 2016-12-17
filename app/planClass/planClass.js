(function (angular, noty) {
  "use strict";

  angular.module('PlanClassModule', ['myApp', 'ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/planClass', {
        templateUrl: 'planClass/show.html',
        controller: 'PlanClassController',
        resolve: {
          planClasses: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/PlanClasses', {params: {filter: {include: ["accessType", "plan"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          classStyles: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/ClassStyles', {params: {filter: {include: ["studio"]}}}).then(function (response) {
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
          classes: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Classes', {params: {filter: {include: [{"classStyle": "studio"}]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }],
          plans: ['consts', '$http', 'ApiService', function (consts, $http) {
            return $http.get(consts.apiUrl + '/Plans', {params: {filter: {include: ["studio"]}}}).then(function (response) {
              return response.data;
            }, function (err) {
              return false;
            });
          }]
        }
      });
    }])

    .controller('PlanClassController', ['$scope', 'planClasses', 'classStyles', 'studios', 'classes', 'plans', 'ngDialog', '$http', 'consts', '$route',
      function ($scope, planClasses, classStyles, studios, classes, plans, ngDialog, $http, consts, $route) {
        $scope.edit = function (planClass) {
          ngDialog.open({
            template: 'planClass/edit.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'PlanClassEditController',
            resolve: {
              classStyles: [function () {
                return classStyles;
              }],
              studios: [function () {
                return studios;
              }],
              classes: [function () {
                return classes;
              }],
              planClasses: [function () {
                return planClasses;
              }],
              plans: [function () {
                return plans;
              }]
            }
          });
        };

        $scope.remove = function (planClass) {
          ngDialog.openConfirm({
            template: '\
                <p>Do you really want to remove this PlanClass?</p>\
                <div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-secondary" ng-click="closeThisDialog(0)">No</button>\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click="confirm(1)">Yes</button>\
                </div>',
            plain: true
          }).then(function (confirm) {
            $http.delete(consts.apiUrl + '/PlanClasses/' + planClass.id)
              .then(function (response) {

                noty({type: 'warning', text: 'PlanClass removed'});
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
            template: 'planClass/new.html',
            className: 'ngdialog-theme-default',
            width: '70%',
            controller: 'PlanClassNewController',
            resolve: {
              classStyles: [function () {
                return classStyles;
              }],
              studios: [function () {
                return studios;
              }],
              classes: [function () {
                return classes;
              }],
              plans: [function () {
                return plans;
              }]
            }
          });
        };

        $scope.classStyles = classStyles;
        $scope.studios = studios;
        $scope.classes = classes;
        $scope.planClasses = planClasses;
        $scope.plans = plans;
        $scope.formData = {};
      }])
    .controller('PlanClassEditController', ['$scope', 'planClasses', 'classStyles', 'studios', 'classes', 'plans', 'planClass', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, planClasses, classStyles, studios, classes, plans, planClass, ngDialog, $http, $route, consts) {
        $scope.submit = function (planClass) {
          $http.post(consts.apiUrl + '/PlanClass/update', planClass, {params: {where: {id: planClass.id}}})
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

        $scope.classStyles = classStyles;
        $scope.studios = studios;
        $scope.classes = classes;
        $scope.planClasses = planClasses;
        $scope.plans = plans;
        $scope.formData = {};
      }])
    .controller('PlanClassNewController', ['$scope', 'classStyles', 'studios', 'classes', 'plans', 'ngDialog', '$http', '$route', 'consts',
      function ($scope, classStyles, studios, classes, plans, ngDialog, $http, $route, consts) {
        $scope.removePlanClass = function(planClass) {
          $scope.planClasses.splice(planClass, 1);
        };

        $scope.allFromStudio = function(studio, formData) {
          if(!_.find($scope.planClasses, {accessTypeId: 1, co_generic_id: studio.id})) {
            $scope.planClasses.push({
              accessTypeId: 1,
              co_generic_id: studio.id,
              studio: studio,
              planId: formData.planId
            });
          }
        };

        $scope.allFromClassStyle = function(classStyle, formData) {
          if(!_.find($scope.planClasses, {accessTypeId: 2, co_generic_id: classStyle.id})) {
            $scope.planClasses.push({
              accessTypeId: 2,
              co_generic_id: classStyle.id,
              classStyle: classStyle,
              planId: formData.planId
            });
          }
        };

        $scope.fromClass = function(_class, formData) {
          if(!_.find($scope.planClasses, {accessTypeId: 3, co_generic_id: _class.id})) {
            $scope.planClasses.push({
              accessTypeId: 3,
              co_generic_id: _class.id,
              _class: _class,
              planId: formData.planId
            });
          }
        };

        $scope.submit = function (planClasses) {
          $http.post(consts.apiUrl + '/PlanClasses', planClasses)
            .then(function (response) {

              noty({type: 'success', text: 'PlanClasses saved'});
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

        $scope.classStyles = classStyles;
        $scope.studios = studios;
        $scope.classes = classes;
        $scope.planClasses = [];
        $scope.plans = plans;
        $scope.formData = {};
      }])
  ;
})(angular, noty);