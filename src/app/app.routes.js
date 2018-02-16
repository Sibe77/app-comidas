angular.module('app')
.config(["$stateProvider",function($stateProvider){
    $stateProvider
    .state('locationSelection',{
        redirectTo : "selectedLocation.home",
        // FOR LOCATION SELECTION FEATURE
        url : "/",
        //templateUrl : "app/components/location-selection/location-selection-view.html",
        //controller : "selectionController"
    })
    .state('selectedLocation',{
        url : "/:ubicacion",
        templateUrl : "app/components/selected-location/selected-location-view.html",
        controller : "selectedLocationController",
        // Default param until select location feature is live
        params: {ubicacion: 'Rio Tercero'}
    })
        .state('selectedLocation.home',{
            url : "/home",
            templateUrl : 'app/components/home/home-view.html',
            controller : 'homeController'
        })
        .state('selectedLocation.resultados',{
            url : "/resultados",
            templateUrl : 'app/components/results/results-view.html',
            controller : 'resultsController'
        })
        .state('selectedLocation.sinResultados',{
            url : "/sin-resultados",
            templateUrl : 'app/components/no-results/no-results-view.html',
            controller : 'noResultsController'
        })
        .state('selectedLocation.products',{
            url : "/productos",
            templateUrl : 'app/components/product-suggestions/product-suggestions-view.html'
        })
        .state('selectedLocation.stores',{
            url : "/cartas",
            templateUrl : 'app/components/store-suggestions/store-suggestions-view.html'
        })
    .state('otherwise',{
        url : '*path',
        redirectTo : "locationSelection"
    });
}]);