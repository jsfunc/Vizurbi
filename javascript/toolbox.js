debug_mode = true;
inactiveNodeColor = "gray";


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


function readDate(){ // affects global variables: date, weekDay
	var dayNb = {'Mon':0, 'Tue':1, 'Wed':2, 'Thu':3, 'Fri':4, 'Sat':5, 'Sun':6};
	date = $.datepicker.formatDate( "yymmdd", $( "#datepicker" ).datepicker( "getDate" ));
	weekDay = dayNb[$.datepicker.formatDate( "D", $( "#datepicker" ).datepicker( "getDate" ))];
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

//PEDROLITO - ligne de bus dans l'ordre
function compareBus(a,b){
	return a.shortName - b.shortName;
}