var app = angular.module('cors', ['ionic']);

app.controller('PopupCtrl', ['$scope', function($scope) {

	$scope.active = false;
	$scope.urls = [];
	$scope.url = '';

	chrome.storage.local.get({'active': false, 'urls': []}, function(result) {
		$scope.active = result.active;
		$scope.urls = result.urls;
		$scope.$apply();
	});

	$scope.$watch('active', function(newValue, oldValue) {
		chrome.storage.local.set({'active': $scope.active});
		chrome.extension.getBackgroundPage().reload();
	});

	$scope.openInNewTab = function(url) {
		chrome.tabs.create({ url: url });
	}

	$scope.addUrl = function() {
		if($scope.url && $.inArray($scope.url, $scope.urls) == -1) {
			$scope.urls.unshift($scope.url);
			chrome.storage.local.set({'urls': $scope.urls});
			chrome.extension.getBackgroundPage().reload();
		}
		$scope.url = '';
	};

	$scope.removeUrl = function(index) {
		$scope.urls.splice(index, 1);
		chrome.storage.local.set({'urls': $scope.urls});
		chrome.extension.getBackgroundPage().reload();
	};

	$('#input').on('keydown', function(e) {
		if (e.which == 13) {
			$('#add-button').trigger('click');
		}
	});
}]);