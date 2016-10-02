var myApp = angular.module('myApp',[]);

myApp.controller('appController', ['$scope', function($scope) {
	$scope.productos;
	var clientes;

	$.ajax({
	  url: 'https://api.fieldbook.com/v1/57efcbd80cfca603001a8a2d/productos',
	  headers: {
	    'Accept': 'application/json',
	    'Authorization': 'Basic ' + btoa('key-1:PXr9ESuD_uMBnByvDtS3')
	  },
	  success: function (data) {
	    $scope.productos = data;
	  },
	  error: function (error) {
	    console.log('error', error);
	  }
	});

	$.ajax({
	  url: 'https://api.fieldbook.com/v1/57efcbd80cfca603001a8a2d/clientes',
	  headers: {
	    'Accept': 'application/json',
	    'Authorization': 'Basic ' + btoa('key-1:PXr9ESuD_uMBnByvDtS3')
	  },
	  success: function (data) {
	    clientes = data;
	  },
	  error: function (error) {
	    console.log('error', error);
	  }
	});

}]);