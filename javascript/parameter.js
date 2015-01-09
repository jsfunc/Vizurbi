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
include('on_off.js');
include('loading.js');
include('math.js');

var basicMode = true;
debug_mode = true;
activeRouteCheckColor = "#FF9100"; //"#4f8598"; //FFA200";

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


function changeDate(e){// thru readDate, affects global variables: date, weekDay
	readDate();
	computeShortestPath();
	drawAccessible();
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


/* Day movie */
function changeAnimationVelocity(event, ui){
	sleepDelay = 1000*Math.exp(-5/100*Number(ui.value));//$('#slider-animation-velocity').slider("value")));
	if (debug_mode) console.log("sleepDelay : "+sleepDelay+"\n");
}
