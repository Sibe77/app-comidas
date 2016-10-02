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
	    mergeClients(data);
	  },
	  error: function (error) {
	    console.log('error', error);
	  }
	});

	function mergeClients(clients)
	{
		for (var product in $scope.productos) {
			var productClientID = $scope.productos[product].cliente[0].id;
			for (var client in clients) {
				if (clients[client].id === productClientID) {
					$scope.productos[product].cliente = clients[client];
				}
			}
		}
	}
}]);