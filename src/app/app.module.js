angular.module('app',['ui.router'])
.config(["configurationServiceProvider",function(configurationServiceProvider){
	var config = {
		'general' : {
			'appType' : 'web'
		},
		'searchBarService' : {
			'productsRelated' : [
				//Used to retrieve results even if the user mispell the product name	
				['lomo','lomito'],
				['whiskey', 'whiski', 'wisky', 'whisky', 'wiskey', 'wiski'],
				['sandwich','sanguche','sanguich', 'baguette'],
				['cerveza', 'birra', 'cervesa'],
				['pizza', 'piza', 'pisa'],
				['muzzarella', 'muzarella', 'musarella', 'musarela']
			],
			'suggestionsRelated' : [
				// For suggestions
				['cafeteria','cafe','te','desayuno','merienda','mate cocido','submarino','coffee'],
				['carnes','bife','cordero','milanesa','bondiola','cabrito','entrecot'],
				['pescados','mariscos','salmon'],
				['postres','tortas'],
				['gastronomia internacional','chow','chop','mexicana:','mexicana','peru:','orientales','arabe']
			],
			'articles' : ["de","la","que","el","en","y","a","los","del","las","con"]
		},
		'fieldbookService' : {
			'locationsUrl' : "https://api.fieldbook.com/v1/5a3cef32657cf103002038a0/"
		}
	};

	configurationServiceProvider.config(config);
}])
.provider("configurationService",[function() {
	var configurations = {};
	this.config = function(data){
		configurations = data;
	};

	this.$get = function(){
		return configurations;
	}
}]);