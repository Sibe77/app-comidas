var myApp = angular.module('myApp',[]);

myApp.controller('appController', ['$scope', function($scope) {
	var allProducts; // Gotten from getProductsFromService();
	var allClients; // Gotten from getClientsFromService();

	$scope.isMobile;
	$scope.clientsShown;

	function init () {
		$scope.isMobile = checkIfItIsMobile();
		getProductsFromService();
		getClientsFromService();
	}

	function checkIfItIsMobile() {
	   if(window.innerWidth <= 800) {
	     return true;
	   } else {
	     return false;
	   }
	}

	function getProductsFromService () {
		$.ajax({
			url: 'https://api.fieldbook.com/v1/57efcbd80cfca603001a8a2d/productos',
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic ' + btoa('key-1:PXr9ESuD_uMBnByvDtS3')
			},
			success: function (productsData) {
				allProducts = productsData;
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
				allClients = clientsData;
			},
			error: function (error) {
				console.log('error', error);
			}
		});
	};

	$scope.goToHome = function() {
		// TBD
	}

	$scope.filter = function(filter) {
		$scope.clientsShown = [];

		var searchedWords = getWordsToSearch(filter);

		$scope.clientsShown = getClientMatches(searchedWords);
		console.log($scope.clientsShown);
		console.log($scope.clientsShown.length);
	}

	function getWordsToSearch(searchedText) {
		var outputWords = [];

		// Here we remove the accents.
        searchedText = accentsTidyAndLowercase(searchedText);
		// Here we write those words that we need to ignore when performing the search
		var commonWords = ["de","la","que","el","en","y","a","los","del","las"];

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

	function accentsTidyAndLowercase(s) {
	    var r=s.toLowerCase();
	    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
	    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
	    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
	    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
	    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
	    return r;
	};

	function getClientMatches (searchedWords) {
		var clientList = [];

		for (var product in allProducts) {
			var matchesAllProductWords = true;
			var matchesAllClientWords = true;

			for (var searchedWord in searchedWords) {
				var searchQuery = new RegExp("\\b"+searchedWords[searchedWord], "i");
				if (allProducts[product].producto.search(searchQuery) == -1) {
					matchesAllProductWords = false;
				}
			}

			if (matchesAllProductWords) {
				if (!(allProducts[product].cliente[0].cliente in clientList)) {
					var currentClient = getClient(allProducts[product].cliente[0].id);
					clientList[allProducts[product].cliente[0].cliente] = {client: currentClient, matchedProducts: []};
				}

		        clientList[allProducts[product].cliente[0].cliente].matchedProducts.push(allProducts[product]);
			}
		}

		var output = [];

		for (var client in clientList) {
			output.push(clientList[client]);
		}

		return output;
	}

	function getClient(clientID)
	{
		for (var client in allClients) {
			if (allClients[client].id === clientID) {
				return allClients[client];
			}
		}
	}

	init();
}]);