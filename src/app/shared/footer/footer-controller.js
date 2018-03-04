angular.module('app')
.directive("footer", function(){
	return {
		templateUrl:'app/shared/footer/footer-view.html',
		controller:'footerController'
	}
})
.controller('footerController',['$scope','$log','$state', function($scope, $log, $state) {
	$scope.stateToReturnOnClose = '';
	var hideInterface = function() {
		var navBar = document.getElementById("searchBox");
		var closeIcon = document.getElementById("close-suggestions");
		navBar.style.display = "none";
		closeIcon.style.display = "none";
		navBar.className = "nav-up";
		$scope.showStores = false;
		$scope.showProducts = false;
	}

	$scope.goHome = function() {
		hideInterface();
		$state.go('selectedLocation.home');
	}

	$scope.close = function() {
		hideInterface();
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
		window.scrollTo(0, 0);
		var navBar = document.getElementById("searchBox");
		var navBarTextToReturnOnClose = document.getElementsByClassName("field")[0].value;
		var closeIcon = document.getElementById("close-suggestions");
		document.getElementsByClassName("field")[0].value = '';
		$scope.searchText = '';

		if ($state.current.name !== 'selectedLocation.stores' && $state.current.name !== 'selectedLocation.products') {
			$scope.stateToReturnOnClose = $state.current.name;
			var navBar = document.getElementById("searchBox");
			var closeIcon = document.getElementById("close-suggestions");
			navBar.style.display = "none";
			closeIcon.style.display = "none";
		}

		if ($scope.showStores) {
			$state.go('selectedLocation.stores');
			navBar.className = "nav-down";
			navBar.style.display = "flex";
			closeIcon.style.display = "block";
		}
		else if ($scope.showProducts) {
			$state.go('selectedLocation.products');
			navBar.className = "nav-down";
			navBar.style.display = "flex";
			closeIcon.style.display = "block";
		}
		else {
			document.getElementsByClassName("field")[0].value = navBarTextToReturnOnClose;
			delete $scope.searchText;
			$scope.close();
		}
	};

	$scope.doSearch = function(keywords, suggestionSearched) {
		suggestionSearched = suggestionSearched || true;
		delete $scope.searchText;
		$scope.showProducts = false;
		$scope.showStores = false;
		// Regex above is used to remove lead and trail whitespaces
		keywords = keywords.replace(/^[ ]+|[ ]+$/g,'')
		$scope.search(keywords, suggestionSearched);
		var navBar = document.getElementById("searchBox");
		var closeIcon = document.getElementById("close-suggestions");
		navBar.style.display = "none";
		closeIcon.style.display = "none";
	};
}]);