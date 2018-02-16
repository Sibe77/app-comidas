angular.module('app')
.directive("storeCard", function(){
	return {
		templateUrl:'app/shared/store-card/store-card-view.html',
		controller:'storeCardController'
	}
})
.filter('removePositionNumber', function() {
    return function(input) {
    	var txt = input.split('.');
        return txt[1];
    };
})
.controller('storeCardController', ['$scope', function($scope){
	$scope.doSearch = function(keywords) {
		// Regex above is used lead and trail whitespaces
		keywords = keywords.replace(/^[ ]+|[ ]+$/g,'')
		$scope.search(keywords);
	};
	$scope.showProducts = [];
	$scope.toggleProductsDisplay = function(category) {
		$scope.showProducts[category] = !$scope.showProducts[category];
	}
}]);