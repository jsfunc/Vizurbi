debug_mode = true;
activeRouteColor =  "#4f8598";// "#009933";
inactiveRouteColor = "#a9c5d0";
activeRouteCheckColor = "#FF9100"; //"#4f8598"; //FFA200";
inactiveRouteCheckColor = "#a9c5d0";


function desactivateUnlinkedStops(){ // � revoir!
	for(var i=0; i<stops.length; i++){
		if (stops[i].subRoutes.length==0){
			stops[i].isActive = false;
			if (stops[i].circle) stops[i].circle.setStyle({opacity: 0, fillOpacity:0}); // � revoir tout particuli�rement !
		}
	}
}

function disactivateRoute(routeId){
	isActiveRoute[routeId] = false;
	activeRouteSpans[routeId].css({"background-color":inactiveRouteCheckColor});
	for (var i in routes[routeId].subRoutes){ // i is an array of StopIds:  for (var i=0; i<routes[routeId].subRoutes.length; i++){ ???
		shapes[subRoutes[routes[routeId].subRoutes[i]].shapeId].polyline.setStyle({"color": inactiveRouteColor});
	}
}

function activateRoute(routeId){
	isActiveRoute[routeId] = true;
	activeRouteSpans[routeId].css({"background-color":activeRouteCheckColor});
	for (var i in routes[routeId].subRoutes){ // i is an array of StopIds:  for (var i=0; i<routes[routeId].subRoutes.length; i++){ ???
		//subRoutes[routes[routeId].subRoutes[i]].shape.polyline.setStyle({"color": activeRouteColor, "maxHeight":400, "maxWidth":400});
		shapes[subRoutes[routes[routeId].subRoutes[i]].shapeId].polyline.setStyle({"color": activeRouteColor});
	}
}


function toggleRouteActivity(routeId){
	isActiveRoute[routeId]?disactivateRoute(routeId):activateRoute(routeId);
	computeShortestPath();
	drawAccessible();
}

function disactivateAllLines(){ // change Lines->Routes and php accordingly!
	for (var i=0; i<routes.length; i++) disactivateRoute(i);
	computeShortestPath();
	drawAccessible();
}

function activateAllLines(){ // change Lines->Routes and php accordingly!
	for (var i=0; i<routes.length; i++) activateRoute(i);
	computeShortestPath();
	drawAccessible();
}

function disactivateBusLines(){ 
	for (var i=0; i<routes.length; i++)  if (routes[i].type==3) disactivateRoute(i);
	computeShortestPath();
	drawAccessible();
}


function activateBusLines(){ 
	for (var i=0; i<routes.length; i++) if (routes[i].type==3) activateRoute(i);
	computeShortestPath();
	drawAccessible();
}


function disactivateSubwayLines(){ 
	for (var i=0; i<routes.length; i++)  if (routes[i].type==1) disactivateRoute(i);
	computeShortestPath();
	drawAccessible();
}


function activateSubwayLines(){ 
	for (var i=0; i<routes.length; i++) if (routes[i].type==1) activateRoute(i);
	computeShortestPath();
	drawAccessible();
}

function disactivateTramwayLines(){ 
	for (var i=0; i<routes.length; i++)  if (routes[i].type==0) disactivateRoute(i);
	computeShortestPath();
	drawAccessible();
}


function activateTramwayLines(){ 
	for (var i=0; i<routes.length; i++) if (routes[i].type==0) activateRoute(i);
	computeShortestPath();
	drawAccessible();
}


//Simple <-> Advanced mode 
var basicMode = true;

function toggleAdvancedMode(){
	if (debug_mode) console.log("In toggleAdvancedMode()");

	var button = document.getElementById("advancedbutton");
	var advancedButtons = document.getElementById("buttonsadv");
	var advancedControl = document.getElementById("controladv");
	if (!basicMode) {
		setCookie("mode", "basic");
		if (debug_mode) console.log("advancedMode off");

		button.innerHTML = "Vers mode avancé";
		advancedButtons.style.display="none";
		advancedControl.style.display="none";
		basicMode = true;
	}
	else {
		setCookie("mode", "advanced");
		if (debug_mode) console.log("advancedMode on");

		button.innerHTML = "Vers mode simple";
		advancedButtons.style.display="inline";
		advancedControl.style.display="inline";
		basicMode = false;
	}

}


//Vehicle Movie
var continueVehicleMovie = true;
var vehicleMovieOn = false;

function toggleVehicleMovie(){
	var button = document.getElementById("vehicleMovie") ;
	if (vehicleMovieOn){        	
		button.innerHTML = "Le ballet des bus" ; 
		continueVehicleMovie=false;
	}
	else{
		button.innerHTML = "Arr&ecirc;ter le ballet" ; 
		continueVehicleMovie = true;
		vehicleMovie();
	}	
}

//Day Movie
filmOn=0;

function toggleDayMovie()
{
	var aide = document.getElementById("vid") ;
	if (filmOn==0){        	
		aide.innerHTML = "Arr&ecirc;ter l'animation" ; 
		dayMovie();
		filmOn=1;
	}
	else {
		aide.innerHTML = "Au fil de la journ&eacute;e" ; 
		continueDayMovie=false;
		filmOn=0;
	}

}


//Reset stops coloration 
function reset(){
	if (debug_mode) var startTime = performance.now();	
	for(var i=0; i<stops.length; i++) 
		stops[i].circle.setStyle({fillColor:inactiveNodeColor, fillOpacity:0.5}); 


	if (debug_mode) console.log("Reset: "+(performance.now()-startTime));

}


function dayMovie(){
	continueDayMovie = true;
	var oldStartHour = startHour;
	var dt = 1/60; // toutes les minutes	
	function iter(){
		startHour += dt;
		//	$('#slider-hour-vertical').slider("value", startHour);
		$( "#startHour" ).val(real2hour(startHour));
		computeShortestPath();
		drawAccessible();			
		if (startHour<25 && continueDayMovie) setTimeout(iter, sleepDelay); 
		else $('#slider-hour-vertical').slider("value", startHour);
	}
	iter();
	startHour = oldStartHour;
	computeShortestPath();
	drawAccessible();		
}


function affVehicles(subRoute, hour){
	for (var j=0; j<subRoute.serviceIds.length; j++){
		if (isOn(services[subRoute.serviceIds[j]], date) && subRoute.timeTable[j][0]<hour) {
			if (isFinite(subRoute.frequencies[j].freq)){
				var tripLength = subRoute.timeTable[j][subRoute.timeTable[j].length-1]-subRoute.timeTable[j][0];
				if (hour<subRoute.frequencies[j].endTime+tripLength){
					for (var delta = 0; (subRoute.timeTable[j][0]+delta<=subRoute.frequencies[j].endTime+1/3600) && (subRoute.timeTable[j][0]+delta<hour); delta += subRoute.frequencies[j].freq){
						var knext = 1;
						for (; knext<subRoute.stops.length; ++knext) if (subRoute.timeTable[j][knext] + delta > hour) break;
						if (knext<subRoute.stops.length){ 
							var kprev = knext - 1;
							while (subRoute.timeTable[j][kprev-1] == subRoute.timeTable[j][kprev]) --kprev; // CONTESTABLE MAIS PLUS SMOOTH si le bus doit passer à la même heure à deux arrêts
							var a = stops[subRoute.stops[kprev]].subRoutes[subRoute.id].posInShape;
							var b = stops[subRoute.stops[knext]].subRoutes[subRoute.id].posInShape;
							var p = shapes[subRoute.shapeId].stops[a];
							if (b>a){  // on n'est jamais trop prudent...
								//mettre un petit temps d'attente à chaque arrêt ?
								var dt = (subRoute.timeTable[j][knext]-subRoute.timeTable[j][kprev]);
								var i= a + Math.floor((b-a)* (hour-(subRoute.timeTable[j][kprev]+delta)) / dt);
								var ti = subRoute.timeTable[j][kprev] + delta + (i-a) / (b-a) * dt;
								p = interpolatePoint(shapes[subRoute.shapeId].stops[i], shapes[subRoute.shapeId].stops[i+1], (hour-ti)/dt*(b-a));
							}
							vehicles.addLayer(L.circleMarker(p, {color:"black", opacity:1, "radius":4, "stroke": false, "fillOpacity":1, clickable:false}));	
						}
					}
				}
			}
			else{
				var knext = 1;
				for (; knext<subRoute.stops.length; ++knext) if (subRoute.timeTable[j][knext]>hour) break;
				if (knext<subRoute.stops.length){ 
					var kprev = knext - 1;
					while (subRoute.timeTable[j][kprev-1] == subRoute.timeTable[j][kprev]) --kprev; // CONTESTABLE MAIS PLUS SMOOTH si le bus doit passer à la même heure à deux arrêts
					var a = stops[subRoute.stops[kprev]].subRoutes[subRoute.id].posInShape;
					var b = stops[subRoute.stops[knext]].subRoutes[subRoute.id].posInShape;
					var p = shapes[subRoute.shapeId].stops[a];
					if (b>a){  // on n'est jamais trop prudent...
						//mettre un petit temps d'attente à chaque arrêt ?
						var dt = (subRoute.timeTable[j][knext]-subRoute.timeTable[j][kprev]);
						var i= a + Math.floor((b-a)* (hour-subRoute.timeTable[j][kprev]) / dt);
						var ti = subRoute.timeTable[j][kprev] + (i-a) / (b-a) * dt;
						p = interpolatePoint(shapes[subRoute.shapeId].stops[i], shapes[subRoute.shapeId].stops[i+1], (hour-ti)/dt*(b-a));
					}
					vehicles.addLayer(L.circleMarker(p, {color:"black", opacity:1, "radius":4, "stroke": false, "fillOpacity":1, clickable:false}));
					//vehicles.addLayer(L.circleMarker(shapes[subRoute.shapeId].stops[i], {color:"black", opacity:1, "radius":4, "stroke": false, "fillOpacity":1, clickable:false}));
					//vehicles.addLayer(new L.circleMarker(stops[subRoute.stops[k]], {color:"black", opacity:1, "radius":4, "stroke": false, "fillOpacity":1, clickable:false})); // last stop visited
				}
			}
		}
	}
}

function affActiveVehicles(hour){
	vehicles.clearLayers();
	for (var i=0; i<subRoutes.length; i++) 
		if (isActiveRoute[subRoutes[i].routeId])
			affVehicles(subRoutes[i], hour);
}


function vehicleMovie(){
	var dt = 0.1/60;
	vehicleMovieOn = true;
	continueVehicleMovie = true;
	var t = startHour;
	function iter(){
		t += dt;
		//if (Math.floor(3600*t) % 60 < 60*dt) $('#slider-hour-vertical').slider("value", t); // too slow, even with the test!
		$( "#startHour" ).val(real2hour(t));
		affActiveVehicles(t);
		if (continueVehicleMovie) setTimeout(iter, sleepDelay);
		else{
			vehicles.clearLayers();
			vehicleMovieOn = false;
			startHour = t;
			$('#slider-hour-vertical').slider("value", startHour); //should not be useful
			$( "#startHour" ).val(real2hour(startHour)); //should not be useful
		}
	}	
	iter();
}


/* Vehicle movie */
function interpolatePoint(p1, p2, x){ // interpolates between L.latlng p1 and p2 with proportion x 
	return(new L.LatLng((1-x)*p1.lat+x*p2.lat, (1-x)*p1.lng+x*p2.lng));
}
