'use strict';
/* global angular */
var app = angular.module('cors', ['ionic']);

app.controller('PopupCtrl', ['$scope', function ($scope) {
  var $backgroundPage = chrome.extension.getBackgroundPage();

  $scope.active = false;
  $scope.urls = [];
  $scope.url = '';
  $scope.exposedHeaders = '';
  $scope.i18n = {
    settings: chrome.i18n.getMessage('settings'),
    allowHeaders: chrome.i18n.getMessage('allowHeaders'),
    urlPatterns: chrome.i18n.getMessage('urlPatterns'),
    sharingHeader: chrome.i18n.getMessage('sharingHeader')
  };

  chrome.storage.local.get({
    'active': $scope.active,
    'urls': [],
    'exposedHeaders': ''
  }, function (result) {
    console.info('result', result);
    $scope.active = result.active;
    $scope.urls = result.urls;
    $scope.exposedHeaders = result.exposedHeaders;
    $scope.$apply();

    $scope.$watch('active', function () {
      console.info('active', arguments, this);
      chrome.storage.local.set({
        'active': $scope.active
      });
      $backgroundPage.reload();
    });

    $scope.$watch('exposedHeaders', function () {
      console.info('exposedHeaders', arguments, this);
      chrome.storage.local.set({
        'exposedHeaders': $scope.exposedHeaders
      });
      $backgroundPage.reload();
    });

    $scope.$watch('urls', function () {
      console.info('watch urls ',arguments, this);
      chrome.storage.local.set({
        'urls': $scope.urls
      });
      $backgroundPage.reload();
    }, true);
  });

  $scope.openInNewTab = function(url) {
    chrome.tabs.create({
      url: url
    });
  };

  $scope.addUrl = function() {
    if ($scope.url && $scope.urls.indexOf($scope.url) === -1) {
      $scope.urls.unshift($scope.url);
    }
    $scope.url = '';
  };

  $scope.removeUrl = function(index) {
    $scope.urls.splice(index, 1);
  };
}]);

app.directive('textOption', function() {
  return {
    restrict: 'E',
    scope: {
      option: '=',
      placeholder: '@'
    },
    templateUrl: '../components/text-option.html',
    controller: function($scope) {
      $scope.editing = false;

      $scope.onEdit = function() {
        $scope.editableOption = $scope.option;
        $scope.editing = true;
      };

      $scope.onCancel = function() {
        $scope.editing = false;
      };

      $scope.onSave = function() {
        $scope.option = $scope.editableOption;
        $scope.editing = false;
      };
    }
  };
});

app.directive('submitOnEnter', function () {
  return {
    restrict: 'A',
    scope: {
      methodName: '&submitOnEnter'
    },
    link: function (scope, element) {
      angular.element(element).on('keydown', function (e) {
        if (e.keyCode === 13) {
          scope.methodName();
          scope.$apply();
        }
      });
    }
  };
});
