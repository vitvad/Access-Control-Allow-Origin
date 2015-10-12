var app = angular.module('cors', ['ionic']);

app.controller('PopupCtrl', ['$scope', function($scope) {

	$scope.active = false;
	$scope.urls = [];
	$scope.url = '';
	$scope.exposedHeaders = '';

	chrome.storage.local.get({'active': false, 'urls': [], 'exposedHeaders': ''}, function(result) {
		$scope.active = result.active;
		$scope.urls = result.urls;
		$scope.exposedHeaders = result.exposedHeaders;
		$scope.$apply();

		$scope.$watch('active', function(newValue, oldValue) {
			chrome.storage.local.set({'active': $scope.active});
			chrome.extension.getBackgroundPage().reload();
		});

		$scope.$watch('exposedHeaders', function(newValue, oldValue) {
			chrome.storage.local.set({'exposedHeaders': $scope.exposedHeaders});
			chrome.extension.getBackgroundPage().reload();
		});

		$scope.$watch('urls', function(newValue, oldValue) {
			chrome.storage.local.set({'urls': $scope.urls});
			chrome.extension.getBackgroundPage().reload();
		});
	});

	$scope.openInNewTab = function(url) {
		chrome.tabs.create({ url: url });
	};

	$scope.addUrl = function() {
		if($scope.url && $.inArray($scope.url, $scope.urls) == -1) {
			$scope.urls.unshift($scope.url);
		}
		$scope.url = '';
	};

	$scope.removeUrl = function(index) {
		$scope.urls.splice(index, 1);
	};
}]);

app.directive("textOption", function() {
	return {
		restrict: 'E',
		scope: {
			option: '=',
			placeholder: '@'
		},
		templateUrl: 'text-option.html',
		controller : function($scope) {
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
		link: function(scope, element, attrs) {
			$(element).on('keydown', function(e) {
				if (e.which == 13) {
					$(element).parents('.item').find('.submit-action').trigger('click');
				}
			});
		}
	};
});
