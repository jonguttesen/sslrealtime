
var http = require('http');
var Firebase = require('firebase');
var dataRef = new Firebase('https://blistering-inferno-3618.firebaseio.com');
var routesRef = dataRef.child('routes');
var vehiclesRef = dataRef.child('vehicles');

http.createServer( function(req, res) {
	

	res.writeHead(200, {
		'Content-Type': 'text/plain'
	});

	res.end('Hello Node');

}).listen(1337, '127.0.0.1');


//https://blistering-inferno-3618.firebaseio.com/

function fetchAIS(url, routeId) {
	//"http://api.aprs.fi/api/get?name=XPWG&what=loc&apikey=77762.oOV3xGkufmrSN&format=json"

	http.get(url, function(res) {
	    var body = '';

	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	        var fbResponse = JSON.parse(body)
	        console.log("Got response: ", fbResponse.result);
	        for( i=0;i < fbResponse.found; i++) {
	        	storeAIS( fbResponse.entries[i], routeId );
	    	}
	    });
	}).on('error', function(e) {
	      console.log("Got error: ", e);
	});

}

function storeAIS( AIS, routeId ) {

	 var vehicleId = AIS.name;

	 var routeRef = routesRef.child( routeId );	 
	 var vehicle = { };
	 vehicle[vehicleId] = true;	 
	 routeRef.update( vehicle );

	 var vehicleRef = vehiclesRef.child( vehicleId );
	 var heading = AIS.heading;
	 var id = AIS.name;
	 var dirTag = "Ferjulegan í Syðradali - Ferjulegan á stongunum í Klaksvík";
	 var lat = AIS.lat;
	 var lon = AIS.lng;
	 var speed = AIS.speed; //km/h
	 var timestamp = AIS.lasttime;
	 var vType = "Ferry";
	 var routeTag = routeId;
 	 vehicleRef.set( {
 	  "heading": heading, 
 	  "id": id, 
 	  "lat": lat, 
 	  "lon": lon, 
 	  "routeTag": routeTag, 
 	  "timestamp":  timestamp, 
 	  "vtype": vType
	 	}
	 );

}


var apikey = "API_KEY";
var url = "http://api.aprs.fi/api/get?name=231096000&what=loc&apikey=" + apikey + "&format=json";
var routeId = "56";

setInterval( fetchAIS, 60 * 1000, url, routeId );
