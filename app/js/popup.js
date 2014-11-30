'use strict';
/* global angular */
var app = angular.module('cors', ['ionic']);

app.controller('PopupCtrl', ['$scope', function($scope) {

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
  }, function(result) {
    $scope.active = result.active;
    $scope.urls = result.urls;
    $scope.exposedHeaders = result.exposedHeaders;
    $scope.$apply();

    $scope.$watch('active', function() {
      chrome.storage.local.set({
        'active': $scope.active
      });
      chrome.extension.getBackgroundPage().reload();
    });

    $scope.$watch('exposedHeaders', function() {
      chrome.storage.local.set({
        'exposedHeaders': $scope.exposedHeaders
      });
      chrome.extension.getBackgroundPage().reload();
    });

    $scope.$watch('urls', function() {
      chrome.storage.local.set({
        'urls': $scope.urls
      });
      chrome.extension.getBackgroundPage().reload();
    });
  });

  $scope.openInNewTab = function(url) {
    chrome.tabs.create({
      url: url
    });
  };

  $scope.addUrl = function() {
    if ($scope.url && angular.inArray($scope.url, $scope.urls) === -1) {
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

app.directive('submitOnEnter', function() {
  return {
    restrict: 'A',
    link: function(scope, element) {
      angular.element(element).on('keydown', function(e) {
        if (e.keyCode === 13) {
          angular.element(element).parent().parent().find('.submit-action').click();
        }
      });
    }
  };
});
