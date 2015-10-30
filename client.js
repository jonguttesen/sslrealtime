    'use strict';

    var net = require('net');

    var AisDecode = require('ggencoder').AisDecode;

    var Firebase = require('firebase');
    var dataUrl ='{DATA URL}';
    var dataRef = new Firebase(dataUrl);
    var routesRef = dataRef.child('routes');
    var vehiclesRef = dataRef.child('vehicles');

    var port = '{PORT}';
    var host = '{SERVER}';

    var sleepTime = 1000 * 60 * 5; //5 mins

    var client = new net.Socket();

    client.connect(port, host, function() {
;
    });

    var session;

    var nameByMmsi = {
        '': '',
    };
    var routeByName = {
        '':'',
    };

    function initRoutes( routesRef ) {
        for (var i = routes.length - 1; i >= 0; i--) {
          //  routesRef.set( routes[i] );        
            };
    }
    var lastTime = new Date();
    var currTime;

    client.on('data', function(data) {
        currTime = new Date();
        if( (lastTime.getTime() + sleepTime) < currTime.getTime() ) {
            console.log('return');
            return;
        }
        lastTime = new Date();
        var strr = new String(data).split("!AIVDM");
        var aivdm = "!AIVDM" + strr[1];
        var ais = new AisDecode(aivdm, session);
        //console.log(ais);
        //console.log(aivdm);
        //console.log('data:' + data);
        //console.log('timestamp: ' + timestamp);
        //console.log('status: ' + status);

        var vehicleId = nameByMmsi[ais.mmsi];
        var routeId = routeByName[vehicleId];
        console.log(ais.mmsi);
        console.log(vehicleId);
        console.log(routeId);
        var routeRef = routesRef.child( routeId );  
        if( routeRef == null )
            return;
        var vehicle = { };
        vehicle[vehicleId] = true;  
        routeRef.update( vehicle );
        var vehicleRef = vehiclesRef.child( vehicleId );
        var heading = typeof(ais.cog) != 'undefined' ? ais.cog : 0;
        var id = ais.mmsi;
        var dirTag = '';
        var lat = ais.lat;
        var lon = ais.lon;
        var speed = ais.sog / 0.539956803456; //km/h
        var str = new String(data).split(",");
        var y = str[2];
        var m = str[3];
        var d = str[4];
        var h = str[5];
        var min = str[6];
        var sec = str[7];
        var ms = str[8];
        var timestamp = new Date(y, m - 1, d, h, min, sec, ms);
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

    });

    client.on('error', function(err) {
        console.log('error: ' + err);
    });

    client.on('close', function() {
        console.log('closed');
    });
