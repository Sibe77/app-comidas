var myApp = angular.module('myApp',[]);

myApp.controller('appController', ['$scope', function($scope) {
	var allProducts;
	$scope.productos;

	function init () {
		$.ajax({
			url: 'https://api.fieldbook.com/v1/57efcbd80cfca603001a8a2d/productos',
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa('key-1:PXr9ESuD_uMBnByvDtS3')
			},
			success: function (productsData) {
				allProducts = productsData;
				getClientsFromService();
			},
			error: function (error) {
				console.log('error', error);
			}
		});
	}

	function getClientsFromService() {
		$.ajax({
			url: 'https://api.fieldbook.com/v1/57efcbd80cfca603001a8a2d/clientes',
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa('key-1:PXr9ESuD_uMBnByvDtS3')
			},
			success: function (clientsData) {
				mergeClients(clientsData, allProducts);
			},
			error: function (error) {
				console.log('error', error);
			}
		});
	};

	function mergeClients(clients, products)
	{
		for (var product in products) {
			var productClientID = products[product].cliente[0].id;
			for (var client in clients) {
				if (clients[client].id === productClientID) {
					products[product].cliente = clients[client];
				}
			}
		}
	}

	$scope.filter = function(filter) {
		$scope.productos = [];
		var matches = [];

		for (var product in allProducts) {
			var searchQuery = new RegExp(filter, "i");
			if (allProducts[product].producto.search(searchQuery) >= 0) {
				matches.push(allProducts[product]);
				console.log("match");
			}
		}

		console.log("matches", matches);
		$scope.productos = matches;
	}

	init();
}]);