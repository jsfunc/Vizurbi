debug_mode = true;
inactiveNodeColor = "gray";
activeRouteColor =  "#4f8598";// "#009933";
inactiveRouteColor = "#a9c5d0";
highlightRouteColor = "#000"; //"#009933";

/* Create map*/
function createMap() {
	if (debug_mode) var startTime = performance.now();
	network = new L.LayerGroup();		

	var cmAttr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	cmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';


	// Quelques styleId : représentation du fond de la carte: http://maps.cloudmade.com/editor 				
	var minimal   = L.tileLayer(cmUrl, {styleId: 22677, attribution: cmAttr});
	var toulouse = L.latLng(43.617, 1.450);
	vehicles = new L.layerGroup();

	map = L.map('myMap', {
		center: toulouse,
		zoom: 13,
		minZoom: 11,
		maxZoom: 17,
		layers: [minimal,  network, vehicles]
	});
	L.Icon.Default.imagePath = 'images/leaflet/';
	map.spin(true, {length:0, width:20, radius:60, color:"#F4AC42"});

	if (!getCookie("neverShowIntro")){
		introInfo = L.control({position: 'topleft'});
		neverShowIntro = function(){
			setCookie("neverShowIntro", "true");
			introInfo.removeFrom(map);
		}
		introInfo.onAdd = function (map) {
			var mydiv = L.DomUtil.create('div', 'introInfo'); 
			var tt = "<h2>Bienvenue sur Vizurbi!";
			tt = tt + "<a  href=# onClick='introInfo.removeFrom(map);' style=\"position:absolute; right:10px;\"><img src=\"images/icons/close.png\" width=\"30px\" /></a></h2>";
			tt = tt + "<h3>Tout le réseau Tisséo en un coup d'&oelig;il</h3>"; 
			tt = tt + "<ul>";
			tt = tt + "<li>Tant que la roue tourne, les données se chargent (une bonne dizaine de secondes à la première visite).</li>";
			tt = tt + "<li><span class=\"highlight\">Cliquez sur un arrêt</span> : tous les temps de transport à partir de cet arrêt sont calculés.</li>";
			tt = tt + "<li>Les plus courts apparaissent en vert, les points rouges sont à 30 minutes.</li>";
			tt = tt + "<li><span class=\"highlight\">Survolez un arrêt</span> : le meilleur chemin pour s'y rendre apparaît en haut à droite de la carte.</li>";
			tt = tt + "<li>Pour avoir tous les horaires d'un arrêt ou d'une ligne, <span class=\"highlight\">cliquez dessus avec le bouton droit</span> !</li>";
			tt = tt + "<li>Plus d'informations, plus de fonctionnalités, mode avancé : voir 'En savoir Plus' en haut à droite !</li>";
			tt = tt + "</ul>";
			tt = tt + "<div class=\"understood\"><a href=# onClick='neverShowIntro();'>J'ai compris: fermer et ne plus montrer ce message à l'avenir!  <img src=\"images/icons/check.png\" width=\"25px\"></a></div>";
			mydiv.innerHTML = tt;
			return mydiv;
		};


		introInfo.addTo(map);
	}

	if (getCookie("mode") == "advanced") toggleAdvancedMode();

	if (debug_mode) console.log("createMap: "+(performance.now()-startTime));
	affStops();
	affRoutes();
}


function createSubRoutes(){
	subRoutes = new Array;
	for (var i=0; i<_trips.length; i++){
		// PATCH BUG TISSEO METRO: le temps d'attente est rajout� par erreur au temps de transport entre la premi�re et la deuxi�me station
		// du coup, on est oblig� de l'enlever artificiellement
		if (isFinite(_trips[i].frequency.freq))
			for (var j=1; j<_trips[i].times.length; j++) _trips[i].times[j] -= _trips[i].frequency.freq;
		// fin du patch, à enlever qd le bug sera corrigé		

		if (_trips[i].stops in routes[_trips[i].routeId].subRoutes){
			var subRoute = subRoutes[routes[_trips[i].routeId].subRoutes[_trips[i].stops]];
			var pos = subRoute.timeTable.length;
			while ((pos>0) && (_trips[i].times[0]<subRoute.timeTable[pos-1][0])) --pos;// has to insert the trip in increasing order of starting time, unfortunately not always satisfied by the data (pb of midnight-> 0 or 24?)
			subRoute.timeTable.splice(pos, 0, _trips[i].times); // ATTENTION ça ne va pas comme ça, on mélange les différents services ! au minimum il faut garder le serviceId correspondant, pour après regarder si ça a lieu le jour demandé
			subRoute.timeRealTable.splice(pos, 0, _trips[i].timesReal);
			subRoute.frequencies.splice(pos, 0, _trips[i].frequency);
			subRoute.serviceIds.splice(pos, 0, _trips[i].serviceId);
		}
		else{
			var subRoute = new Object;
			subRoute.stops = _trips[i].stops;
			subRoute.serviceIds = new Array;
			subRoute.serviceIds.push(_trips[i].serviceId);
			subRoute.timeTable = new Array;
			subRoute.timeTable.push(_trips[i].times); 
			subRoute.timeRealTable = new Array;
			subRoute.timeRealTable.push(_trips[i].timesReal); 
			subRoute.frequencies = new Array;
			subRoute.frequencies.push(_trips[i].frequency);
			subRoute.id = subRoutes.length;
			subRoute.routeId = _trips[i].routeId;
			subRoute.shapeId = _trips[i].shapeId;
			subRoutes.push(subRoute);
			routes[subRoute.routeId].subRoutes[_trips[i].stops] = subRoute.id;
			for (var j=0; j<_trips[i].stops.length; j++) if (_trips[i].stops[j] !== undefined) {// test nécessaire avec les données TISSEO: certains trips ont leurs premiers stops undefined!
				pStop = new Object;
				pStop.posInSubRoute = j;
				pStop.posInShape = findPosInList(stops[_trips[i].stops[j]], shapes[subRoute.shapeId].stops);
				//stops[_trips[i].stops[j]].subRoutes.push(pStop);
				stops[_trips[i].stops[j]].subRoutes[subRoute.id] = pStop;
			}
		}
	}
	if (debug_mode) console.log('createSubRoutes finished!');
	affRoutes();
}


/* Create leaflet objects */
var _affStopsCounter = 0; 
function affStops(){
	if (++_affStopsCounter>=2){
		for (var i = 0; i<stops.length; i++) if (stops[i].isActive){
			if (stops[i].parentStation){
				pid = stopIndex[stops[i].parentStation];
				if (!stops[pid].circle){
					var c = new L.circleMarker(stops[i], {"color":"#008000", opacity:1, "radius":6, "stroke": false, "fillOpacity":0.5});//"weight":20, 
					stops[pid].circle = c;
					c.id = pid;
					c.bindPopup(stops[pid].name + " " + stops[i].code);
					c.addTo(network).bringToFront();				
				}
				stops[i].circle = stops[pid].circle;
			}
			else{
				if (!stops[i].circle){ // in the normal map of Toulouse, this should not happen UNLESS a parentStation has no childStation...
					stops[i].isActive = false;
				}
			}
		}
		if (debug_mode) console.log('affStops finished!');
		createControls();
	}
}


var _affRoutesCounter = 0;
function affRoutes(){
	if (++_affRoutesCounter >= 3){
		if (debug_mode) console.log('starting affRoutes!');
		for (var id=0; id<subRoutes.length; id++){
			var shapeIndex = subRoutes[id].shapeId;
			if (shapes[shapeIndex].polyline){
				if (debug_mode) console.log("WARNING: conflict in assigning shapes to subRoutes: subRoute["+id+"] has the same shape number : "+shapeIndex+" as subRoute["+shapes[shapeIndex].polyline.subRouteId+"] !!!");
			}
			else{
				shapes[shapeIndex].polyline = new L.polyline(shapes[shapeIndex].stops, {"color":activeRouteColor, "opacity":0.6}).addTo(map); 
				shapes[shapeIndex].polyline.subRouteId = id;
			}
			routes[subRoutes[id].routeId].polyline = shapes[shapeIndex].polyline; // ?? à voir
			//}
		}
		if (debug_mode) console.log('affRoutes finished!');
		affStops();
		initMapControls();
	}
}


/* Initialisation and Interaction */
function initVariables(){
	arrivalTime = new Array(stops.length); // needs to be here because will be read by sliders.change
	comesFrom = new Array(stops.length); //idem
	for (var i=0; i<stops.length; i++) arrivalTime[i] = Infinity; // add test if (stops[i].isActive) ?
	startId = 0; // arbitrary: Capitole
	while((startId<stops.length-1) && stops[startId].name != "Capitole") ++startId;
	startMarker = L.marker(stops[startId]).addTo(map);
	vWalk = 3; //km/h
}


var changeIcon = L.icon({
	iconUrl: 'images/icons/change.png',
	iconRetinaUrl: 'images/icons/change@2x.png',
	iconSize:     [32, 32], //[208, 317], // size of the icon
	iconAnchor:  [17, 35],// [16, 16], // point of the icon which will correspond to marker's location
	popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});

var arrivalIcon = L.icon({
	iconUrl: 'images/icons/flag.png',
	iconRetinaUrl: 'images/icons/flag.png',
	iconSize:     [32, 32], //[208, 317], // size of the icon
	iconAnchor:  [0, 35],// [16, 16], // point of the icon which will correspond to marker's location
	popupAnchor:  [0, 0] // point from which the popup should open relative to the iconAnchor
});

function highLightPath(path){
	var p = new Array();
	var lastPoint = stops[startId];
	var endPoint = stops[path[path.length-1].stopId];
	var curPoint;
	var walkedBefore = false;
	for (i in path){
		curPoint = stops[path[i].stopId];
		if (path[i].subRouteId >= 0){// does not walk => track shape
			// if walked before, station should be marked
			if (walkedBefore && distance(lastPoint, endPoint) > 0.2 && distance(lastPoint, stops[startId]) > 0.2) transitionMarkers.push(L.marker(lastPoint, {icon: changeIcon}).addTo(map));
			for (var j=lastPoint.subRoutes[path[i].subRouteId].posInShape; j<curPoint.subRoutes[path[i].subRouteId].posInShape; ++j) // could be <= in stopping condition
				p.push(shapes[subRoutes[path[i].subRouteId].shapeId].polyline._latlngs[j]);
			if (distance(curPoint, endPoint) > 0.2) transitionMarkers.push(L.marker(curPoint, {clickable: false, icon: changeIcon}).addTo(map));
			walkedBefore = false;
		}
		else{ // walk to next point
			p.push(curPoint);
			if (curPoint.parentStation != lastPoint.parentStation) walkedBefore = true;
		}
		lastPoint = curPoint;
	}
	transitionMarkers.push(L.marker(curPoint, {clickable: false, icon: arrivalIcon}).addTo(map));
	//if (walkedBefore) transitionMarkers.push(L.marker(curPoint).addTo(map));	
	highLightedPath.setLatLngs(p);
}


function highLightStopSequence(s){
	highLightedPath.setLatLngs(s.map(function(x){return stops[x];}));
}

function highlightRoute(e){
	var subRoute = subRoutes[e.target.subRouteId];
	e.target.setStyle({color: highlightRouteColor, opacity:1});
	e.target.bringToFront();
	info.update('<h4>Ligne '+routes[subRoute.routeId].shortName+ "</h4> " + routes[subRoute.routeId].longName);
}

function resetHighlightRoute(e) {
	var color = isActiveRoute[subRoutes[e.target.subRouteId].routeId] ? activeRouteColor:inactiveRouteColor;
	e.target.setStyle({color:color, opacity:0.6});
	e.target.bringToBack();
	info.update();
}


function affStopInfo(stopId){ // including childStations
	$("#stopInfoDate").html($.datepicker.formatDate( "dd/mm", $( "#datepicker" ).datepicker( "getDate" ))); // changer la langue, puis format DD d mm 

	$("#stopInfoId").html(stops[stopId].name);

	stopIds = [stopId];
	for (var i in stops[stopId].childStations) stopIds.push(stops[stopId].childStations[i]);

	var tt = "<h2 class=\"stopInfo\"><img src=\"images/stop.png\" width=\"25px\">"+stops[stopId].name+"</h2>";
	var _thedate = new Date(date.substr(0,4), Number(date.substr(4,2))-1, date.substr(6,2));
	tt = tt + "<h3 class=\"stopInfo\">"+_thedate.toLocaleDateString()+"</h3>\n";
	for (var k=0; k<stopIds.length; k++){
		s = stops[stopIds[k]];
		for (var subRouteId in s.subRoutes){
			posInSubRoute = s.subRoutes[subRouteId].posInSubRoute;
			//subRoute = subRoutes[s.subRoutes[subRouteId].subRouteId];//ERROR HERE
			subRoute = subRoutes[subRouteId];
			tt = tt + "<br/><b>"+" Ligne " + routes[subRoute.routeId].shortName + " de " + stops[subRoute.stops[0]].name+ " vers " + stops[subRoute.stops[subRoute.stops.length-1]].name + " : </b><br/>\n";
			var l=0;
			var spanClass = "stopInfo_before";
			for(var j=0; j<subRoute.timeTable.length; ++j) {
				if(isOn(services[subRoute.serviceIds[j]], date)){
					var time = subRoute.timeTable[j][posInSubRoute];
					if (spanClass == "stopInfo_now") spanClass = "stopInfo_after";
					if (isFinite(subRoute.frequencies[j].freq)){
						var nextIndex = j+1;
						while ((nextIndex in subRoute.timeTable) && (!isOn(services[subRoute.serviceIds[nextIndex]], date))) ++nextIndex;
						if ((spanClass == "stopInfo_before") && (nextIndex in subRoute.timeTable) && (subRoute.timeTable[nextIndex][posInSubRoute]>startHour))
							spanClass = "stopInfo_now";
					}
					else{
						if ((spanClass == "stopInfo_before") && (time>startHour)) spanClass = "stopInfo_now";
					}
					var sep = ",";
					if (l % 15 == 0 ) sep = "<br/>";
					tt = tt  + sep + "<span class=\""+spanClass+"\">"+real2hour(time);
					if (isFinite(subRoute.frequencies[j].freq)) tt = tt + " puis toutes les " + Math.round(60*subRoute.frequencies[j].freq) + " minutes";
					tt = tt + "</span>";
					l+=1;
				}
			}
			tt = tt + "<br/>\n";
		}
	}
	map.scrollWheelZoom.disable();
	tt="<div class=\"timeTable\"><a  href=# onClick='lineInfo.update(\"Clici droit pour avoir les horaires de la ligne ou de passage au stop\");map.scrollWheelZoom.enable();' style=\"position:absolute; right:10px;\"><img src=\"images/icons/close.png\" width=\"30px\" /></a><br/><br/>"+tt+"</div>";
	lineInfo.update(tt);
}

function affRouteInfo(routeId){
	$("#routeInfoDate").html($.datepicker.formatDate( "dd/mm", $( "#datepicker" ).datepicker( "getDate" ))); // changer la langue, puis format DD d mm 

	$("#routeInfoId").html(routes[routeId].shortName);
	var tt = "<h2 class=\"stopInfo\"><img src=\"images/"+((routes[routeId].type==3)?"bus":"metro")+".png\" width=\"25px\">"+routes[routeId].shortName+"  -  "+routes[routeId].longName+"</h2>";
	var _thedate = new Date(date.substr(0,4), Number(date.substr(4,2))-1, date.substr(6,2));
	tt = tt + "<h3 class=\"stopInfo\">"+_thedate.toLocaleDateString()+"</h3>\n";
	var num = 0;
	for (var i in routes[routeId].subRoutes){
		subRoute = subRoutes[routes[routeId].subRoutes[i]];
		tt = tt + "<br/><b>Parcours " + (++num) + " : \n</b><table class=\"times\">";
		for(var j in subRoute.stops){
			tt = tt + "<tr><th>" + stops[subRoute.stops[j]].name + "</th>";
			var tdClass = "stopInfo_before";
			for (var k=0; k<subRoute.timeTable.length; ++k){
				if(isOn(services[subRoute.serviceIds[k]], date)){
					var time=subRoute.timeTable[k][j];
					if (isNaN(subRoute.frequencies[k].freq)){
						if (tdClass == "stopInfo_now") tdClass = "stopInfo_after";
						if ((tdClass == "stopInfo_before") && (time>startHour)) tdClass = "stopInfo_now";
						tt = tt + "<td class=\""+tdClass+"\">" + real2hour(time) + "</td>";
					}
					else{
						if (tdClass == "stopInfo_now") tdClass = "stopInfo_after";
						var nextIndex = k+1;
						while ((nextIndex in subRoute.timeTable) && (!isOn(services[subRoute.serviceIds[nextIndex]], date))) ++nextIndex;
						if ((tdClass == "stopInfo_before") && (nextIndex in subRoute.timeTable) && (subRoute.timeTable[nextIndex][j]>startHour)) tdClass = "stopInfo_now";
						tt = tt + "<td class=\""+tdClass+"\">" + real2hour(time);
						if (isFinite(subRoute.frequencies[k].freq)) tt = tt + " puis toutes les " + Math.round(60*subRoute.frequencies[k].freq) + " minutes";
						tt = tt + "</td>";
					}
				}
			}
			tt = tt + "</tr>\n";			
		}
		tt = tt + "</table>\n";

	}
	map.scrollWheelZoom.disable();
	tt="<div class=\"timeTable\"><a  href=# onClick='lineInfo.update(\"Clic droit pour avoir les horaires de la ligne ou de passage au stop\");map.scrollWheelZoom.enable();' style=\"position:absolute; right:10px;\"><img src=\"images/icons/close.png\" width=\"30px\"/></a><br/><br/>"+tt+"</div>";
	lineInfo.update(tt);
}

function drawAccessible(){
	if (debug_mode) var startTime = performance.now();	
	for(var i=0; i<stops.length; i++) if (stops[i].isActive) {
		if (arrivalTime[i] < startHour + maxMinute/60){
			var myColor = val2color((arrivalTime[i] - startHour)/(maxMinute/59));
			stops[i].circle.setStyle({fillColor:myColor, fillOpacity:1}); 
		}
		else{
			stops[i].circle.setStyle({fillColor:inactiveNodeColor, fillOpacity:0.5}); 
		}
	}
	if (debug_mode) console.log("drawAccessible: "+(performance.now()-startTime)+"maxMinute :"+maxMinute+" startHour :"+startHour);
	//drawAccessibleZones();
}

function drawAccessibleZones(){
	if (debug_mode) var startTime = performance.now();	
	for(var i=0; i<stops.length; i++) if (stops[i].isActive) {
		if (arrivalTime[i] < startHour + maxMinute/60){
			//var myColor = val2color((arrivalTime[i] - startHour)/(maxMinute/59));
			var radius = (startHour + maxMinute/60 - arrivalTime[i]) *vWalk * 1000;
			//accessibleZones.circles[i].setStyle({fillColor:myColor});
			accessibleZones.circles[i].setRadius(radius).bringToBack();
		}
		else{
			accessibleZones.circles[i].setRadius(0); // or remove from layer? 
		}
	}
	if (debug_mode) console.log("drawAccessibleZones: "+(performance.now()-startTime));	
}
