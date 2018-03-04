angular.module('app')
.factory("searchBarService",["configurationService","closedSignService",function(configurationService, closedSignService){
	var configurations = configurationService.searchBarService;
	var fbData = {};

	var getRelatedProducts = function (product, callingFromSuggestions) {
		if (callingFromSuggestions) {
			var relatedProducts = fbData.suggestionsRelated;
		} else {
			var relatedProducts = fbData.productsRelated;
		}
		// Return array
		var productWords = product.split(' ');
		var related = '';
		_.each(productWords, function (productWord) {
			_.each(relatedProducts, function (relatedProductsGroup) {
				var matchWordInGroup = false;
				_.each(relatedProductsGroup, function (relatedWord) {
					if (productWord === relatedWord) {
						matchWordInGroup = true;
						_.each(relatedProductsGroup, function (wordToInclude) {
							related += (' '+wordToInclude);
						});
					}
				});
			});
		});
		return related;
	};
	var getWordsToSearch = function (searchedText) {
		var pluralToSingular = function(word) {
			if (word.slice(-1) === "s") {
				word = word.slice(0,-1);
			}
			return word;
		};

		searchedText = accentsTidyAndLowercase(searchedText);
		var searchedWords = searchedText.split(" ");
		var commonWords = configurations.articles;

		var outputWords = [];
		_.each(searchedWords, function(searchedWord) {
			if (_.indexOf(commonWords, searchedWord) < 0) {
				searchedWord = pluralToSingular(searchedWord);
				outputWords.push(searchedWord);
			}
		});
		return outputWords;
	};

	var accentsTidyAndLowercase = function (text) {
		var r = text.toLowerCase();
		var r = _.deburr(r); // removing accents
		return r;
	};

	var matchesClient = function (cliente, searchedWords) {
		var match;

		if(cliente === searchedWords){
			match = true;
		}

		return (match);
	}

	var matchesProduct = function (product, searchedWords, callingFromSuggestions) {
		var matchesAllProductWords = true;
		var currentProduct = accentsTidyAndLowercase(product.producto);
		if (product.categoria[0]) {
			var category = product.categoria[0].nombre;
			currentProduct += category;
		}
		if (getRelatedProducts(currentProduct, callingFromSuggestions) != undefined) {
			currentProduct += ' ' + getRelatedProducts(currentProduct, callingFromSuggestions);
		}

		_.each(searchedWords, function (searchedWord) {
			var searchQuery = new RegExp("\\b"+searchedWord, "i");

			if (currentProduct.search(searchQuery) == -1) {
				matchesAllProductWords = false;
			}
		});

		return matchesAllProductWords;
	}

	var mergeClientData = function (cliente, product, fieldBookData) {
		var currentClient = _.find(fieldBookData.allClients, ['id', product.cliente[0].id]);
		var hours = [];
		// Agregamos las horas al correspondiente cliente
		_.each(fieldBookData.allHours, function (currentHours) {
			if (currentHours.cliente[0] && currentHours.cliente[0].cliente === cliente) {
				hours.push(currentHours);
			}
		});

		return {client: currentClient, matchedProducts: [], hours: hours};
	};

	var splitOpenClosedMatches = function (matches) {
		var allMatchesSplitted = _.groupBy(matches,
			function (local) {
				if (local.openData.isOpen === true) {
					return "open";
				} else if (local.openData.openTime != undefined) {
					return "openLater";
				} else {
					return "closed";
				}
			}
		);

		// Aleatory sorting for open stores
		allMatchesSplitted.open = _.shuffle(allMatchesSplitted.open);

		allMatchesSplitted.openLater = _.sortBy(allMatchesSplitted.openLater, [
			function (local) {
				return local.openData.openTime;
			}
		]);
		return allMatchesSplitted;
	}

	var service = {};

	service.noResults = function (clientsAfterSearch) {
		var open = clientsAfterSearch.open != undefined && clientsAfterSearch.open.length > 0;
		var openLater = clientsAfterSearch.openLater != undefined && clientsAfterSearch.openLater.length > 0;
		var closed = clientsAfterSearch.closed != undefined && clientsAfterSearch.closed.length > 0;

		if (open || openLater || closed) {
			return false;
		} else {
			return true;
		}
	};

	service.getMatches = function (fieldBookData, search, callingFromSuggestions) {
		fbData = fieldBookData;
		var searchedWords = getWordsToSearch(search);
		var output = [];
		var clientList = [];
		_.each(fieldBookData.allProducts, function (product) {
			var cliente = product.cliente[0].cliente;
			var productMatch = matchesProduct(product, searchedWords, callingFromSuggestions);
			if (cliente != undefined) {
				var clientMatch = matchesClient(cliente, search);

				if (productMatch || clientMatch) {
					// Si el cliente no existe todavía en la lista que estamos creando
					// Lo creamos y le asignamos sus productos (aquellos que matchean),
					// y le asignamos sus correspondientes horarios de apertura y cierre.
					if (!(cliente in clientList)) {
						clientList[cliente] = mergeClientData(cliente, product, fieldBookData);
						clientList[cliente].openData = closedSignService.getData(clientList[cliente]);
					}
					clientList[cliente].matchedProducts.push(product);
				}
			}
		});

		// We sort alphabetically the product names for each matched client
		for (client in clientList) {
			clientList[client].matchedProducts = _.sortBy(clientList[client].matchedProducts, [
				function (product) {
					return product.producto;
				}
			]);

			output.push(clientList[client]);
		}
		// We organize them in open/openLater/closed categories
		return splitOpenClosedMatches(output);
	};

	return service;
}]); 