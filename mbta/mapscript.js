//mapscript.js

var myLat = 0;
var myLng = 0;
var request = new XMLHttpRequest();
var me = new google.maps.LatLng(myLat, myLng);

// set original center and zoom
var originalOptions = {
	zoom: 13, 
	center: me,
	mapTypeId: google.maps.MapTypeId.ROADMAP
};
		
var map;
var myMarker;
var infowindow = new google.maps.InfoWindow();
var nearestDistance;
var nearestStationName;
var nearestLat;
var nearestLng;
var seconds;
var minutes;
// hard code station info and coordinates
var StationArray = [
    ["Alewife", 42.395428, -71.142483],
    ["Davis",  42.39674, -71.121815],
    ["Porter Square",  42.3884, -71.11914899999999],
    ["Havard Sqaure",  42.373362, -71.118956],
    ["Central Square",  42.365486, -71.103802],
    ["Kendall/MIT",  42.36249079, -71.08617653],
    ["Charles/MGH", 42.361166, -71.070628],
    ["Park Street",  42.35639457, -71.0624242],
    ["Downtown Crossing",  42.355518, -71.060225],
    ["South Station", 42.352271, -71.05524200000001],
    ["Broadway",  42.342622, -71.056967],
    ["Andrew", 42.330154, -71.057655],
    ["JFK/UMass",  42.320685, -71.052391],
    ["Savin Hill",  42.31129, -71.053331],
    ["Fields Corner",  42.300093, -71.061667],
    ["Shawmut", 42.29312583, -71.06573796000001],
    ["Ashmont",  42.284652, -71.06448899999999],
    ["North Quincy", 42.275275,  -71.029583],
    ["Wollaston", 42.2665139, -71.0203369],
    ["Quincy Center", 42.251809,  -71.005409],
    ["Quincy Adams", 42.233391,  -71.007153],
    ["Braintree", 42.2078543,  -71.0011385],
];

// initialize Googlemap, retrieve my location
function init() {		
	map = new google.maps.Map(document.getElementById("map_page"), originalOptions);
	getMyLocation();
}
	
function getRad(deg) {
	return deg * (Math.PI/180);
}

// haversine formula 
function getDistance (lat1, lng1, lat2, lng2) {
	var R = 3959;   // mile
	var dLat = getRad(lat2-lat1);  
	var dLon = getRad(lng2-lng1);  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(getRad(lat1)) * Math.cos(getRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; 
	return d;
}
	
// retrieve my location using navigator.geolocation
function getMyLocation() {
if (navigator.geolocation) { 
					navigator.geolocation.getCurrentPosition(function(position) {
						myLat = position.coords.latitude;
						myLng = position.coords.longitude;

						request.open("GET","https://guarded-depths-64937.herokuapp.com/redline.json", true);
						request.onreadystatechange = renderStation;
						request.send(null); 
					});
				}
				else { //failsafe
					alert("Geolocation is not available on your browser.");
				}
}

// HUH! I really, really do not want to hard code the coordiates again - but it seems to be
// part of the API. I know I could write a loop... Please forgive me for the one-time neglegence
function renderRedLine() {
//Alewife - Ashmont
	var AshmontLine = [
        {lat: 42.395428,lng: -71.142483}, // Alewife
        {lat:42.39674, lng:-71.121815}, // Davis'
        {lat:42.3884, lng:-71.11914899999999}, // Porter Square
        {lat:42.373362, lng:-71.118956}, // Havard Sqaure
        {lat:42.365486, lng:-71.103802}, // Central Square
        {lat:42.36249079, lng:-71.08617653}, // Kendall/MIT  
        {lat:42.361166, lng:-71.070628}, // Charles/MGH
        {lat:42.35639457, lng:-71.0624242}, // Park Street
        {lat:42.355518, lng:-71.060225}, // Downtown Crossing
        {lat:42.352271, lng:-71.05524200000001}, // South Station
        {lat:42.342622, lng:-71.056967}, // Broadway
        {lat:42.330154, lng:-71.057655}, // Andrew
        {lat:42.320685, lng:-71.052391}, // JFK/UMass
        {lat:42.31129, lng:-71.053331}, // Savin Hill
        {lat:42.300093,lng: -71.061667}, // Fields Corner
        {lat:42.29312583, lng:-71.06573796000001}, // Shawmut
        {lat:42.284652, lng:-71.06448899999999}, // Ashmont
    ]; 

   	var Ashmont = new google.maps.Polyline({
       	path: AshmontLine,
       	strokeColor: '#FF0000',
   		strokeOpacity: 1.0,
   		strokeWeight: 7
   	});		
  	Ashmont.setMap(map);

// JFK - Braintree
  	var BraintreeLine = [
       	{lat: 42.320685, lng: -71.052391}, // JFK/UMass
       	{lat: 42.275275, lng: -71.029583}, //North Quincy
       	{lat: 42.2665139, lng:-71.0203369}, //Wollaston
       	{lat: 42.251809, lng: -71.005409}, //Quincy Center
       	{lat: 42.233391, lng: -71.007153}, //Quincy Adams
       	{lat: 42.2078543, lng: -71.0011385}, //Braintree
  	];
       
   	var Braintree = new google.maps.Polyline({
       	path: BraintreeLine,
       	strokeColor: '#FF0000',
       	strokeOpacity: 1.0,
       	strokeWeight: 7
   	});
   	Braintree.setMap(map);     
}

// parse json file, render stations and place them on maps
// enable clicks on stations
function renderStation() {

	renderRedLine();
	renderUser();

	// if json is not successfully opened, refresh the entire page and reopen all files
	if (request.status != 200) {
    	console.log('404');
    	window.location.reload(true); 
    }

    // if json successfully opens
	if(request.readyState == 4 && request.status == 200) {
		var theScheduleData = JSON.parse(request.responseText);

		// place stations on map
		for(var i = StationArray.length - 1; i >= 0; i--) {
			var stationName = StationArray[i][0];
			var stationPositionLat = StationArray[i][1];
           	var stationPositionLng = StationArray[i][2];
			var stationPosition = new google.maps.LatLng(stationPositionLat,stationPositionLng);
			var stationMarker = new google.maps.Marker({
				position: stationPosition,
				icon: "mbta.png",
			});
			stationMarker.setMap(map);

			// -1 as signals for invalid data
			var AlewifeMinutes = -1;
			var AshmontMinutes = -1;
			var BraintreeMinutes = -1;
			
			// retrieve prediction arrival time for each station
			for (var j = 0; j < theScheduleData["TripList"]["Trips"].length; j++) {
				for (var k = 0; k < theScheduleData["TripList"]["Trips"][j]["Predictions"].length; k++) {

	    			if (theScheduleData["TripList"]["Trips"][j]["Predictions"][k]["Stop"] == stationName) {
	    				// trains to Alewife
       					if (theScheduleData["TripList"]["Trips"][j]["Destination"] == "Alewife") {
           					seconds = theScheduleData["TripList"]["Trips"][j]["Predictions"][k]["Seconds"];
       		   				minutes = (seconds/60).toFixed(1);

       		   				if (Number(minutes) > 0 && Number(AlewifeMinutes) == -1) {
           						AlewifeMinutes = minutes; 
		           			}
		           			if (Number(minutes) > 0 && minutes < Number(AlewifeMinutes)) {
		           				AlewifeMinutes = minutes; 
		           			}

		           		// trains to Ashmont
						} else if (theScheduleData["TripList"]["Trips"][j]["Destination"] == "Ashmont") {
							seconds = theScheduleData["TripList"]["Trips"][j]["Predictions"][k]["Seconds"];
           					minutes = (seconds/60).toFixed(1);

           					if (Number(minutes) > 0 && Number(AshmontMinutes) == -1) {
           						AshmontMinutes = minutes; 
		           			}

		           			if (Number(minutes) > 0 && minutes < Number(AshmontMinutes)) {
		           				AshmontMinutes = minutes; 
		           			}

		           		// trains to Braintree
						} else if (theScheduleData["TripList"]["Trips"][j]["Destination"] == "Braintree") {
							seconds = theScheduleData["TripList"]["Trips"][j]["Predictions"][k]["Seconds"];
           					minutes = (seconds/60).toFixed(1);
      
           					if (Number(minutes) > 0 &&Number(BraintreeMinutes) == -1) {
           						BraintreeMinutes = minutes; 
		           			}
		           			if (Number(minutes) > 0 && minutes < Number(BraintreeMinutes)) {
		           				BraintreeMinutes = minutes; 
		           			}
						}
					}
				}
			}
			
			// set content for stations' infowindows
			var stationString = "<h1>" + stationName + " Red Line Schedule" 
								+ "</h1>" + "<p>" + "The next red line train to Alewife will arrive in " 
								+ AlewifeMinutes + " minutes. <br> The next red line train to Ashmont will arrive in " 
								+ AshmontMinutes + " minutes. <br> The next red line train to Braintree will arrive in " 
								+ BraintreeMinutes + " minutes. </p>";
          		
       		stationMarker.content = stationString;
      
           	google.maps.event.addListener(stationMarker, 'click', function() {
           		infowindow.close();
           		infowindow.setContent(this.content);
               	infowindow.open(map, this);
			});           	
   		}
	
    } 
}
		
// render the user's locations, enable click feature
function renderUser() {
	me = new google.maps.LatLng(myLat, myLng);
	map.panTo(me);

	myMarker = new google.maps.Marker({
		position: me,
	});

	myMarker.setMap(map);

	var index = 0;
	var distance = -1;
	for(var i = 0; i < StationArray.length; i++) {
		var stationPositionLat = StationArray[i][1];
		var stationPositionLng = StationArray[i][2];
		if (Number(distance) ==  -1) {
			distance = getDistance(stationPositionLat, stationPositionLng, myLat, myLng).toFixed(1);
			index = i;
		}
		if (Number(distance) > getDistance(stationPositionLat, stationPositionLng, myLat, myLng).toFixed(1)) {
			distance = getDistance(stationPositionLat, stationPositionLng, myLat, myLng).toFixed(1);
			index = i;
		}
	}

	// record the nearest station info
	nearestStationName = StationArray[index][0];
	nearestDistance = distance;
	nearestLat = StationArray[index][1];
	nearestLng = StationArray[index][2];
	
	// set infowindow content
	var contentString = "<h1>" + "Nearest MBTA Red Line Station"+ "</h1>"
		                + "<p>" + "The nearest red line station is " + nearestStationName 
			            + "; the distance is " + nearestDistance 
			            + " miles away." + "</p>";
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	}); 
		
	google.maps.event.addListener(myMarker, 'click', function() {
		infowindow.open(map, myMarker);
		// Connecting user to the nearest station 
	});

	// render polyline between me and the nearest station	
	var myNearestStation = [
		{lat: myLat, lng: myLng},
		{lat: nearestLat, lng: nearestLng},
	];
	nearestStationLine = new google.maps.Polyline({
		path: myNearestStation,
		strokeColor: '#0000FF',
		strokeOpacity: 1.0,
		strokeWeight: 4 
	});
	nearestStationLine.setMap(map);

}


