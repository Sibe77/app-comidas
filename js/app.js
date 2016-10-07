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

	$scope.goToHome = function() {
		// TBD
	}

	$scope.filter = function(filter) {
		$scope.productos = [];

		var searchedWords = getWordsToSearch(filter);

		$scope.productos = getProductMatches(searchedWords);
	}

	function getWordsToSearch(searchedText) {
		var outputWords = [];

		// Here we write those words that we need to ignore when performing the search
		var commonWords = ["a","de"];

		var searchedWords = searchedText.split(" ");

		for (var searchedWord in searchedWords) {
			var isCommonWord = false;
			for (var commonWord in commonWords) {
				if (searchedWords[searchedWord] == commonWords[commonWord]) {
					isCommonWord = true;
				}
			}

			if (!isCommonWord) {
				outputWords.push(searchedWords[searchedWord]);
			}
		}

		return outputWords;
	}

	function getProductMatches (searchedWords) {
		var matches = [];

		for (var product in allProducts) {
			var matchesAllProductWords = true;
			var matchesAllClientWords = true;

			for (var searchedWord in searchedWords) {
				var searchQuery = new RegExp(searchedWords[searchedWord], "i");
				if (allProducts[product].producto.search(searchQuery) == -1) {
					matchesAllProductWords = false;
				}
			}

			if (matchesAllProductWords) {
				matches.push(allProducts[product]);
			}
		}

		return matches;
	}

	init();
}]);