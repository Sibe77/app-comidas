angular.module('app')
.controller('selectionController',['$scope',"$location",'fieldbookService', function($scope,$location,fieldbookService) {
	$scope.region;

	fieldbookService.getRegions(function(data){
		$scope.regions = data;
	});
}]);