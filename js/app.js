var myApp = angular.module('myApp',[]);

myApp.controller('appController', ['$scope', function($scope) {
	var allProducts; // Gotten from getProductsFromService();
	var allClients; // Gotten from getClientsFromService();

	$scope.isMobile;
	$scope.clientsShown;
	$scope.noResults;
	$scope.productsLoaded;
	$scope.clientsLoaded;
	$scope.isSearchBoxFocused;

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
				$scope.$apply(function(){
					allProducts = productsData;
					$scope.productsLoaded = true;
				});
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
				$scope.$apply(function(){
					allClients = clientsData;
					$scope.clientsLoaded = true;
				});
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
		document.getElementById('searchterm').blur();

		$scope.noResults = true;

		$scope.clientsShown = [];

		var searchedWords = getWordsToSearch(filter);

		$scope.clientsShown = getClientAndProductMatches(searchedWords);

		if ($scope.clientsShown.length > 0){
			$scope.noResults = false;
		}
	}

	$scope.logoPressed = function () {
		document.getElementById('searchterm').focus();
	}

	$scope.searchFieldFocus = function () {
		$scope.isSearchBoxFocused = true;
	}

	$scope.searchFieldBlur = function () {
		// Analytics
		ga('send', 'pageview', 'search?searchText=' + this.value);
		$scope.isSearchBoxFocused = false;
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
				var word = searchedWords[searchedWord];
				// Here we remove the "s" letter at the end of the word so can match both plural and singular
					if (word.slice(-1) === "s") {
						word = word.slice(0,-1);
					}
				outputWords.push(word);
			}
		}

		return outputWords;
	}

	function getClientAndProductMatches (searchedWords) {
		var clientList = [];

		for (var product in allProducts) {
			var matchesAllProductWords = true;
			var clientWordsMatched = 0;

			var currentProduct = accentsTidyAndLowercase(allProducts[product].producto);

			if (allProducts[product].cliente[0].cliente != undefined) {
				var currentClient = accentsTidyAndLowercase(allProducts[product].cliente[0].cliente);
				var currentClientNumberOfWords = allProducts[product].cliente[0].cliente.split(" ").length;
			}

			for (var searchedWord in searchedWords) {
				var searchQuery = new RegExp("\\b"+searchedWords[searchedWord], "i");

				if (currentProduct.search(searchQuery) == -1) {
					matchesAllProductWords = false;
				}
				if (currentClient != undefined ) {
					if (currentClient.search(searchQuery) != -1)
					{
						clientWordsMatched++;
					}
				}
			}

			if (matchesAllProductWords || clientWordsMatched === currentClientNumberOfWords) {
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

	function accentsTidyAndLowercase(s) {
	    var r=s.toLowerCase();
	    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
	    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
	    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
	    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
	    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
	    return r;
	};

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