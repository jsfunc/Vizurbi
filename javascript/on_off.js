debug_mode = true;
activeRouteColor =  "#4f8598";// "#009933";
inactiveRouteColor = "#a9c5d0";
activeRouteCheckColor = "#FF9100"; //"#4f8598"; //FFA200";
inactiveRouteCheckColor = "#a9c5d0";

var basicMode = true; // mode avancé
var continueVehicleMovie = false; // Ballet des bus
var continueDayMovie = false; //au fil de la journee
var	continueLineDelay = false; // retard du reseau 
var continueLineMovie = false; // etat du reseau
var animation = false; // lecture - pause


function desactivateUnlinkedStops(){ // a revoir!
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
}

function activateAllLines(){ // change Lines->Routes and php accordingly!
	for (var i=0; i<routes.length; i++) activateRoute(i);
	computeShortestPath();
}

function disactivateBusLines(){ 
	for (var i=0; i<routes.length; i++)  if (routes[i].type==3) disactivateRoute(i);
	computeShortestPath();
}

function activateBusLines(){ 
	for (var i=0; i<routes.length; i++) if (routes[i].type==3) activateRoute(i);
	computeShortestPath();
}

function disactivateSubwayLines(){ 
	for (var i=0; i<routes.length; i++)  if (routes[i].type==1) disactivateRoute(i);
	computeShortestPath();
}

function activateSubwayLines(){ 
	for (var i=0; i<routes.length; i++) if (routes[i].type==1) activateRoute(i);
	computeShortestPath();
}

function disactivateTramwayLines(){ 
	for (var i=0; i<routes.length; i++)  if (routes[i].type==0) disactivateRoute(i);
	computeShortestPath();
}

function activateTramwayLines(){ 
	for (var i=0; i<routes.length; i++) if (routes[i].type==0) activateRoute(i);
	computeShortestPath();
}

/* ------------------------------------------------------- Réinitialiser ----------------------------------------------------------- */

// Reset stops coloration 
function reset(){
	if (debug_mode) var startTime = performance.now();	
	for(var i=0; i<stops.length; i++) 
		if (stops[i].isActive) {stops[i].circle.setStyle({fillColor:inactiveNodeColor, fillOpacity:0.5}); }
	vehicles.clearLayers();
	if (debug_mode) console.log("Reset: "+(performance.now()-startTime));
}

/* ---------------------------------------------------- mode avancé / mode simple ------------------------------------------------------ */

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

/* ------------------------------------------------------ Vue : Le ballet des bus ----------------------------------------------------------- */

/* toggleVehicleMovie est appelé dans le php quand on clique sur le bouton "Le ballet des bus" */
function toggleVehicleMovie(){
	// Efface tout ce qu'il y avait sur la map avant
	reset();
	normalMode();
	// Initialisation de toutes les variables de tests des vues à faux
	// Pour permettre de re-cliquer sur le meme bouton en gardant la vue
	// Mais aussi de passer d'une vue à l'autre
	continueVehicleMovie = true; // Ballet des bus
	continueDayMovie = false; //au fil de la journee
	continueLineDelay = false; // retard du reseau 
	continueLineMovie = false; // etat du reseau
	// On appelle la fonction vehicleMovie
	vehicleMovie();
}

function vehicleMovie(){
	// Toutes les 1 minutes
	console.log("Blaaa");
	var dt = 0.5/60;
	// Fonction qui permet de boucler sur l'heure (permet l'animation)
	function iter(){
		var t = startHour;
		// Si l'animation est en cours (bouton affiche la possibilité de pause) alors incrementation du temps
		if (!animation) { 
			t += dt;
			t = t%24;
			startHour = t;
		}
		// Affiche l'heure de départ
		$( "#startHour" ).val(real2hour(t));
		// si on doit continuer l'animation
		if (continueVehicleMovie) { 
			// appel de la fonction affActiveVehicles en fonction du temps t
			affActiveVehicles(t);
			// On relance la fonction iter si le bouton est sur pause
			if (!animation) setTimeout(iter, sleepDelay);
		}
		else{
			// On efface les vehicules (bus)
			vehicles.clearLayers();
			// On affiche la valeur dans la jauge
			$('#slider-hour-vertical').slider("value", startHour); //should not be useful
			// On affiche l'heure de depart
			$( "#startHour" ).val(real2hour(startHour)); //should not be useful
		}
	}	
	// Appel de la fonction iter
	iter();
}

function affActiveVehicles(hour){
	vehicles.clearLayers();
	for (var i=0; i<subRoutes.length; i++) 
		if (isActiveRoute[subRoutes[i].routeId])
			affVehicles(subRoutes[i], hour);
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

function interpolatePoint(p1, p2, x){ // interpolates between L.latlng p1 and p2 with proportion x 
	return(new L.LatLng((1-x)*p1.lat+x*p2.lat, (1-x)*p1.lng+x*p2.lng));
}

/* ----------------------------------------------------- Vue : Au fil de la journée ---------------------------------------------------- */

/* toggleDayMovie est appelé dans le php quand on clique sur le bouton "Au fil de la journée" */
function toggleDayMovie() {
	// Efface tout ce qu'il y avait sur la map avant
	reset();
	normalMode();
	// Initialisation de toutes les variables de tests des vues à faux
	// Pour permettre de re-cliquer sur le meme bouton en gardant la vue
	// Mais aussi de passer d'une vue à l'autre
	continueVehicleMovie = false; // Ballet des bus
	continueDayMovie = true; //au fil de la journee
	continueLineDelay = false; // retard du reseau 
	continueLineMovie = false; // etat du reseau
	// On appelle la fonction dayMovie
	dayMovie();
}

function dayMovie(){
	// Toutes les 1 minutes
	var dt = 1/60; // toutes les minutes	
	// Fonction qui permet de boucler sur l'heure (permet l'animation)
	function iter(){
		// la variable t recoit l'heure de la jauge
		var t = startHour;
		// Si l'animation est en cours (bouton affiche la possibilité de pause) alors incrementation du temps
		if (!animation) { 
			t += dt;
			t = t%24;
			startHour = t;
		}
		// Affiche l'heure de départ
		$( "#startHour" ).val(real2hour(startHour));
		// si on doit continuer l'animation	
		if (continueDayMovie) { 
			computeShortestPath();
			// appel de la fonction pour afficher les points de couleurs
			drawAccessible();	
			// On relance la fonction iter si le bouton est sur pause
			if (!animation) setTimeout(iter, sleepDelay); 
		}
		else {
			// On affiche la valeur dans la jauge
			$('#slider-hour-vertical').slider("value", startHour); //should not be useful
			// On affiche l'heure de depart
			$( "#startHour" ).val(real2hour(startHour)); //should not be useful
		}
	}
	// Appel de la fonction iter
	iter();
}
/* ------------------------------------------- Vue : Retard du réseau ------------------------------------------ */

/* toggleLineDelay est appelé dans le php quand on clique sur le bouton "retard du réseau" */
function toggleLineDelay(){
	// Efface tout ce qu'il y avait sur la map avant
	reset();
	normalMode();
	// Initialisation de toutes les variables de tests des vues à faux
	// Pour permettre de re-cliquer sur le meme bouton en gardant la vue
	// Mais aussi de passer d'une vue à l'autre
	continueVehicleMovie = false; // Ballet des bus
	continueDayMovie = false; //au fil de la journee
	continueLineDelay = true; // retard du reseau 
	continueLineMovie = false; // etat du reseau
	// On appelle la fonction lineDelay
	lineDelay();
}

/* La fonction lineDelay permet d'appeller les autres fonctions */
function lineDelay() {
	// Toutes les 1 minutes
	var dt = 1/60;
	// Fonction qui permet de boucler sur l'heure (permet l'animation)
	function iter(){
		// la variable t recoit l'heure de la jauge
		var t = startHour;
		// Si l'animation est en cours (bouton affiche la possibilité de pause) alors incrementation du temps
		if (!animation) { 
			t += dt;
			t = t%24;
			startHour = t;
		}
		// Affiche l'heure de départ
		$( "#startHour" ).val(real2hour(t));
		// si on doit continuer l'animation
		if (continueLineDelay){	
			// On efface a chaque changement d'heure les précédents traits rouge
			normalMode();
			// Appel de la fonction lineDelayMode
			lineDelayMode();
			// On relance la fonction iter si le bouton est sur pause
			if (!animation) setTimeout(iter, sleepDelay);
		}
		else {
			// On affiche la valeur dans la jauge
			$('#slider-hour-vertical').slider("value", startHour); //should not be useful
			// On affiche l'heure de depart
			$( "#startHour" ).val(real2hour(startHour)); //should not be useful
		}
	}
	// Appel de la fonction iter
	iter();
}
 
// Permet de colorer les routes où il y a des embouteillages
function lineDelayMode() {
	// Création des variables + ou - 5 minutes de l'heure actuelle
	var heureActuelleMoinsCinq = startHour-0.08;
	var heureActuellePlusCinq = startHour+0.08;
	// Pour chaque trajet des lignes de bus (1 sens = 1 subRoutes)
	for (var i=0; i<subRoutes.length; i++) { 
		// Pour chaque passage de la ligne de bus dans la journée
		for (var j=0; j<subRoutes[i].timeTable.length; j++) { 
			// Si la ligne de bus fonctionne lors de la date renseigné
			if (isOn(services[subRoutes[i].serviceIds[j]],date)) {
				 // Pour chaque arret de la ligne de bus
				for (var k=0; k<subRoutes[i].timeTable[j].length-1; k++) {
					// Calcul du retard (temps officiel - temps réel) pour l'arret k et l'arret k+1
					var retardA = subRoutes[i].timeRealTable[j][k] - subRoutes[i].timeTable[j][k];
					var retardB = subRoutes[i].timeRealTable[j][k+1] - subRoutes[i].timeTable[j][k+1];					
					// Si le temps réel et le temps officiel sont compris entre + ou - 5 min de l'heure actuelle et que le retard est important
					if ( ( subRoutes[i].timeRealTable[j][k]>= heureActuelleMoinsCinq) && ( subRoutes[i].timeRealTable[j][k]<= heureActuellePlusCinq)
						&& ( subRoutes[i].timeRealTable[j][k+1]>= heureActuelleMoinsCinq) && ( subRoutes[i].timeRealTable[j][k+1]<= heureActuellePlusCinq)
						&&  ((retardB - retardA) >= 0.08) ) {
						// Si le chemin existe, l'afficher en rouge
						if(subRoutes[i].subShapes[k]) {
							subRoutes[i].subShapes[k].setStyle({opacity:1, color:"red"});
						}
					}
				}
			}
		}
	}
}

/* ---------------------------------------------------------- Vue : L'etat du réseau -------------------------------------------------------------- */

/* toggleLineMovie est appelé dans le php quand on clique sur le bouton "L'état du réseau" */
function toggleLineMovie(){
	// Efface tout ce qu'il y avait sur la map avant
	reset();
	normalMode();
	// Initialisation de toutes les variables de tests des vues à faux
	// Pour permettre de re-cliquer sur le meme bouton en gardant la vue
	// Mais aussi de passer d'une vue à l'autre
	continueVehicleMovie = false; // Ballet des bus
	continueDayMovie = false; //au fil de la journee
	continueLineDelay = false; // retard du reseau 
	continueLineMovie = true; // etat du reseau
	// On appelle la fonction lineMovie
	lineMovie();
}

function lineMovie(){
	// Toutes les 1 minutes
	var dt = 1/60;
	// Fonction qui permet de boucler sur l'heure (permet l'animation)
	function iter(){
		// la variable t recoit l'heure de la jauge
		var t = startHour;
		// Si l'animation est en cours (bouton affiche la possibilité de pause) alors incrementation du temps
		if (!animation) {
			t += dt;
			t = t%24;
			startHour = t;
		}
		// Affiche l'heure de départ
		$( "#startHour" ).val(real2hour(t));
		if (continueLineMovie) {
			// Efface les traits colorés de la route
			normalMode();
			// appel de la fonction colorAllSubRoutes
			colorAllSubRoutes(t);
			// On relance la fonction iter si le bouton est sur pause
			if (!animation) setTimeout(iter, sleepDelay);
		}
		else{
			// On affiche la valeur dans la jauge
			$('#slider-hour-vertical').slider("value", startHour); //should not be useful
			// On affiche l'heure de depart	
			$( "#startHour" ).val(real2hour(startHour)); //should not be useful
		}
	}	
	// Appel de la fonction iter
	iter();
}

// Coloration de tout les trajets en fonction du temps
function colorAllSubRoutes(time){
	for(var i=0 ; i<subRoutes.length ; i++){
		colorSubRoute(i, giveTimes(i, time));
	}
}

// give the times needed to go from stop to stop for a given subRoute at a given time
function giveTimes(subRnum, hour){
	var times		= subRoutes[subRnum].timeTable;
	var nbStops		= times[0].length;
	var durations	= new Array;
	var timeMax		= times[times.length-1][nbStops-1];
	for(var i=0 ; i<times.length ; i++){
		// Si la ligne de bus fonctionne lors de la date renseigné
		if (isOn(services[subRoutes[subRnum].serviceIds[i]],date)) {
			for(var j=0 ; j<nbStops-1 ; j++){
				if(!(durations[j]) && (hour >= times[i][j]) && (hour < timeMax)){
					durations[j] = times[i][j+1]-times[i][j];
				}
			}
		}
	}
	return durations;
}

// coloration du trajet en fonction de son numero et du temps
function colorSubRoute(subRnum, durations){
	var subS = subRoutes[subRnum].subShapes;
	var mins = subRoutes[subRnum].minTimes;
	var maxs = subRoutes[subRnum].maxTimes;
	var c = 0;
	for(var i=0 ; i<subS.length ; i++){
		if(subS[i]){
			if(durations[i]){
				if(maxs[i]-mins[i]>0){
					c = (durations[i]-mins[i])/(maxs[i]-mins[i]);
				}
				subS[i].setStyle({opacity:0.6, color:val2color(c)});			
			}
			else{subS[i].setStyle({opacity:0});	}
		}
	}
}

/* ----------------------------------------------------- Commun a plusieurs vues -------------------------------------------------------------- */ 

// Fonction permettant d'effacer les traits colorés de la route
function normalMode(){
 	for (var i = 0; i<subRoutes.length; i++){
		for (var j = 0; j<subRoutes[i].subShapes.length; j++){
			if(subRoutes[i].subShapes[j]){
				subRoutes[i].subShapes[j].setStyle({opacity:0}); 	
			}					
		}
	} 
}

function PlayPause(){
	var button = document.getElementById("animation") ;
	// Si animation
	if (animation){
		button.innerHTML = "pause" ;	
		animation = false;	
		if (continueDayMovie) {toggleDayMovie();}
		else if (continueVehicleMovie) {toggleVehicleMovie();}
		else if (continueLineDelay) {toggleLineDelay();}
		else if (continueLineMovie) {toggleLineMovie();}
	}
	// Si pas d'animation en cours
	else{
		button.innerHTML = "lecture" ;
		animation = true;
	}	
}

