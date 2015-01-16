debug_mode = true;

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
	ville = getVille();
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
	if (debug_mode) console.log("loading data and starting appli!");
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
			newTrip.timesReal = new Array;
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
			_trips[tripId].timesReal[stopSequence] = readTime(String(descr[9])); 
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

