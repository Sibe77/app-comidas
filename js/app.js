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
		var accentsTidyAndLowercase = function (s) {
		    var r=s.toLowerCase();
		    r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
		    r = r.replace(new RegExp("[èéêë]", 'g'),"e");
		    r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
		    r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
		    r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
		    return r;
		};

		var getWordsToSearch = function (searchedText) {
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
		};

		var getClientAndProductMatches = function (searchedWords) {
			var getClient = function (clientID) {
				for (var client in allClients) {
					if (allClients[client].id === clientID) {
						return allClients[client];
					}
				}
			};

			// ------------------- //
			
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
					// Si el cliente no existe todavía en la lista que estamos creando
					// Lo creamos y le asignamos sus productos (aquellos que matchean),
					// y le asignamos sus correspondientes horarios de apertura y cierre.
					if (!(allProducts[product].cliente[0].cliente in clientList)) {
						var currentClient = getClient(allProducts[product].cliente[0].id);
						var hours = [];
						// Agregamos las horas al correspondiente cliente
						for (var hour in allHours) {
							if (allHours[hour].cliente[0].cliente === allProducts[product].cliente[0].cliente) {
								hours.push(allHours[hour]);
							}
						}

						clientList[allProducts[product].cliente[0].cliente] = {client: currentClient, matchedProducts: [], hours: hours};
					}

			        clientList[allProducts[product].cliente[0].cliente].matchedProducts.push(allProducts[product]);
				}
			}

			var output = [];

			for (var client in clientList) {
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

		$scope.clientsShown = getClientAndProductMatches(searchedWords);

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