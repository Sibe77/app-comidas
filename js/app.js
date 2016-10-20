var myApp = angular.module('myApp',[]);

myApp.controller('appController', ['$scope', function($scope) {
	$scope.isMobile = window.innerWidth <= 800 ? true : false;
	$scope.isSearchBoxFocused; // Gotten from #searchterm text field on the view

	$scope.clientsShown;
	$scope.productsLoaded;
	$scope.clientsLoaded;
	$scope.hoursLoaded;

	$scope.noResults;

	$scope.search = function(filter) {
		var accentsTidyAndLowercase = function (text) {
		    var r = text.toLowerCase();
		    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
		    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
		    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
		    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
		    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
		    return r;
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
			var commonWords = ["de","la","que","el","en","y","a","los","del","las", "con"];

			var outputWords = [];
			_.each(searchedWords, function(searchedWord) {
				if (_.indexOf(commonWords, searchedWord) < 0) {
					searchedWord = pluralToSingular(searchedWord);
					outputWords.push(searchedWord);
				}
			});
			return outputWords;
		};

		var getMatches = function (searchedWords) {
			var matchesClient = function (cliente, searchedWords) {
				var clientWordsMatched = 0;
				var currentClientNumberOfWords = cliente.split(" ").length;
				var currentClient = accentsTidyAndLowercase(cliente);

				_.each(searchedWords, function (searchedWord) {
					var searchQuery = new RegExp("\\b"+searchedWord, "i");
					if (currentClient.search(searchQuery) != -1)
					{
						clientWordsMatched++;
					}
				});

				return (clientWordsMatched === currentClientNumberOfWords);
			}

			var matchesProduct = function (product, searchedWords) {
				var matchesAllProductWords = true;
				var currentProduct = accentsTidyAndLowercase(product.producto);

				_.each(searchedWords, function (searchedWord) {
					var searchQuery = new RegExp("\\b"+searchedWord, "i");

					if (currentProduct.search(searchQuery) == -1) {
						matchesAllProductWords = false;
					}
				});

				return matchesAllProductWords;
			}

			var mergeClientData = function (cliente, product, allHours, allClients) {
				var currentClient = _.find(allClients, ['id', product.cliente[0].id]);
				var hours = [];
				// Agregamos las horas al correspondiente cliente
				_.each(allHours, function (currentHours) {
					if (currentHours.cliente[0].cliente === cliente) {
						hours.push(currentHours);
					}
				});

				return {client: currentClient, matchedProducts: [], hours: hours};
			};

			var output = [];
			var clientList = [];

			_.each(allProducts, function (product) {
				var cliente = product.cliente[0].cliente;
				var productMatch = matchesProduct(product, searchedWords);
				if (cliente != undefined) {
					var clientMatch = matchesClient(cliente, searchedWords);

					if (productMatch || clientMatch) {
						// Si el cliente no existe todavía en la lista que estamos creando
						// Lo creamos y le asignamos sus productos (aquellos que matchean),
						// y le asignamos sus correspondientes horarios de apertura y cierre.
						if (!(cliente in clientList)) {
							clientList[cliente] = mergeClientData(cliente, product, allHours, allClients);
						}
				        clientList[cliente].matchedProducts.push(product);
					}
				}
			});

			for (client in clientList) {
				output.push(clientList[client]);
			}

			return output;
		};

		// -----------------//

		// Analytics
		ga('send', 'pageview', 'search?searchText=' + filter);

		document.getElementById('searchterm').blur();

		$scope.noResults = true;

		$scope.clientsShown = [];

		var searchedWords = getWordsToSearch(filter);

		$scope.clientsShown = getMatches(searchedWords);

		if ($scope.clientsShown.length > 0){
			$scope.noResults = false;
		}
	}

	$scope.logoPressed = function () {
		document.getElementById('searchterm').focus();
	}

	$scope.isStoreOpen = function (cliente) {
		var getDayOfWeek = function () {
			if (date.getDay() === 0) {
				return "Domingo";
			}
			else if (date.getDay() === 1) {
				return "Lunes";
			}
			else if (date.getDay() === 2) {
				return "Martes";
			}
			else if (date.getDay() === 3) {
				return "Miercoles";
			}
			else if (date.getDay() === 4) {
				return "Jueves";
			}
			else if (date.getDay() === 5) {
				return "Viernes";
			}
			else if (date.getDay() === 6) {
				return "Sabado";
			}
		};

		var checkTimeRange = function (startHour, startMinutes, endHour, endMinutes) {
			var checkForMinutes = function() {
				if (currentHour === startHour) {
					if (currentMinutes >= startMinutes) {
						return true;
					}
				} else if (currentHour === endHour) {
					if (currentMinutes < endMinutes) {
						return true;
					}
				} else {
					return true;
				}
			}

			if (startHour != null && endHour != null) {	
				if (endHour === startHour) {
					return true;
				} else if (endHour < startHour) {
					if (currentHour >= startHour || currentHour <= endHour)
					{
						if(checkForMinutes()) {
							return true;
						}
					}
				} else { // startHour < endHour
					if (currentHour >= startHour && currentHour <= endHour) {
						if(checkForMinutes()) {
							return true;
						}
					}
				}
			}

			return false;
		};

		//-------------- PRIVATE FUNCTIONS END ----------------//

		var date = new Date();
		var open = false;
		var currentHour = date.getHours();
		var currentMinutes = date.getMinutes();

		for (var horario in cliente.hours) {
			if (getDayOfWeek() === cliente.hours[horario].dia) {
				if (cliente.hours[horario].abre != undefined && cliente.hours[horario].cierra != undefined) {
					var openHour = Number(cliente.hours[horario].abre.split(":")[0]);
					var openMinutes = Number(cliente.hours[horario].abre.split(":")[1]);
					var closeHour = Number(cliente.hours[horario].cierra.split(":")[0]);
					var closeMinutes = Number(cliente.hours[horario].cierra.split(":")[1]);

					open = checkTimeRange(openHour, openMinutes, closeHour, closeMinutes);
				}

				if(!open && cliente.hours[horario].vuelveabrir != undefined && cliente.hours[horario].vuelvecerrar != undefined) {
					openHour = Number(cliente.hours[horario].vuelveabrir.split(":")[0]);
					openMinutes = Number(cliente.hours[horario].vuelveabrir.split(":")[1]);
					closeHour = Number(cliente.hours[horario].vuelvecerrar.split(":")[0]);
					closeMinutes = Number(cliente.hours[horario].vuelvecerrar.split(":")[1]);

					open = checkTimeRange(openHour, openMinutes, closeHour, closeMinutes);
				}
			}
		}

		return open;
	}

	// ------------------ End $scope --------------------- //

	var allProducts; // Gotten from getProductsFromService();
	var allClients; // Gotten from getClientsFromService();
	var allHours;  // Gotten from getHoursFromService();

	function init () {
		fieldBookServiceRequest();
	};

	function fieldBookServiceRequest () {
		var getProductsFromService = function () {
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
		};

		var getClientsFromService = function () {
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

		var getHoursFromService = function () {
			$.ajax({
				url: 'https://api.fieldbook.com/v1/57efcbd80cfca603001a8a2d/horarios',
				headers: {
					'Accept': 'application/json',
					'Authorization': 'Basic ' + btoa('key-1:PXr9ESuD_uMBnByvDtS3')
				},
				success: function (hoursData) {
					$scope.$apply(function(){
						allHours = hoursData;
						$scope.hoursLoaded = true;
					});
				},
				error: function (error) {
					console.log('error', error);
				}
			});
		};

		// ---------------- //

		getProductsFromService();
		getClientsFromService();
		getHoursFromService();
	}

	init();
}]);