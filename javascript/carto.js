/*Copyright (C) 2014  Aurélien Garivier, Karen Pinel-Sauvagnat

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program, available at http://www.math.univ-toulouse.fr/~agarivie/carto/appli/LICENCE.txt
If not, see <http://www.gnu.org/licenses/>
 */



/*general purpose utility functions*/
debug_mode = true;


function setCookie(cname, cvalue, exdays) {
	exdays = exdays || 30; // default value
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
	}
	return "";
}

function byte2Hex(x){
	var n = Math.round(x);
	var nybHexString = "0123456789ABCDEF";
	return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function val2color(x){ // 0<=x<=1
	//var deb = "#FF0000"; var fin = "#FFFF00"; //rouge vers jaune
	//var deb = "#FFFF00"; var fin = "#FF0000"; x=0.7*x;//jaune vers rouge	
	//var deb = "#00D300"; var fin = "#FFD030"; // joli vert, bien
	//var deb = "#FF0066"; var fin = "#FFC466"; // joli rose
	//var deb = "#0A10F6"; var fin = "#5893D0"; // joli bleu
	//var deb = "#FB7101"; var fin = "#808080"; x=0.625*x;// orange, pas mal
	var deb, fin;
	if (x<=0.5){
		deb = "#00D300"; fin = "#FFFF00";//"#FFD030"; // joli vert, bien
		x = 2*x; 
	}
	else{
		x = 2*x-1;
		deb = "#FFFF00"; fin = "#FF0000"; x=0.7*x;//jaune vers rouge	
	}
	var a1 = parseInt(deb.substr(1, 2), 16);
	var b1 = parseInt(fin.substr(1, 2), 16);
	var a2 = parseInt(deb.substr(3, 2), 16);
	var b2 = parseInt(fin.substr(3, 2), 16);
	var a3 = parseInt(deb.substr(5, 2), 16);
	var b3 = parseInt(fin.substr(5, 2), 16);

	return("#"+byte2Hex(a1+(b1-a1)*x)+byte2Hex(a2+(b2-a2)*x)+byte2Hex(a3+(b3-a3)*x));

}

function readTime(s){
	return(Number(s.substring(0,2)) + Number(s.substring(3, 5))/60); 
}

function real2hour(x){
	var h = Math.floor(x);
	var mi = Math.round(60*(x-h)); if (mi==60){++h; mi = 0;}
	var dm = Math.floor(mi/10);
	var m = mi - 10*dm; 
	return((h % 24)+"h"+dm+m);
}

function distance(p1,p2){ // haversine formula
	var R = 6371; // km
	var dLat = (p2.lat-p1.lat) / 180 * Math.PI;
	var dLon = (p2.lng-p1.lng) / 180 * Math.PI;
	var lat1 = p2.lat / 180 * Math.PI;
	var lat2 = p2.lat / 180 * Math.PI;

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return(R * c);
}


/*load data */
function getFile(url, onload){
	// attention s�curit� : s'assurer que le fichier lu est dans un répertoire donné qui ne contient aucun fichier sensible
	if (debug_mode) console.log("downloading "+url);

	var xhr_object = null; 

	if(window.XMLHttpRequest) // Firefox 
		xhr_object = new XMLHttpRequest(); 
	else if(window.ActiveXObject) // Internet Explorer 
		xhr_object = new ActiveXObject("Microsoft.XMLHTTP"); 
	else { // XMLHttpRequest non support� par le navigateur 
		alert("Votre navigateur ne supporte pas les objets XMLHTTPRequest..."); 
		return; 
	} 

	xhr_object.onreadystatechange=function(){
		if(xhr_object.readyState == 4){
			if (debug_mode) console.log(url+" complete!");
			onload(xhr_object.responseText);
		} 		
	};

	xhr_object.open("GET", url, true); 
	xhr_object.send(null); 	
}

function getZipFile(url, onload){
	zip.workerScriptsPath = "plugins/zip/";

	function unzipBlob(blob, callback) {
		zip.createReader(new zip.BlobReader(blob), function(zipReader) {
			zipReader.getEntries(function(entries) {
				entries[0].getData(new zip.BlobWriter(zip.getMimeType(entries[0].filename)), function(data) {
					zipReader.close();
					callback(data);
				});
			});
		}, function (message) {// error handler
			if (debug_mode) console.error(message);
		});
	}

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url , true);
	xhr.responseType = 'blob';

	xhr.onload = function(e) {
		if (this.status == 200) {
			// Note: .response instead of .responseText
			var blob = new Blob([this.response], {type: 'zip'});
			unzipBlob(blob, handleBlob);
		}
	};

	function handleBlob(blob){
		var reader = new FileReader();
		reader.onload = function(e) {
			onload(e.target.result);
		};
		reader.readAsText(blob);
	}

	xhr.send();
}

function getZipFileWS(url, onload, key){
	zip.workerScriptsPath = "plugins/zip/";

	function unzipBlob(blob, callback) {
		zip.createReader(new zip.BlobReader(blob), function(zipReader) {
			zipReader.getEntries(function(entries) {
				entries[0].getData(new zip.BlobWriter(zip.getMimeType(entries[0].filename)), function(data) {
					zipReader.close();
					callback(data);
				});
			});
		}, function (message) {// error handler
			if (debug_mode) console.error(message);
		});
	}

	var result=localStorage.getItem(key);	
	//if (debug_mode) console.log('Result : '+result);
	if(result!=null) {
		if (debug_mode) console.log('Getting '+key+' file');
		onload(result);

	} else {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url , true);
		xhr.responseType = 'blob';

		xhr.onload = function(e) {
			if (this.status == 200) {
				// Note: .response instead of .responseText
				var blob = new Blob([this.response], {type: 'zip'});
				unzipBlob(blob, handleBlob);
			}
		};
		xhr.send();
	}

	function handleBlob(blob){
		var reader = new FileReader();
		reader.onload = function(e) {
			try{
				localStorage.setItem(key,e.target.result);
			}
			catch (err) {
				if (debug_mode) console.log(err.message);
			}

			onload(e.target.result);
		};
		reader.readAsText(blob);
	}


}

function load(){
	if (debug_mode) console.log("loading data and starting app!");
	createMap(); 

	getZipFile("data/Toulouse/stops.zip", onStopsLoaded); 
	getZipFile("data/Toulouse/routes.zip", onRoutesLoaded); 
	getZipFile("data/Toulouse/shapes.zip", onShapesLoaded); 
	getZipFile("data/Toulouse/calendar.zip", onCalendarLoaded);
	getZipFile("data/Toulouse/calendar_dates.zip", onCalendar_datesLoaded);
	getZipFile("data/Toulouse/DWalk.zip", onDWalkLoaded); 
	getZipFile("data/Toulouse/trips.zip", onTripsLoaded);
	getZipFile("data/Toulouse/stop_times.zip", onStop_timesLoaded); 
	getZipFile("data/Toulouse/frequencies.zip", onFrequenciesLoaded);     

}

// loading with web storage
function loadWS(){
	if (debug_mode) console.log("loading data and starting app!");
	createMap(); 
	getFile("data/Toulouse/download_date.txt", onDownload_dateLoaded);	  	
}

function getZipFiles(){

	getZipFileWS("data/Toulouse/stops.zip", onStopsLoaded,"stops"); 
	getZipFileWS("data/Toulouse/routes.zip", onRoutesLoaded,"routes"); 
	getZipFileWS("data/Toulouse/shapes.zip", onShapesLoaded,"shapes"); 
	getZipFileWS("data/Toulouse/calendar.zip", onCalendarLoaded,"calendar");
	getZipFileWS("data/Toulouse/calendar_dates.zip", onCalendar_datesLoaded,"calendar_dates");
	getZipFileWS("data/Toulouse/DWalk.zip", onDWalkLoaded,"DWalk"); 
	getZipFileWS("data/Toulouse/trips.zip", onTripsLoaded,"trips");
	getZipFileWS("data/Toulouse/stop_times.zip", onStop_timesLoaded,"stop_times"); 
	getZipFileWS("data/Toulouse/frequencies.zip", onFrequenciesLoaded,"frequencies");     

}

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


/* Read files and create date structures */
function onDownload_dateLoaded(file){
	var server_date=new Date(file);
	try {
		var client=localStorage.getItem("download_date");
		if (client!=null) {
			var client_date=new Date(client);		
			if (debug_mode) console.log(client_date+' '+server_date);			
			if (server_date.getTime()!=client_date.getTime()) {
				if (debug_mode) console.log("Removing files");
				localStorage.clear();
				localStorage.setItem("download_date",server_date);
			}
		}
		else localStorage.setItem("download_date",server_date);
	}
	catch (err)
	{ if (debug_mode) console.log(err.message);
	  if (debug_mode) console.log("no local storage available or problem getting download_date");
	  if (debug_mode) console.log("Removing files");
	  localStorage.clear();
	  localStorage.setItem("download_date",server_date);
		
	}
	getZipFiles();
}

function onStopsLoaded(file){
	stops = new Array;
	stopIndex = new Array; 
	stopName2id = new Array;
	var flines=file.split(RegExp("\n", "g"));
	// skip first line: colNames
	for (var i=1; i<flines.length; i++) if (flines[i].length>0){
		var descr=flines[i].trim().split(RegExp(",","g"));
		//stop_id,stop_code,stop_name,stop_lat,stop_lon,location_type,parent_station
		var id = stops.length;
		var originalId = String(descr[0]);
		stopIndex[originalId] = id;
		var newStop = L.latLng(Number(descr[3]), Number(descr[4]));
		newStop.isActive = true;
		newStop.originalId = originalId;		
		newStop.name = String(descr[2]);
		newStop.code = String(descr[1]);
		newStop.parentStation = (descr.length>6) ? String(descr[6]) :"";
		newStop.subRoutes = new Array;
		newStop.childStations = new Array;
		newStop.myName = newStop.name + " " + newStop.code;
		if (newStop.myName in stopName2id){
			var s=1;
			for (j in stopName2id) if (j == newStop.myName + (s==1?"":" "+s)) ++s;
			newStop.myName = newStop.myName + " " + s;// + " " + newStop.originalId;
		}
		stops.push(newStop);
		//stopName2id[newStop.name] = id; // attention : ne gère pas les doublons ! inutilisable tel quel; assigne une station de départ au hasard parmi celles qui ont ce nom; 
		stopName2id[newStop.myName] = id; // pour éviter les répétitions de station, soit bien gérer les parentStation, soit juste laisser newStop.name
		// complete with remaining information...
	}

	// register childStations
	for(var i=0; i<stops.length; i++){
		if (stops[i].parentStation != "") stops[stopIndex[stops[i].parentStation]].childStations.push(i);	
	}

	if (debug_mode) console.log('onStopsLoaded finished!');
	onDWalkLoaded();
	onStop_timesLoaded();
}

function onRoutesLoaded(file){
	if (debug_mode) var startTime = performance.now();
	routes = new Array;
	routeIndex = new Array;
	var data = Papa.parse(file, {
		delimiter: ",",
		header: false, // a n�gocier!
		dynamicTyping: false,
		preview: 0,
		step: undefined,
		encoding: "",
		worker: false,
		comments: false,
		complete: undefined,
		error: undefined,
		download: false,
		keepEmptyRows: false,
		chunk: undefined
	}).data;

	for (var i=1; i<data.length; i++){
		var line = data[i];
		var id = routes.length;
		var originalId = String(line[0]);
		routeIndex[originalId] = id;
		var newRoute = new Object;
		newRoute.originalId = originalId;
		newRoute.shortName = line[2];
		newRoute.longName = line[3];
		newRoute.type = String(line[5]);
		newRoute.subRoutes = new Array;
		routes.push(newRoute);
	}

	if (debug_mode) console.log('onRoutesLoaded finished!');
	if (debug_mode) console.log("onRoutesLoaded: "+(performance.now()-startTime));
	onTripsLoaded();
}

function onShapesLoaded(file){
	shapes = new Array;
	shapeIndex = new Array;
	var flines=file.split(RegExp("\n", "g"));
	if (debug_mode) console.log('onShapesLoaded : '+flines.length);

	// skip first line: colNames
	for (var i=1; i<flines.length; i++) if (flines[i].length>0){
		var descr=flines[i].split(RegExp(",","g"));
		//shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence
		var originalId = String(descr[0]);
		var id=0;
		if (originalId in shapeIndex){
			id = shapeIndex[originalId];
		}
		else{		
			var newShape = new Object;
			newShape.originalId = originalId;
			newShape.stops = new Array;
			id = shapes.length;
			shapes.push(newShape);
			shapeIndex[originalId] = id;
		}
		shapes[id].stops[Number(descr[3])] = new L.latLng(Number(descr[1]), Number(descr[2]));
	}
	if (debug_mode) console.log('onShapesLoaded finished!');
	onTripsLoaded();
}

function onCalendarLoaded(file){
	services = new Array;
	serviceIndex = new Array;
	var flines=file.split(RegExp("\n", "g"));
	// skip first line: colNames
	for (var i=1; i<flines.length; i++) if (flines[i].length>0){
		var descr=flines[i].split(RegExp(",","g"));	
		//service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date
		var id = services.length;
		var originalId = String(descr[0]);
		serviceIndex[originalId] = id;
		var newServ = new Object;
		newServ.originalId = originalId; // not really necessary?
		newServ.isOnByDay=new Array(7);
		for (var j=0; j<7; j++) newServ.isOnByDay[j] = (Number(descr[1+j]) == 1);
		newServ.startDate = String(descr[8]); // to be treated later!!!
		newServ.endDate = String(descr[9]);
		newServ.exceptions = new Array;
		services.push(newServ);
	}
	if (debug_mode) console.log('onCalendarLoaded finished!');
	onTripsLoaded();
	onCalendar_datesLoaded();
}

var _calendar_datesLoaded = 0;
var fileCalendar_dates;
function onCalendar_datesLoaded(file){
	if (file != undefined) fileCalendar_dates = file;
	if (++_calendar_datesLoaded >= 2){
		var flines=fileCalendar_dates.split(RegExp("\n", "g"));
		// skip first line: colNames
		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(",","g"));
			//service_id,date,exception_type
			var id = serviceIndex[String(descr[0])];
			var date = String(descr[1]);
			services[id].exceptions[date] = Number(descr[2]);
		}
		if (debug_mode) console.log('onCalendar_datesLoaded finished!');
	}
}

var _DWalkLoaded = 0;
var fileDWalk;
function onDWalkLoaded(file){
	if (file != undefined) fileDWalk = file;
	if (++_DWalkLoaded >= 2){
		dWalk = new Array;
		for (var i=0; i<stops.length; i++) dWalk[i] = new Array; // in case file is not correct: at least initialize!
		var flines=fileDWalk.split(RegExp("\n", "g"));
		if (debug_mode) console.log('onDWalkLoaded : '+flines.length);


		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(";","g"));
			//if (debug_mode) console.log(descr[0]+" "+stopIndex[descr[0]]+" "+ descr[0]+" "+stopIndex[descr[1]]);
			// StopId, stopId, as_the_crow_flies, by_foot, time_by_foot
			if (stopIndex[descr[0]]!==undefined && stopIndex[descr[1]]!==undefined){
				if (descr[3]=="n/a") {
					dWalk[stopIndex[descr[0]]][stopIndex[descr[1]]] = 10/3600;
					dWalk[stopIndex[descr[1]]][stopIndex[descr[0]]] = 10/3600;
				}
				else{
					dWalk[stopIndex[descr[0]]][stopIndex[descr[1]]] = Number(descr[4])/3600;
					dWalk[stopIndex[descr[1]]][stopIndex[descr[0]]] = Number(descr[4])/3600;
				}
			}
		}
		if (debug_mode) console.log('onDWalkLoaded finished!');
	}
}

var _tripsLoaded = 0;
var fileTrips;
function onTripsLoaded(file){
	if (debug_mode) var startTime = performance.now();
	if (file != undefined) fileTrips = file;
	if (++_tripsLoaded == 4){
		var flines=fileTrips.split(RegExp("\n", "g"));
		if (debug_mode) console.log('onTripsLoaded : '+flines.length);

		_trips= new Array;	
		_tripIndex = new Array;
		// skip first line: colNames
		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(",","g"));
			//trip_id,service_id,route_id,trip_headsign,direction_id,shape_id
			var tripId = String(descr[0]);		
			_tripIndex[tripId] = i-1;
			newTrip = new Object;
			newTrip.serviceId = serviceIndex[String(descr[1])];
			newTrip.routeId = routeIndex[String(descr[2])];
			newTrip.shapeId = shapeIndex[String(descr[5])];
			newTrip.stops = new Array;
			newTrip.times = new Array;
			newTrip.frequency = {freq:NaN, startTime:0, endTime:0}; // by default, may be updated in readFrequencies
			_trips.push(newTrip);
		}
		if (debug_mode) console.log('onTripsLoaded finished!');
		if (debug_mode) console.log("onTripsLoaded: "+(performance.now()-startTime));
		onStop_timesLoaded();
		affRoutes();
	}
}

var _Stop_timesLoaded = 0;
var fileStop_times;
function onStop_timesLoaded(file){
	if (file != undefined) fileStop_times = file;
	if (++_Stop_timesLoaded >= 3){
		var flines=fileStop_times.split(RegExp("\n", "g"));
		// skip first line: colNames
		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(",","g"));
			//trip_id,stop_id,stop_sequence,arrival_time,departure_time,stop_headsign,pickup_type,drop_off_type,shape_dist_traveled
			var tripId = _tripIndex[String(descr[0])];
			var stopSequence = Number(descr[2]); // index of the stop in the trip
			_trips[tripId].stops[stopSequence] = stopIndex[String(descr[1])]; 
			_trips[tripId].times[stopSequence] = readTime(String(descr[3])); 
			// also load the remaining information
			// warning: should take both arrival_time and departure_time
		}
		if (debug_mode) console.log('onStop_timesLoaded finished!');
		onFrequenciesLoaded();
	}
}

var _FrequenciesLoaded = 0;
var fileFrequencies;
function onFrequenciesLoaded(file){
	if (file != undefined) fileFrequencies = file;
	if (++_FrequenciesLoaded >= 2){	
		var flines=fileFrequencies.split(RegExp("\n", "g"));
		// skip first line: colNames
		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(",","g"));	
			//trip_id,start_time,end_time,headway_secs
			var tripId = _tripIndex[String(descr[0])];
			var startTime = readTime(String(descr[1]));
			var endTime = readTime(String(descr[2]));
			if ((_trips[tripId].times[0] >= startTime) && (_trips[tripId].times[0] <= endTime))// should always be true??? not so clear in specifications
				_trips[tripId].frequency = {freq:Number(descr[3])/3600, startTime: startTime, endTime: endTime}; 
		}
		if (debug_mode) console.log('onFrequenciesLoaded finished!');
		createSubRoutes();
	}
}


function findPosInList(point, list){// assumes list has at least 1 element
	var i=0;
	var mind = distance(point, list[0]);
	for (var j=1; j<list.length; j++){
		var d=distance(point, list[j]);
		if(d < mind){
			mind = d;
			i = j;
		}
	}
	return(i);
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

//not used
function computeDwalk(){
	if (debug_mode) var startTime = performance.now();
	var vWalk = 3; //km/h
	dWalk = new Array(stops.length);
	for(var i=0; i<stops.length; i++){ 
		dWalk[i] = new Array;
		for(var j=0; j<stops.length; j++){
			var dt = distance(stops[i], stops[j]) / vWalk;
			if(dt<15/60){ // maximum 15 minutes walk, it would be better to force the number of neighbors to, say, 10-20 and walk from station to station
				dWalk[i][j] = dt;
			}
		}
	}
	if (debug_mode) console.log("computeDwalk: "+(performance.now()-startTime));	
}


//not used
function saveDWalk(){
	var res = [];
	for (var i=0; i<dWalk.length; i++){
		tmp = [i];
		for (j in dWalk[i]){
			tmp.push(Number(j));
			tmp.push(Math.round(10000*dWalk[i][j])/10000);
		}
		tmp.push(Infinity);
		res.push(tmp);
	}
	saveAs(new Blob(res, {type:"text/plain; charset=utf-8"}), "dWalk.txt"); 
}


function checkData(){
	for (var i=0; i<subRoutes.length; i++){
		for(var j=0; j<subRoutes[i].timeTable.length; j++){
			for (var k=0; k<subRoutes[i].timeTable[j].length; k++){
				if (subRoutes[i].timeTable[j][k] === undefined){
					if (debug_mode) console.log("subRoute "+i + " trip "+j + " stop "+ k + " routeId = " + subRoutes[i].routeId);
				}
			}
		}
	}
	// -> pb sur la ligne 105: les stopSequence 0 et 1 n'existent pas !!!

	if (debug_mode) console.log("Number of stops: "+stops.length);
	if (debug_mode) console.log("Number of routes: "+routes.length);
	if (debug_mode) console.log("Number of subRoutes: "+subRoutes.length);
	var nbSubRoutesPerRoute = new Array;
	for(var i=0; i<routes.length; i++){
		tmp=0;
		for (var j in routes[i].subRoutes) ++tmp;
		if (tmp in nbSubRoutesPerRoute) ++nbSubRoutesPerRoute[tmp];
		else nbSubRoutesPerRoute[tmp]=1;
	}
	if (debug_mode) console.log(nbSubRoutesPerRoute);
	// [1: 3, 2: 70, 3: 6, 4: 12, 5: 1, 6: 4, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 2, 14: 1, 17: 1] 

	var nbWalkingNeighbors = new Array;
	for(var i=0; i<stops.length; i++){
		tmp=0;
		for (var j in dWalk[i]) ++tmp;
		if (tmp in nbWalkingNeighbors) ++nbWalkingNeighbors[tmp];
		else nbWalkingNeighbors[tmp]=1;
	}
	if (debug_mode) console.log(nbWalkingNeighbors);	

	var nbActiveStops = 0;
	for (var i=0; i<stops.length; i++) if (stops[i].isActive) ++nbActiveStops;
	if (debug_mode) console.log("nb of active stops: " + nbActiveStops);
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

function createControls(){
	if (debug_mode) console.log("starting createControls...");
	initVariables();

	md = new Date();
	mh = md.getHours()+md.getMinutes()/60;


	$("#slider-minute-vertical").slider({
		orientation: "vertical",
		range: "min",
		min: 1,
		max: 75,
		value:30,
		change: function(event, ui ) {
			$( "#maxMinute" ).val( ui.value+" mn" );
			changeMaxMinute();
		},
		slide: function(event, ui ) {
			$( "#maxMinute" ).val( ui.value+" mn" );
		}
	});
	$( "#maxMinute" ).val( $( "#slider-minute-vertical" ).slider( "value" )+" mn" );


	$( "#slider-hour-vertical" ).slider({
		orientation: "vertical",
		range: "min",
		min: 2,
		max: 25.5,
		value:mh,
		step:1/60,
		change: changeStartHour,
		slide: function(event, ui ) {
			$( "#startHour" ).val(real2hour(Number(ui.value))); 
		}
	}); 
	$( "#startHour" ).val(real2hour(mh));// real2hour(Number($( "#slider-hour-vertical" ).slider( "value" ))));


	$( "#slider-animation-velocity" ).slider({
		range: "min",
		min: 0,
		max: 100,
		value:50,
		change: changeAnimationVelocity,
		slide: changeAnimationVelocity
	}); 
	sleepDelay = 1000*Math.exp(-5/100*50);



//	$.datepicker.setDefaults( $.datepicker.regional[ "fr" ] ); // ça ne marche pas !!!
	$("#datepicker").datepicker({firstDay: 1, dateFormat: "dd/mm/yy", onSelect:changeDate }).datepicker( "setDate", new Date());

	// initialize control variables and set interactions of IHM
	var tags = new Array;
	var alreadyIn = new Array;
	for (var i=0; i<stops.length; i++) if(stops[i].isActive) { // only parentstations
		var s = i;
		if (stops[i].parentStation) s = stopIndex[stops[i].parentStation];
		if (!alreadyIn[s]){
			tags.push(stops[s].myName);
			alreadyIn[s] = true;
		}
	}
	/*
		if (stops[i].isActive) 
			tags.push(stops[i].name + " " +stops[i].code);
	// on pourrait mettre plut�t le nom de la parentStation: 
			//tags.push(stops[stopIndex[stops[i].parentStation]].name + " " +stops[i].code); // marche pas !
	 */

	$("#startStation").autocomplete({
		source: tags, //Object.keys(stopName2id),
		select: function( event, ui ) {
			changeStartId(stopName2id[ui.item.value]);
		},
		/*	response: function( event, ui ) { // TO BE REMOVED
			//if (ui.content.length<20) 
			for (var k=0; k<ui.content.length; k++){
				stops[stopName2id[ui.content[k].value]].circle.setStyle({fillColor: "#CC0099", fillOpacity:0.8});
			}
		},*/
		focus: function( event, ui ){
			stops[stopName2id[ui.item.value]].circle.openPopup();
		}
	});

	if (debug_mode) console.log("Finished createControls!");
}


function initMapControls(){
	highLightedPath = L.polyline([stops[1]], {clickable: false, color:"#7E1ED0", opacity:1}).addTo(network); //"#7E1ED0"
	transitionMarkers = [];

	// stop controls:
	// pb: dès qu'on touche ici, bug dans l'affichage...
	// on reste bloqué sur: reading uncompressed file stop_times.txt
	for (var i=0; i<stops.length; i++) if (stops[i].circle && ((stops[i].parentStation=="") && withOnlyParentStations) || (stops[i].isActive && (!withOnlyParentStations))){ // WARNING: condition is always ok?
		stops[i].circle.on('click', function(e){
			newId = e.target.id;
			//$("#startStation").html(stops[startId].name);
			changeStartId(newId);	
			$("#startStation").val(stops[startId].name);
		});
		stops[i].circle.on('contextmenu', function(e){
			map.scrollWheelZoom.disable();
			affStopInfo(e.target.id);

		});
		stops[i].circle.on('mouseover', function(e){
			var departureName = stops[startId].name;
			var path = getPath(e.target.id);
			var tt = "<h4>Station " + stops[e.target.id].name+ " : " + Math.floor(60*(arrivalTime[e.target.id]-startHour)) + " minutes</h4>";
			tt = tt + "<table class=\"pathDescription\">\n<tr><th>" + real2hour(startHour) + "</th><th>" + departureName + "</th></tr>\n";
			tt = tt + pathDescription(path, departureName);
			tt = tt + "</table>\n";
			info.update(tt);
			/*highLightStopSequence(getDetailedStopSequence(e.target.id));*/
			highLightPath(path);
		});
		stops[i].circle.on('mouseout', function(e){
			highLightedPath.setLatLngs([stops[startId]]);
			for (i in transitionMarkers){map.removeLayer(transitionMarkers[i]);}
			transitionMarkers = [];
			info.update();
		});
	}
	// route controls:
	isActiveRoute = new Array(routes.length);
	activeRouteSpans = new Array(routes.length);
	for(var i=0; i<routes.length; i++){
		var s = $("<span class=\"routeCheck\" id=\""+i+"\">"+routes[i].shortName+"</>").css({"background-color":activeRouteCheckColor}); 
		s.click(function(){if (!basicMode)  toggleRouteActivity($(this).attr('id'));});
		s.on('contextmenu', function(e) {e.preventDefault(); e.stopPropagation();affRouteInfo($(this).attr('id'));});
		s.on('mouseover', function(e) {
			//routes[$(this).attr('id')].polyline.fireEvent("mouseover");
			var routeId = $(this).attr('id');
			for (var i in routes[routeId].subRoutes){
				shapes[subRoutes[routes[routeId].subRoutes[i]].shapeId].polyline.fireEvent("mouseover");
			}
		});
		s.on('mouseout', function(e) {
			//routes[$(this).attr('id')].polyline.fireEvent("mouseout");}
			var routeId = $(this).attr('id');
			for (var i in routes[routeId].subRoutes){
				shapes[subRoutes[routes[routeId].subRoutes[i]].shapeId].polyline.fireEvent("mouseout");
			}
		});

		$("#activeRoutes").append(s);
		activeRouteSpans[i] = s;
		isActiveRoute[i] = true;
	}
	startApp();
}

function changeStartId(newId){	
	//stops[startId].circle.setStyle({"stroke":false,"radius":6});
	startId=newId;
	startMarker.setLatLng(stops[startId]);
	//stops[startId].circle.setStyle({"stroke":true,"radius":10});
	computeShortestPath();
	drawAccessible();
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

function startApp(){
	readDate(); // defines global variable: date, weekDay
	startHour = $('#slider-hour-vertical').slider("value");
	maxMinute = $("#slider-minute-vertical").slider("value");
	setMapInteractions(); // defines global variable: info

	//desactivateUnlinkedStops(); //??? A REVOIR !!! bizarre : �a acc�l�re les choses, mais �a d�sactive toutes les parentStations... qui sont les seules qui ont des points affich�s !
	// en fait �a efface tout, mais les points actifs seront r�activ�s plus loin

	computeShortestPath(); // defines global variables: comesFrom
	drawAccessible();	
	map.spin(false);
}



//create the map
activeNodeColor = "#FFCC66";
inactiveNodeColor = "gray";
activeRouteColor =  "#4f8598";// "#009933";
inactiveRouteColor = "#a9c5d0";
highlightRouteColor = "#000"; //"#009933";
activeRouteCheckColor = "#FF9100"; //"#4f8598"; //FFA200";
inactiveRouteCheckColor = "#a9c5d0";


function isOn(service, date){
	return(((service.isOnByDay[weekDay]) && (service.startDate <= date) && (service.endDate >= date) && (service.exceptions[date]!=2)) || (service.exceptions[date]==1));
}

function desactivateUnlinkedStops(){ // � revoir!
	for(var i=0; i<stops.length; i++){
		if (stops[i].subRoutes.length==0){
			stops[i].isActive = false;
			if (stops[i].circle) stops[i].circle.setStyle({opacity: 0, fillOpacity:0}); // � revoir tout particuli�rement !
		}
	}
}

function changeMaxMinute(e){// affects global variable: maxMinute
	maxMinute = $('#slider-minute-vertical').slider("value");
	if (debug_mode) console.log("maxMinute : "+maxMinute+"\n");
	drawAccessible();
}

function changeStartHour(event, ui ){// affects global variable: startHour
	startHour = Number(ui.value);
	$( "#startHour" ).val(real2hour(startHour)); 
	if (debug_mode) console.log("startHour : "+startHour+"\n");
	computeShortestPath();
	drawAccessible();
}

function readDate(){ // affects global variables: date, weekDay
	var dayNb = {'Mon':0, 'Tue':1, 'Wed':2, 'Thu':3, 'Fri':4, 'Sat':5, 'Sun':6};
	date = $.datepicker.formatDate( "yymmdd", $( "#datepicker" ).datepicker( "getDate" ));
	weekDay = dayNb[$.datepicker.formatDate( "D", $( "#datepicker" ).datepicker( "getDate" ))];
}

function changeDate(e){// thru readDate, affects global variables: date, weekDay
	readDate();
	computeShortestPath();
	drawAccessible();
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


function setMapInteractions(){
	// information span on the map
	info = L.control();
	info.onAdd = function (map) {
		div = L.DomUtil.create('div', 'info'); 
		this.update();
		return div;
	};

	info.update = function(msg) {
		div.innerHTML = msg || 'S&eacute;lectionnez la station de d&eacute;part<br/>puis survolez la station d\'arrivée';
	};

	info.addTo(map);


	lineInfo = L.control({position: 'bottomright'});
	lineInfo.onAdd = function (map) {
		divLine = L.DomUtil.create('div', 'lineInfo'); 
		this.update();
		return divLine;
	};	
	lineInfo.update = function(msg) {

		divLine.innerHTML = msg || 'Clic droit pour avoir les horaires de la ligne ou le passage au stop';
	};

	lineInfo.addTo(map);

	var polylineAlreadySeen = new Array;
	for (var i=0; i<subRoutes.length; i++) if (!polylineAlreadySeen[shapes[subRoutes[i].shapeId].polyline._leaflet_id]){ // to avoid double event when polyline is used for several subRoutes
		shapes[subRoutes[i].shapeId].polyline.on({
			contextmenu:function(e){affRouteInfo(subRoutes[e.target.subRouteId].routeId);},
			click:function(e){if (!basicMode) toggleRouteActivity(subRoutes[e.target.subRouteId].routeId);},
			mouseover: highlightRoute,
			mouseout: resetHighlightRoute
		});
		polylineAlreadySeen[shapes[subRoutes[i].shapeId].polyline._leaflet_id] = 1;
	}
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


function pathDescription(p, lastName){
	//return(p.map(function(x){return( (x.subRouteId>=0 ? "[via l. "+routes[subRoutes[x.subRouteId].routeId].shortName +"]":"->")+ stops[x.stopId].name);}));
	s = "";
	lastName = lastName || "";
	for(var i in p){
		if (stops[p[i].stopId].name != lastName){
			s += "<tr><td></td><td class=path_line_number>";
			if (p[i].subRouteId>=0){//bus or metro
				if (routes[subRoutes[p[i].subRouteId].routeId].type==3)//bus
					s += "<img class=path_route_image src=\"images/bus.png\"\">";
				else // test metro, =1
					s += "<img class=path_route_image src=\"images/metro.png\"\">";
				s += routes[subRoutes[p[i].subRouteId].routeId].shortName+"&nbsp;";
			}
			else{//walk
				s += "<img class=path_route_image src=\"images/walk.png\"\">";
			}
			s += "</tr><tr><td>" + real2hour(arrivalTime[p[i].stopId]) + "</td>";
			s += "<td>" + stops[p[i].stopId].name + "</td></tr>\n";
			lastName = stops[p[i].stopId].name;
		}
	}
	return(s);
}




//Reset stops coloration 
function reset(){
	if (debug_mode) var startTime = performance.now();	
	for(var i=0; i<stops.length; i++) 
		stops[i].circle.setStyle({fillColor:inactiveNodeColor, fillOpacity:0.5}); 


	if (debug_mode) console.log("Reset: "+(performance.now()-startTime));

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

// Day Movie
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

/*compute the shortest paths*/
function computeShortestPath(){
	var myHeap = Array(stops.length);
	var myHeapSize = 0;
	var myHeapIndex = Array(stops.length);
	for (var i=0; i<stops.length; i++) myHeapIndex[i] = -1;

	function pushMyHeap(x){
		myHeap[myHeapSize] = x;
		myHeapIndex[x] = myHeapSize;
		bubbleUp(myHeapSize++);
	}

	function popMyHeap(){
		var res = myHeap[0];
		myHeapIndex[res] = -1; // should not be necessary (as popped elements never come back into the heap), but does not harm a lot!
		myHeap[0] = myHeap[--myHeapSize];
		myHeapIndex[myHeap[0]] = 0;
		bubbleDown();
		return(res);
	}

	function bubbleUp(i){
		var cur = i;
		var curValue = myHeap[cur];
		var father = Math.floor((cur-1)/2); 
		while ((father>=0) && (arrivalTime[myHeap[cur]]<arrivalTime[myHeap[father]])){
			myHeap[cur] = myHeap[father];
			myHeap[father] = curValue;
			myHeapIndex[curValue] = father;
			myHeapIndex[myHeap[cur]] = cur;
			cur = father;
			curValue = myHeap[cur];
			father = Math.floor((cur-1)/2); 
		}
	}

	function bubbleDown(){
		var cur = 0;
		var curValue = myHeap[cur];
		var goon = true;
		while ((2*cur+2<myHeapSize) && goon){
			var smallestChild = arrivalTime[myHeap[2*cur+1]]<arrivalTime[myHeap[2*cur+2]]?2*cur+1:2*cur+2;
			if (arrivalTime[myHeap[cur]]>arrivalTime[myHeap[smallestChild]]){
				myHeap[cur] = myHeap[smallestChild];
				myHeap[smallestChild] = curValue;
				myHeapIndex[curValue] = smallestChild;
				myHeapIndex[myHeap[cur]] = cur;
				cur = smallestChild;
				curValue = myHeap[smallestChild];			
			}
			else{
				goon = false;
			}		
		}
		if ((myHeapSize == 2*cur+2) && arrivalTime[myHeap[2*cur+1]]<curValue){
			myHeap[cur] = myHeap[2*cur+1];
			myHeap[2*cur+1] = curValue;
			myHeapIndex[curValue] = 2*cur+1;
			myHeapIndex[myHeap[cur]] = cur;
		}
	}

	function checkIfBetter(dest, atime, subRouteId){	
		var id = myHeapIndex[dest];
		if (id>=0){
			if (arrivalTime[dest] > atime){
				arrivalTime[dest] = atime;
				bubbleUp(id);
				comesFrom[dest] = {stopId:active, subRouteId: subRouteId};
			}
		}
		else{
			arrivalTime[dest] = atime;
			comesFrom[dest] = {stopId:active, subRouteId: subRouteId};
			pushMyHeap(dest);
		}		
	}

	if (debug_mode) var startTime = performance.now();
	for (var i=0; i<stops.length; i++) arrivalTime[i] = Infinity; // add test if (stops[i].isActive) ?
	comesFrom = new Array(stops.length);
	for (var i=0; i<stops.length; i++) comesFrom[i] = new Object;// add test if (stops[i].isActive) ?
	myHeapSize = 0; // re-initialize heap 
	pushMyHeap(startId);
	finished = new Array(stops.length); // when finished[id] is set, means that arrivalTime[id] is definitively correct
	arrivalTime[startId] = startHour;
	comesFrom[startId] = {stopId:-1, subRouteId:-1};
	while (myHeapSize>0){
		var active = popMyHeap();
		finished[active] = 1;

		for(var dest in dWalk[active]) if (finished[dest] != 1) checkIfBetter(Number(dest), arrivalTime[active]+dWalk[active][dest], -1); // Number because dest is of type String!

		/*for(var i=0; i<stops[active].subRoutes.length; i++){
			var subRouteId = stops[active].subRoutes[i].subRouteId;*/
		for (var subRouteId in stops[active].subRoutes){
			if (isActiveRoute[subRoutes[subRouteId].routeId]){
				var timeTable = subRoutes[subRouteId].timeTable;
				var frequencies = subRoutes[subRouteId].frequencies;
				var serviceIds = subRoutes[subRouteId].serviceIds;
				var posInSubRoute = stops[active].subRoutes[subRouteId].posInSubRoute;
				var relevantTripIndex = 0; // index of the next transit of the route in which to step in // perform binary search?
				var isFrequency = false;
				for (; relevantTripIndex<timeTable.length; relevantTripIndex++){
					if (isOn(services[serviceIds[relevantTripIndex]], date)){// should be the bus departureTime, not arrivalTime -> not distinguished yet
						if (isFinite(frequencies[relevantTripIndex].freq) && arrivalTime[active]>=frequencies[relevantTripIndex].startTime && arrivalTime[active]<=frequencies[relevantTripIndex].endTime){
							isFrequency = true;
							break;
						}
						else if (arrivalTime[active]<=timeTable[relevantTripIndex][posInSubRoute]) break;
					}
				}
				if (relevantTripIndex<timeTable.length){
					if (isFrequency){	
						for(var j=posInSubRoute+1; j<subRoutes[subRouteId].stops.length; j++){
							var dest = subRoutes[subRouteId].stops[j];
							if (finished[dest] != 1){
								var timeToDest = frequencies[relevantTripIndex].freq/2 + timeTable[relevantTripIndex][j]-timeTable[relevantTripIndex][posInSubRoute];// wait half frequency on average
								checkIfBetter(dest, arrivalTime[active] + timeToDest + 1/60, subRouteId); // add a small delay to step out of the station?
							}
						}					
					}
					else{
						for(var j=posInSubRoute+1; j<subRoutes[subRouteId].stops.length; j++){
							var dest = subRoutes[subRouteId].stops[j]; // add a small delay to step out of the station?
							if (finished[dest] != 1) checkIfBetter(dest, timeTable[relevantTripIndex][j], subRouteId); // should be arrivalTime of the bus
						}
					}
				}
			}
		}
	}
	if (debug_mode) console.log("computeShortestPath: "+(performance.now()-startTime));
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

function getPath(dest){ // warning: returns only the bus stations we step in and out - see also getDetailedStopSequence
	if (comesFrom[dest].stopId>=0){
		var pathFather = getPath(comesFrom[dest].stopId);
		pathFather.push({stopId:dest, subRouteId:comesFrom[dest].subRouteId});
		return(pathFather);
	}
	else return([{stopId:dest, subRouteId:-1}]);
}

function getDetailedStopSequence(dest){ 
	if (comesFrom[dest].stopId>=0){
		var pathFather = getDetailedStopSequence(comesFrom[dest].stopId);
		if (comesFrom[dest].subRouteId>=0){
			var j = 0;
			var subRouteStops = subRoutes[comesFrom[dest].subRouteId].stops;
			while ((j<subRouteStops.length) && (subRouteStops[j] != comesFrom[dest].stopId)) j++; // the first test should not be useful
			while ((++j<subRouteStops.length) && (subRouteStops[j] != dest)) // the first test should not be useful
				pathFather.push(subRouteStops[j]);
		}
		pathFather.push(dest);
		return(pathFather);
	}
	else return([dest]);
}




/* Day movie */
function changeAnimationVelocity(event, ui){
	sleepDelay = 1000*Math.exp(-5/100*Number(ui.value));//$('#slider-animation-velocity').slider("value")));
	if (debug_mode) console.log("sleepDelay : "+sleepDelay+"\n");
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





/* Vehicle movie */
function interpolatePoint(p1, p2, x){ // interpolates between L.latlng p1 and p2 with proportion x 
	return(new L.LatLng((1-x)*p1.lat+x*p2.lat, (1-x)*p1.lng+x*p2.lng));
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


