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
include('on_off.js');

debug_mode = true;

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


function isOn(service, date){
	return(((service.isOnByDay[weekDay]) && (service.startDate <= date) && (service.endDate >= date) && (service.exceptions[date]!=2)) || (service.exceptions[date]==1));
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
