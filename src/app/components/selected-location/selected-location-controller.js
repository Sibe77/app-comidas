angular.module('app')
.controller('selectedLocationController', ['$scope','$http','$stateParams', 'configurationService', 'fieldbookService', 'searchBarService','$state', function($scope, $http, $stateParams, configurationService, fieldbookService, searchBarService, $state) {
	$scope.location = $stateParams.ubicacion;
	$scope.locationInfo;
	$scope.fieldBookData = {};

	function init () {
		var getLocationInfo = function (location) {
			$scope.locationInfo = location;
			if (location.sugerencias != null) {
				location.sugerencias = location.sugerencias.split(',');
			}
		};

		fieldbookService.getRegions(function(data){
			for (reg in data) {
				if (data[reg].nombre === $scope.location) {
					getLocationInfo(data[reg]);
					fieldbookService.getAllData(data[reg], function(data){
						$scope.fieldBookData = data;
						$scope.loadComplete = true;
					});
				}
			}
		});
	};

	$scope.isMobile = (window.innerWidth <= 600 || window.innerHeight <= 500) ? true : false;
	$scope.loadComplete = false;
	$scope.clientsShown;
	$scope.noResults;

	// Footer
	$scope.showProducts = false;
	$scope.showStores = false;

	$scope.callPerformed = function(clientName) {
		_trackEvent('Llamadas', clientName, $scope.searchText);
	}

	$scope.locationConsulted = function(clientName) {
		_trackEvent('Ubicaciones', clientName, $scope.searchText);
	}

	$scope.logoPressed = function () {
		document.getElementById('searchterm').focus();
	}

	$scope.search = function(searchedText, callingFromSuggestions) {
		window.scrollTo(0, 0);
		document.getElementById('searchterm').blur();
		$scope.clientsShown = searchBarService.getMatches($scope.fieldBookData, searchedText, callingFromSuggestions);
		$scope.noResults = searchBarService.noResults($scope.clientsShown);
		$scope.searchText = searchedText;

		var navBar = document.getElementById("searchBox");
		var searchBox = document.getElementById("searchterm");
		searchBox.value = searchedText;
		navBar.style.display = "none";
		navBar.className = "nav-up";

		if ($scope.noResults) {
			if (configurationService.general.appType === 'web') {
				ga('send', 'pageview', 'search?searchText=' + searchedText.toLowerCase() + ' (Not Found)');
			} else if (configurationService.general.appType === 'mobile') {
				ga_storage._trackPageview('mobileSearch?searchText=' + searchedText.toLowerCase() + ' (Not Found)', 'No Results Mobile Search');
			}
			$state.go('selectedLocation.sinResultados');
		} else {
			if (configurationService.general.appType === 'web') {
				ga('send', 'pageview', 'search?searchText=' + searchedText.toLowerCase());
			} else if (configurationService.general.appType === 'mobile') {
				ga_storage._trackPageview('mobileSearch?searchText=' + searchedText.toLowerCase(), 'Mobile Search');
			}
			$state.go('selectedLocation.resultados');
		}
		if (configurationService.general.appType === 'mobile') {
			ga_storage._trackEvent('Busquedas', $scope.noResults ? 'Sin resultados' : 'Exitosas', searchedText.toLowerCase());
		}
	}

	init();
}]);