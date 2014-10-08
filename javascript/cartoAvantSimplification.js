// general purpose utility functions

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
	var dm= Math.floor((6*(x-h)));
	var m = Math.floor(60*(x-h)-10*dm);
	return((h % 24)+"h"+dm+m);
}



// load data 

// loeading text files
// not used
function getFile(url, onload){
	// attention s�curit� : s'assurer que le fichier lu est dans un répertoire donné qui ne contient aucun fichier sensible
	console.log("downloading "+url);
	
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
			console.log(url+" complete!");
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
			console.error(message);
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
			console.error(message);
		});
	}

	result=localStorage.getItem(key);
	//console.log('Result : '+result);
	if(result!=null) {
  		console.log('Getting '+key+' file');
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
			catch (err){
				console.log(err.message);
			}
			onload(e.target.result);
		};
		reader.readAsText(blob);
	}
	
	
}
function load(){
	console.log("loading data and starting app!");
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


function loadWS(){
	console.log("loading data and starting app!");
	createMap(); 
	
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
function createMap() {
	var startTime = performance.now();
 	network = new L.LayerGroup();						
	
	var cmAttr = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		cmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
		
		
	// Quelques styleId : représentation du fond de la carte: http://maps.cloudmade.com/editor 				
	var minimal   = L.tileLayer(cmUrl, {styleId: 22677, attribution: cmAttr});
	var toulouse = L.latLng(43.617, 1.450);
	map = L.map('myMap', {
	center: toulouse,
	zoom: 13,
	layers: [minimal,  network]
	});

	var overlays = {
		"network": network
	};
	map.spin(true, {length:0, width:20, radius:60, color:"#F4AC42"});

	
	L.control.layers(null, overlays).addTo(map);

	console.log("createMap: "+(performance.now()-startTime));
	affStops();
	affRoutes();
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
		stops.push(newStop);
		//stopName2id[newStop.name] = id; // attention : ne gère pas les doublons ! inutilisable tel quel; assigne une station de départ au hasard parmi celles qui ont ce nom; 
		stopName2id[newStop.name+" "+newStop.code] = id; // pour éviter les répétitions de station, soit bien gérer les parentStation, soit juste laisser newStop.name
		// complete with remaining information...
	}
	
	// register childStations
	for(var i=0; i<stops.length; i++){
		if (stops[i].parentStation != "") stops[stopIndex[stops[i].parentStation]].childStations.push(i);	
	}
	
	console.log('onStopsLoaded finished!');
	onDWalkLoaded();
	onStop_timesLoaded();
	createControls();
}

function onRoutesLoaded(file){
	var startTime = performance.now();
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
	
	console.log('onRoutesLoaded finished!');
	console.log("onRoutesLoaded: "+(performance.now()-startTime));
	onTripsLoaded();
}


function onShapesLoaded(file){
	shapes = new Array;
	shapeIndex = new Array;
	var flines=file.split(RegExp("\n", "g"));
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
	console.log('onShapesLoaded finished!');
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
	console.log('onCalendarLoaded finished!');
	onTripsLoaded();
	onCalendar_datesLoaded();
}

var _calendar_datesLoaded = 0;
var fileCalendar_dates;
function onCalendar_datesLoaded(file){
	if (file != undefined) fileCalendar_dates = file;
	if (++_calendar_datesLoaded == 2){
		var flines=fileCalendar_dates.split(RegExp("\n", "g"));
		// skip first line: colNames
		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(",","g"));
			//service_id,date,exception_type
			var id = serviceIndex[String(descr[0])];
			var date = String(descr[1]);
			services[id].exceptions[date] = Number(descr[2]);
		}
		console.log('onCalendar_datesLoaded finished!');
	}
}

var _DWalkLoaded = 0;
var fileDWalk;
function onDWalkLoaded(file){
	if (file != undefined) fileDWalk = file;
	if (++_DWalkLoaded == 2){
		dWalk = new Array;
		for (var i=0; i<stops.length; i++) dWalk[i] = new Array; // in case file is not correct: at least initialize!
		var flines=fileDWalk.split(RegExp("\n", "g"));
		for (var i=1; i<flines.length; i++) if (flines[i].length>0){
			var descr=flines[i].split(RegExp(";","g"));
			//console.log(descr[0]+" "+stopIndex[descr[0]]+" "+ descr[0]+" "+stopIndex[descr[1]]);
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
		console.log('onDWalkLoaded finished!');
	}
}

var _tripsLoaded = 0;
var fileTrips;
function onTripsLoaded(file){
	var startTime = performance.now();
	if (file != undefined) fileTrips = file;
	if (++_tripsLoaded == 4){
		var flines=fileTrips.split(RegExp("\n", "g"));
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
		console.log('onTripsLoaded finished!');
		console.log("onTripsLoaded: "+(performance.now()-startTime));
		onStop_timesLoaded();
		affRoutes();
	}
}

var _Stop_timesLoaded = 0;
var fileStop_times;
function onStop_timesLoaded(file){
	if (file != undefined) fileStop_times = file;
	if (++_Stop_timesLoaded == 3){
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
		console.log('onStop_timesLoaded finished!');
		onFrequenciesLoaded();
	}
}


var _FrequenciesLoaded = 0;
var fileFrequencies;
function onFrequenciesLoaded(file){
	if (file != undefined) fileFrequencies = file;
	if (++_FrequenciesLoaded == 2){	
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
		console.log('onFrequenciesLoaded finished!');
		createSubRoutes();
	}
}


function createSubRoutes(){
	subRoutes = new Array;
	for (var i=0; i<_trips.length; i++){
		// PATCH BUG TISSEO METRO: le temps d'attente est rajout� par erreur au temps de transport entre la premi�re et la deuxi�me station
		// du coup, on est oblig� de l'enlever artificiellement
		if (isFinite(_trips[i].frequency.freq))
			for (var j=1; j<_trips[i].times.length; j++) _trips[i].times[j] -= _trips[i].frequency.freq;
		// fin du patch, � enlever qd le bug sera corrig�		
		
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
				pStop.subRouteId = subRoute.id;
				pStop.posInSubRoute = j;
				stops[_trips[i].stops[j]].subRoutes.push(pStop);
			}
		}
	}
	console.log('createSubRoutes finished!');
	affRoutes();
}

var _affStopsCounter = 0; 
function affStops(){
	if (++_affStopsCounter==2){
		for (var i = 0; i<stops.length; i++) if (stops[i].isActive){
			if (withOnlyParentStations && stops[i].parentStation){
				pid = stopIndex[stops[i].parentStation];
				if (!stops[pid].circle){
					var c = new L.circleMarker(stops[i], {"color":"#008000", opacity:1, "weight":20, "radius":6, "stroke": false, "fillOpacity":0.5});
					stops[pid].circle = c;
					c.id = pid;
					c.bindPopup(stops[pid].name + " " + stops[i].code);
					c.addTo(network);				
				}
				stops[i].circle = stops[pid].circle;
			}
			else{
				var c = new L.circleMarker(stops[i], {"color":"#008000", opacity:1, "weight":10, "radius":6, "stroke": false, "fillOpacity":0.5});
				stops[i].circle = c;
				c.id = i;
				c.bindPopup(stops[i].name + " " + stops[i].code);
				c.addTo(network);
			}
		}
		console.log('affStops finished!');
		createControls();
	}
}


var _affRoutesCounter = 0;
function affRoutes(){
	if (++_affRoutesCounter == 3){
		console.log('starting affRoutes!');
		if (withAllSubRoutes){ // COMPLETELY OBSOLETE: REMOVE! each subRoute has its own polyLine
			for (var id=0; id<subRoutes.length; id++){
				var pl = new Array;
				for (var j = 0; j<subRoutes[id].stops.length; j++) if (subRoutes[id].stops[j]!==undefined)  pl.push(stops[subRoutes[id].stops[j]]); // small patch to address pb1: some subRoutes have stop_sequence 0 and 1 undefined
				subRoutes[id].polyline = L.polyline(pl, {"color":activeRouteColor, "opacity":0.6}).addTo(network);
				subRoutes[id].polyline.subRouteId = id;
			}
		}
		else{
			for (var id=0; id<subRoutes.length; id++){// only the first subRoute has a polyLine
				//if (routes[subRoutes[id].routeId].polyLine){
				//	subRoutes[id].polyline = routes[subRoutes[id].routeId].polyLine;
				//}		
				//else{
				/*
					var pl = new Array;
					for (var j = 0; j<subRoutes[id].stops.length; j++) if (subRoutes[id].stops[j]!==undefined)  pl.push(stops[subRoutes[id].stops[j]]); // small patch to address pb1: some subRoutes have stop_sequence 0 and 1 undefined
					subRoutes[id].polyline = L.polyline(pl, {"color":activeRouteColor}).addTo(network);
					subRoutes[id].polyline.subRouteId = id;
					routes[subRoutes[id].routeId].polyLine = subRoutes[id].polyline;*/
					
					//var shapeIndex = findShapeIndex(subRoutes[id].stops);
					var shapeIndex = subRoutes[id].shapeId;
					if (shapes[shapeIndex].polyline){
						console.log("WARNING: conflict in assigning shapes to subRoutes: subRoute["+id+"] has the same shape number : "+shapeIndex+" as subRoute["+shapes[shapeIndex].polyline.subRouteId+"] !!!");
					}
					else{
						shapes[shapeIndex].polyline = new L.polyline(shapes[shapeIndex].stops, {"color":activeRouteColor, "opacity":0.6}).addTo(map); 
						// shapes[shapeIndex].polyline = new L.polyline(shapes[shapeIndex].stops, {color: 'red'}).addTo(map); //temp
						shapes[shapeIndex].polyline.subRouteId = id;
					}
					// subRoutes[id].polyline = shapes[shapeIndex].polyline;
					routes[subRoutes[id].routeId].polyline = shapes[shapeIndex].polyline; // ?? � voir
				//}
			}
		}
		console.log('affRoutes finished!');
		affStops();
		initMapControls();
	}
}


function changeStartId(newId){	
	stops[startId].circle.setStyle({"stroke":false});
	startId=newId;
	stops[startId].circle.setStyle({"stroke":true});
	computeShortestPath();
	drawAccessible();
}

function createControls(){
	console.log("starting createControls...");
	$("#slider-minute-vertical").slider({
			orientation: "vertical",
			range: "min",
			min: 1,
			max: 120,
			value:30,
			slide: function( event, ui ) {
			$( "#maxMinute" ).val( ui.value+" mn" );
			changeMaxMinute();
		}
	});
	$( "#maxMinute" ).val( $( "#slider-minute-vertical" ).slider( "value" )+" mn" );
	
	
	$( "#slider-hour-vertical" ).slider({
			orientation: "vertical",
			range: "min",
			min: 2,
			max: 25,
			value:8,
			step:0.016666667,
			slide: changeStartHour
	});
	$( "#startHour" ).val( real2hour(Number($( "#slider-hour-vertical" ).slider( "value" ))));
						
//    				$.datepicker.setDefaults( $.datepicker.regional[ "fr" ] ); // �a ne marche pas !!!
	$("#datepicker").datepicker({firstDay: 1, dateFormat: "dd/mm/yy", onSelect:changeDate }).datepicker( "setDate", new Date());

	// initialize control variables and set interactions of IHM
	var tags = new Array;
	for (var i=0; i<stops.length; i++) if (stops[i].isActive) tags.push(stops[i].name + " " +stops[i].code);
	// on pourrait mettre plut�t le nom de la parentStation: 
	//	if (withOnlyParentStations)	tags.push(stops[stopIndex[stops[i].parentStation]].name + " " +stops[i].code);

	$("#startStation").autocomplete({
		source: tags, //Object.keys(stopName2id),
		select: function( event, ui ) {
			changeStartId(stopName2id[ui.item.value]);
		},
		response: function( event, ui ) { // TO BE REMOVED?
			//if (ui.content.length<20) 
			for (var k=0; k<ui.content.length; k++){
				stops[stopName2id[ui.content[k].value]].circle.setStyle({fillColor: "#CC0099", fillOpacity:0.8});
			}
		},
		focus: function( event, ui ){
			stops[stopName2id[ui.item.value]].circle.openPopup();
		}
	});

	console.log("Finished createControls!");
}

function initMapControls(){
	highLightedPath = L.polyline([stops[1]], {clickable: false, color:"blue", opacity:1}).addTo(network);
	
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
			info.update("<h4>Station " + stops[e.target.id].name+ " : " + Math.floor(60*(arrivalTime[e.target.id]-startHour)) + " minutes</h4>" + pathDescription(getPath(e.target.id)));
			highLightStopSequence(getDetailedStopSequence(e.target.id));
		});
		stops[i].circle.on('mouseout', function(e){
			highLightedPath.setLatLngs([stops[startId]]);
			info.update();
		});
	}
	// route controls:
	isActiveRoute = new Array(routes.length);
	activeRouteSpans = new Array(routes.length);
	for(var i=0; i<routes.length; i++){
		var s = $("<span class=\"routeCheck\" id=\""+i+"\">"+routes[i].shortName+"</>").css({"background-color":activeRouteCheckColor}); // changer line->route dans le css et le php!
		s.click(function(){toggleRouteActivity($(this).attr('id'));});
		$("#activeLines").append(s);// changer line->route dans le css et le php!
		activeRouteSpans[i] = s;
		isActiveRoute[i] = true;
	}
	startApp();
}


function startApp(){
	startId = 97; // arbitrary: Capitole
	vWalk = 3; //km/h
	readDate(); // defines global variable: date, weekDay
	startHour = $('#slider-hour-vertical').slider("value");
	maxMinute = $("#slider-minute-vertical").slider("value");
	createAccessibleZones();
	setMapInteractions(); // defines global variable: info

	computeShortestPath(); // defines global variables: arrivalTime, comesFrom
	drawAccessible();	
	map.spin(false);
}


function isOn(service, date){
	return(((service.isOnByDay[weekDay]) && (service.startDate <= date) && (service.endDate >= date) && (service.exceptions[date]!=2)) || (service.exceptions[date]==1));
}

function isOn2(service){
console.log("Service: "+service.originalId);
console.log("service.isOnByDay: "+service.isOnByDay[weekDay]);
console.log("service.startDate: "+service.startDate);
console.log("service.endDate: "+service.endDate);
console.log("service.exception: "+service.exceptions[date]);
	return(((service.isOnByDay[weekDay]) && (service.startDate <= date) && (service.endDate >= date) && (service.exceptions[date]!=2)) || (service.exceptions[date]==1));

}


function desactivateUnlinkedStops(){
	for(var i=0; i<stops.length; i++) if (stops[i].subRoutes.length==0) stops[i].isActive = false;
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


function computeDwalk(){
	var startTime = performance.now();
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
	console.log("computeDwalk: "+(performance.now()-startTime));	
}


function checkData(){
	for (var i=0; i<subRoutes.length; i++){
		for(var j=0; j<subRoutes[i].timeTable.length; j++){
			for (var k=0; k<subRoutes[i].timeTable[j].length; k++){
				if (subRoutes[i].timeTable[j][k] === undefined){
					console.log("subRoute "+i + " trip "+j + " stop "+ k + " routeId = " + subRoutes[i].routeId);
				}
			}
		}
	}
	// -> pb sur la ligne 105: les stopSequence 0 et 1 n'existent pas !!!
	
	console.log("Number of stops: "+stops.length);
	console.log("Number of routes: "+routes.length);
	console.log("Number of subRoutes: "+subRoutes.length);
	var nbSubRoutesPerRoute = new Array;
	for(var i=0; i<routes.length; i++){
		tmp=0;
		for (var j in routes[i].subRoutes) ++tmp;
		if (tmp in nbSubRoutesPerRoute) ++nbSubRoutesPerRoute[tmp];
		else nbSubRoutesPerRoute[tmp]=1;
	}
	console.log(nbSubRoutesPerRoute);
	// [1: 3, 2: 70, 3: 6, 4: 12, 5: 1, 6: 4, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 2, 14: 1, 17: 1] 
	
	var nbWalkingNeighbors = new Array;
	for(var i=0; i<stops.length; i++){
		tmp=0;
		for (var j in dWalk[i]) ++tmp;
		if (tmp in nbWalkingNeighbors) ++nbWalkingNeighbors[tmp];
		else nbWalkingNeighbors[tmp]=1;
	}
	console.log(nbWalkingNeighbors);	
	
	var nbActiveStops = 0;
	for (var i=0; i<stops.length; i++) if (stops[i].isActive) ++nbActiveStops;
	console.log("nb of active stops: " + nbActiveStops);
}

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

// create the map
activeNodeColor = "#FFCC66";
inactiveNodeColor = "gray";
activeRouteColor =  "#4f8598";// "#009933";
inactiveRouteColor = "#a9c5d0";
highlightRouteColor = "#000"; //"#009933";
activeRouteCheckColor = "#FFA200"; //"#4f8598";
inactiveRouteCheckColor = "#a9c5d0";


//WARNING: tr�s rudimentaire !
function findShapeIndex(stopIndices){// in: array of latLng, out: the most probable corresponding shape index 
	var k=0; while (!(k in stopIndices)) ++k; // because subRoutes[19].stops has no elements 0 and 1...
	var deb = stops[stopIndices[k]];
	var fin = stops[stopIndices[stopIndices.length-1]];  
	var shapeIndex = 0;
	var minError = Infinity;
	for(var i=0; i<shapes.length; i++){
		var curError = Math.max(distance(deb, shapes[i].stops[0]), distance(fin, shapes[i].stops[shapes[i].stops.length-1]));
		if (curError < minError){
			minError = curError;
			shapeIndex = i;
		}		
	}
	if (minError<0.5)
		return(shapeIndex);	
	else{
		console.log("no satisfactory shape found! best is shapeIndex="+shapeIndex+", but error is "+ minError+ "km");
		// correctif bug donn�es ad hoc!!!
		if (stopIndices[2]==3613 && stopIndices[stopIndices.length-1]==3030){
			return(19);
		}
		// fin correctif bug donn�es !
		return(shapeIndex);	
	}
}


function findSubRouteId(stopArray){// in: array of latLng, out: the most probable corresponding subRoute Id 
	var deb = stopArray[0];
	var fin = stopArray[stopArray.length-1];  
	var subRouteId = 0;
	var minError = Infinity;
	for(var i=0; i<subRoutes.length; i++){
		var k=0; while (!(k in subRoutes[i].stops)) ++k; // because subRoutes[19].stops has no elements 0 and 1...
		var curError = Math.max(distance(deb, stops[subRoutes[i].stops[k]]), distance(fin, stops[subRoutes[i].stops[subRoutes[i].stops.length-1]]));
		if (curError < minError){
			minError = curError;
			subRouteId = i;
		}		
	}
	return(subRouteId);
}

function affShapes(){
	for (var i=0; i<shapes.length; i++){
		shapes[i].polyLine = new L.polyline(shapes[i].stops, {color: 'red'}).addTo(map);
		shapes[i].subRouteId = findSubRouteId(shapes[i].stops);
		if (subRoutes[shapes[i].subRouteId].polyLine) console.log("ERROR: conflicting shapes for shapes["+i+"] : "+shapes[i].polyLine.subRouteId+ "already assigned a polyline!!!");
		// subRoutes[pl.subRouteId].polyLine = shapes[i].polyLine;
	}
	//load4();
}


function createAccessibleZones(){
	accessibleZones = new L.LayerGroup();
	accessibleZones.circles = new Array;
	for(var i=0; i<stops.length; i++) if (stops[i].isActive){
		//var zone = new L.circle(stops[i], 0, {"stroke": false, "fillOpacity":0.1, fillColor:"#F0F0F0" , clickable: false});
		var zone = new L.circle(stops[i], 0, {"stroke": false, "fillOpacity":0.1, fillColor:"#FFCC99" , clickable: false});
		accessibleZones.circles.push(zone);
		accessibleZones.addLayer(zone);
	}
	accessibleZones.addTo(network);
}

// IHM

function changeMaxMinute(e){// affects global variable: maxMinute
	maxMinute = $('#slider-minute-vertical').slider("value");
	console.log("maxMinute : "+maxMinute+"\n");
	drawAccessible();
}

function changeStartHour(event, ui ){// affects global variable: startHour
	startHour = Number(ui.value);
	$( "#startHour" ).val(real2hour(startHour)); 
	console.log("startHour : "+startHour+"\n");
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
	info.update('<h4>Ligne '+routes[subRoute.routeId].shortName+ "</h4> " + routes[subRoute.routeId].longName);
}

function resetHighlightRoute(e) {
	var color = isActiveRoute[subRoutes[e.target.subRouteId].routeId] ? activeRouteColor:inactiveRouteColor;
	e.target.setStyle({color:color, opacity:0.6});
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
			click:function(e){toggleRouteActivity(subRoutes[e.target.subRouteId].routeId);},
			mouseover: highlightRoute,
			mouseout: resetHighlightRoute
		});
		polylineAlreadySeen[shapes[subRoutes[i].shapeId].polyline._leaflet_id] = 1;
	}
}

// compute the shortest paths

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

	var startTime = performance.now();
	arrivalTime = new Array(stops.length);
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

		for(var i=0; i<stops[active].subRoutes.length; i++){
			var subRouteId = stops[active].subRoutes[i].subRouteId;
			if (isActiveRoute[subRoutes[subRouteId].routeId]){
				var timeTable = subRoutes[subRouteId].timeTable;
				var frequencies = subRoutes[subRouteId].frequencies;
				var serviceIds = subRoutes[subRouteId].serviceIds;
				var posInSubRoute = stops[active].subRoutes[i].posInSubRoute;
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
								checkIfBetter(dest, arrivalTime[active] + timeToDest, subRouteId); // add a small delay to step out of the station?
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
	console.log("computeShortestPath: "+(performance.now()-startTime));
}



function drawAccessible(){
	var startTime = performance.now();	
	for(var i=0; i<stops.length; i++) if (stops[i].isActive) {
		if (arrivalTime[i] < startHour + maxMinute/60){
			var myColor = val2color((arrivalTime[i] - startHour)/(maxMinute/59));
			stops[i].circle.setStyle({fillColor:myColor, fillOpacity:1}); 
		}
		else{
			stops[i].circle.setStyle({fillColor:inactiveNodeColor, fillOpacity:0.5}); 
		}
	}
	console.log("drawAccessible: "+(performance.now()-startTime)+"maxMinute :"+maxMinute+" startHour :"+startHour);
	//drawAccessibleZones();
}

function drawAccessibleZones(){
	var startTime = performance.now();	
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
	console.log("drawAccessibleZones: "+(performance.now()-startTime));	
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


function pathDescription(p){
	//return(p.map(function(x){return( (x.subRouteId>=0 ? "[via l. "+routes[subRoutes[x.subRouteId].routeId].shortName +"]":"->")+ stops[x.stopId].name);}));
	s = "<table>\n<tr><th></th><th>Heure</th><th>Station</th></tr>\n";
	for(var i in p){
		s += "\n<tr>";
		s += "<td>" + (p[i].subRouteId>=0 ? "[l. "+routes[subRoutes[p[i].subRouteId].routeId].shortName +"]":"->") + "</td>";
		s += "<td>" + real2hour(arrivalTime[p[i].stopId]) + "</td>";
		s += "<td>" + stops[p[i].stopId].name + "</td></tr>\n";
	}
	s += "</table>\n";
	return(s);
}


function affStopInfo(stopId){ // including childStations
	$("#stopInfoDate").html($.datepicker.formatDate( "dd/mm", $( "#datepicker" ).datepicker( "getDate" ))); // changer la langue, puis format DD d mm 
	
	$("#stopInfoId").html(stops[stopId].name);

	stopIds = [stopId];
	for (var i in stops[stopId].childStations) stopIds.push(stops[stopId].childStations[i]);
	
	var tt = "";
	for (var k=0; k<stopIds.length; k++){
		s = stops[stopIds[k]];
		for (var i in s.subRoutes){
			posInSubRoute = s.subRoutes[i].posInSubRoute;
			subRoute = subRoutes[s.subRoutes[i].subRouteId];
			tt = tt + "<br/><b>"+ subRoute.id+" Ligne " + routes[subRoute.routeId].shortName + " de " + stops[subRoute.stops[0]].name+ " vers " + stops[subRoute.stops[subRoute.stops.length-1]].name + " : </b><br/>\n";
			
			//tt = tt + "<br/><h3>Ligne " + routes[subRoute.routeId].shortName + " de " + stops[subRoute.stops[0]].name+ " vers " + stops[subRoute.stops[subRoute.stops.length-1]].name + " : </h3>\n<table>";
			var l=0;
			for(var j in subRoute.timeTable) {
				if(isOn(services[subRoute.serviceIds[j]], date)){
					//console.log(isOn2(services[subRoute.serviceIds[j]], date)+" "+real2hour(subRoute.timeTable[j][posInSubRoute]));
					//tt= tt+ "<td>"+isOn2(services[subRoute.serviceIds[j]], date)+"</td>";
					if (l % 15 == 0 ) tt = tt + "<br/>" + real2hour(subRoute.timeTable[j][posInSubRoute]);
					else tt = tt  + ", "+ real2hour(subRoute.timeTable[j][posInSubRoute]);
					if (isFinite(subRoute.frequencies[j].freq)) tt = tt + " puis toutes les " + Math.round(60*subRoute.frequencies[j].freq) + " minutes";
					l+=1;
				}
			}
			tt = tt + "<br/>\n";
		}
	}
	map.scrollWheelZoom.disable();
	tt="<div class=\"timeTable\"><a  href=# onClick='lineInfo.update(\"Clici droit pour avoir les horaires de la ligne ou de passage au stop\");map.scrollWheelZoom.enable();'><img src=\"images/icons/Close.png\" width=\"40px\" align=\"right\"/></a><br/><br/>"+tt+"</div>";
	lineInfo.update(tt);
}



function affRouteInfo(routeId){
	$("#routeInfoDate").html($.datepicker.formatDate( "dd/mm", $( "#datepicker" ).datepicker( "getDate" ))); // changer la langue, puis format DD d mm 
	
	$("#routeInfoId").html(routes[routeId].shortName);
	var tt = "";
	var num = 0;
	for (var i in routes[routeId].subRoutes){
		subRoute = subRoutes[routes[routeId].subRoutes[i]];
		tt = tt + "<br/><b>Parcours " + (++num) + " : \n</b><table class=\"times\">";
		for(var j in subRoute.stops){
			tt = tt + "<tr><th>" + stops[subRoute.stops[j]].name + "</th>";
			for (var k in subRoute.timeTable){
				if(isOn(services[subRoute.serviceIds[k]], date)){
					if (isNaN(subRoute.frequencies[k].freq)){
						tt = tt + "<td>" + real2hour(subRoute.timeTable[k][j]) + "</td>";
					}
					else{
						var departureTime = subRoute.timeTable[k][j];
						tt = tt + "<td>" + real2hour(departureTime);
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
	tt="<div class=\"timeTable\"><a  href=# onClick='lineInfo.update(\"Clic droit pour avoir les horaires de la ligne ou de passage au stop\");map.scrollWheelZoom.enable();'><img src=\"images/icons/Close.png\" width=\"40px\" align=\"right\"/></a><br/><br/>"+tt+"</div>";
	lineInfo.update(tt);
	
	
}






function dayMovie(){
	continueDayMovie = true;
	var oldStartHour = startHour;
	var sleepDelay = 100;
	var dt = 0.1;	
	function iter(){
		startHour += dt;
		$('#slider-hour-vertical').slider("value", startHour);
		$( "#startHour" ).val(real2hour(startHour));
		computeShortestPath();
		drawAccessible();			
		if (startHour<25 && continueDayMovie) setTimeout(iter, sleepDelay); 
	}
	startHour = 4;
	iter();
	startHour = oldStartHour;
	computeShortestPath();
	drawAccessible();		
}


filmOn=0;

function change()
    {
    var aide = document.getElementById("vid") ;
    if (filmOn==0){        	
		aide.innerHTML = "Arr&ecirc;ter le film" ; 
		dayMovie();
		filmOn=1;
		}
	else {
		aide.innerHTML = "Film de ma journ&eacute;e" ; 
		stop();
		filmOn=0;
	}
       
    }
function stop(){
	continueDayMovie=false;
}