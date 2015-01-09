function include(src, attributes)
{
	try {
	    	attributes = attributes || {};
	        attributes.type = "text/javascript";
	        attributes.src = src;
	 
	        var script = document.createElement("script");
	        for(aName in attributes)
	            script[aName] = attributes[aName];
	 
	        document.getElementsByTagName("head")[0].appendChild(script);
	        return true;
	    } catch(e) { return false; }
}

include('toolbox.js');
include('map.js');
include('parameter.js');
include('loading.js');
include('math.js');

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
