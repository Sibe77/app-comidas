angular.module('app')
.directive("footer", function(){
	return {
		templateUrl:'app/shared/footer/footer-view.html',
		controller:'footerController'
	}
})
.controller('footerController',['$scope','$log','$state', function($scope, $log, $state) {
	$scope.stateToReturnOnClose = '';

	$scope.close = function() {
		var navBar = document.getElementById("searchBox");
		navBar.style.display = "none";
		navBar.className = "nav-up";
		$scope.showStores = false;
		$scope.showProducts = false;

		$state.go($scope.stateToReturnOnClose);
	};

	$scope.select = function(selection) {
		if (selection === 'sugerencias') {
			$scope.showStores = false;
			$scope.showProducts = !$scope.showProducts;
		}
		else if (selection === 'locales') {
			$scope.showProducts = false;
			$scope.showStores = !$scope.showStores;
		}
		else {
			$log.warn('Invalid parameter for "select" function');
		}

		//Navigation
		var navBar = document.getElementById("searchBox");
		if ($state.current.name !== 'selectedLocation.stores' && $state.current.name !== 'selectedLocation.products') {
			$scope.stateToReturnOnClose = $state.current.name;
			var navBar = document.getElementById("searchBox");
			navBar.style.display = "none";
		}

		if ($scope.showStores) {
			$state.go('selectedLocation.stores');
			navBar.className = "nav-down";
			navBar.style.display = "flex";
		}
		else if ($scope.showProducts) {
			$state.go('selectedLocation.products');
			navBar.className = "nav-down";
			navBar.style.display = "flex";
		}
		else {
			$scope.close();
		}
	};

	$scope.doSearch = function(keywords) {
		$scope.showProducts = false;
		$scope.showStores = false;
		// Regex above is used to remove lead and trail whitespaces
		keywords = keywords.replace(/^[ ]+|[ ]+$/g,'')
		$scope.search(keywords, true);
		var navBar = document.getElementById("searchBox");
		navBar.style.display = "none";
	};
}]);