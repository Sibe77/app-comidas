angular.module('app')
.factory("fieldbookService",['configurationService','$http',function(configurationService, $http){
	var configurations = configurationService.fieldbookService;

	var getAllRegions = function (callback) {
		url = configurations.locationsUrl + 'zonas';
		$http({url:url}).then(function success(response){
			callback(response.data);
		},function failure(response){
			$log.error('error loading products', response);
		});
	};

	// Buscador View
	var fieldbookData = {};

	var productsLoaded = false;
	var clientsLoaded = false;
	var hoursLoaded = false;
	var suggestionsLoaded = false;

	var allLoadsComplete = function () {
		if (productsLoaded === false || clientsLoaded === false || hoursLoaded === false || suggestionsLoaded === false) {
			return false;
		}
		return true;
	}
	var getProducts = function (region, callback) {
		url = region.url + 'productos';
		$http({url:url}).then(function success(response){
			callback(response.data);
		},function failure(response){
			$log.error('error loading products', response);
		});
	};
	var getClients = function (region, callback) {
		url = region.url + 'clientes';
		$http({url:url}).then(function success(response){
			callback(response.data);
		},function failure(response){
			$log.error('error loading clients', response);
		});
	};

	var service = {};

	service.getHours = function (region, callback) {
		url = region.url + 'horarios';
		$http({url:url}).then(function success(response){
			callback(response.data);
		},function failure(response){
			$log.error('error loading hours', response);
		});
	};

	service.getRegions = function (callback) {
		getAllRegions(function(data){
			callback(data);
		});
	}

	// Loads all the data from fieldbook and then returns to the controller a cb with all the info
	service.getAllData = function (region, callback) {
		getAllRegions(function(data){
			// Getting Suggestions
			for (reg in data) {
				if (data[reg].nombre === region.nombre) {
					if (data[reg].sugerenciasrelacionadas != null) {
						var sugRelated = data[reg].sugerenciasrelacionadas.split(';');
						for (sugerencia in sugRelated) {
							sugRelated[sugerencia] = sugRelated[sugerencia].split(',');
							for (relacionada in sugRelated[sugerencia]) {
								sugRelated[sugerencia][relacionada] = sugRelated[sugerencia][relacionada].trim();
							}
						}
						fieldbookData.suggestionsRelated = sugRelated;
					}

					if (data[reg].productosrelacionados != null) {
						var prodRelated = data[reg].productosrelacionados.split(';');
						for (sugerencia in prodRelated) {
							prodRelated[sugerencia] = prodRelated[sugerencia].split(',');
							for (relacionada in prodRelated[sugerencia]) {
								prodRelated[sugerencia][relacionada] = prodRelated[sugerencia][relacionada].trim().toLowerCase();
							}
						}
						fieldbookData.productsRelated = prodRelated;
					}
				}
			}

			suggestionsLoaded = true;
			if(allLoadsComplete()){callback(fieldbookData)}
		});
		getProducts(region, function(data){
			fieldbookData.allProducts = data;
			productsLoaded = true;
			if(allLoadsComplete()){callback(fieldbookData)}
		});
		getClients(region, function(data){
			fieldbookData.allClients = data;
			clientsLoaded = true;
			if(allLoadsComplete()){callback(fieldbookData)}
		});
		service.getHours(region, function(data){
			fieldbookData.allHours = data;
			hoursLoaded = true;
			if(allLoadsComplete()){callback(fieldbookData)}
		});
	};

	return service;
}]);