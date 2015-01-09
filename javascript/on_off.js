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




// Retard du réseau

//Lines Delay
var continueLineDelay = true;
var lineDelayOn = false;

/* toggleLineDelay est appelé dans le php quand on clique sur le bouton "retard du réseau" */
function toggleLineDelay(){
	var button = document.getElementById("lineDelay") ;
	// Pas d'animation
	if (lineDelayOn){        	
		button.innerHTML = "Retard du réseau" ; 
		continueLineDelay = false;
	}
	// Animation en cours
	else{
		button.innerHTML = "Arr&ecirc;ter l'animation" ; 
		continueLineDelay = true;
		lineDelay();
	}	
}

/* La fonction lineDelay permet d'appeller les autres fonctions */
function lineDelay() {
	lineDelayOn = true;
	continueLineDelay = true;
	// Appel de la fonction StopsDelayMode avec 1 comme opacité
	StopsDelayMode(1);
	// Appel de la fonction RoutesDelayMode avec 1 comme opacité
	RoutesDelayMode(1);
	function iter(){
		if (continueLineDelay) {
			// Appel la fonction iter tout les "sleepDelay" -> Ligne 1621 : 1000*Math.exp(-5/100*Number(ui.value))
			setTimeout(iter, sleepDelay); 
		}
		else{
			lineDelayOn = false;
			// Appel de la fonction StopsDelayMode avec 0 comme opacité (rouge non visible)
			StopsDelayMode(0);
			// Appel de la fonction RoutesDelayMode avec 0 comme opacité (rouge non visible)
			RoutesDelayMode(0);
			//Delay();
		}
	}
	iter();	
}

// Permet d'afficher tout les arrets (stops) en rouge en fonction de l'opacité
function StopsDelayMode(opacite){
	for(var i=0; i<stops.length; i++) {
		if (stops[i].isActive) { // si l'arret existe
			stops[i].circle.setStyle({fillColor:"#FF0000", fillOpacity:opacite});
		}
	}
}

// Permet d'afficher tout les routes en rouge en fonction de l'opacité
function RoutesDelayMode(opacite){
	for(var j=0; j<routes.length; j++) {
		routes[j].polyline.setStyle({color:"#FF0000", opacity:opacite});
	}
}





