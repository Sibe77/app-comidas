angular.module('app')
.factory("closedSignService",[function(){
	var open = false;

    var date = new Date();
    var currentHour = date.getHours();
    var currentMinutes = date.getMinutes();

    var nextOpenTime;


	var dayOfWeek = function(){
		//Returns the day of week writen in spanish. ie:"Lunes"
		var dayNumber = new Date().getDay();
		var days = ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];
		return days[dayNumber];
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

	var getNextOpenTime = function (open1, open2, currTime) {
		if (open2 == undefined) {
		return open1;
		} else {
		var biggestTime;
		var smallestTime;
		var biggestHour;
		var smallestHour;

		if (open1)
			open1hour = Number(open1.split(":")[0]);
		if (open2)
			open2hour = Number(open2.split(":")[0]);

		if (open1hour > open2hour) {
		  biggestHour = open1hour;
		  biggestTime = open1;
		  smallestHour = open2hour;
		  smallestTime = open2;
		} else {
		  biggestHour = open2hour;
		  biggestTime = open2;
		  smallestHour = open1hour;
		  smallestTime = open1;
		}

		if (currTime < smallestHour)
		  return smallestTime;
		if (currTime < biggestHour)
		  return biggestTime;
		if (currTime > biggestHour)
		  return smallestTime;
		}
	};

	var service = {};
	service.getData = function (cliente) {
		// Returns an object with information about it's open/closed times
		// return {isOpen: boolean, openTime: string | null, openHour: string | null};

	    for (var horario in cliente.hours) {
	      if (dayOfWeek() === cliente.hours[horario].dia) {
	      	var open = false;
	        if (cliente.hours[horario].abre != undefined && cliente.hours[horario].cierra != undefined) {
	          var openHour = Number(cliente.hours[horario].abre.split(":")[0]);
	          var openMinutes = Number(cliente.hours[horario].abre.split(":")[1]);
	          var closeHour = Number(cliente.hours[horario].cierra.split(":")[0]);
	          var closeMinutes = Number(cliente.hours[horario].cierra.split(":")[1]);

	          open = checkTimeRange(openHour, openMinutes, closeHour, closeMinutes);
	        }

	        if(cliente.hours[horario].vuelveabrir != undefined && cliente.hours[horario].vuelvecerrar != undefined) {
	          openHour = Number(cliente.hours[horario].vuelveabrir.split(":")[0]);
	          openMinutes = Number(cliente.hours[horario].vuelveabrir.split(":")[1]);
	          closeHour = Number(cliente.hours[horario].vuelvecerrar.split(":")[0]);
	          closeMinutes = Number(cliente.hours[horario].vuelvecerrar.split(":")[1]);
	          if (!open) { // If first openHours returned false for open
	            open = checkTimeRange(openHour, openMinutes, closeHour, closeMinutes);
	          }
	        }

	        nextOpenTime = getNextOpenTime(cliente.hours[horario].abre, cliente.hours[horario].vuelveabrir, currentHour);
	        nextOpenHour = nextOpenTime ? nextOpenTime.split(":")[0] : 0;
	      }
	    }
	    return {isOpen: open, openTime: nextOpenTime, openHour: nextOpenHour};
  	}
  	return service;
}]);