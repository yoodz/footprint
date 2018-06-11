var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
var coordtransform = require('coordtransform')

var db_config = {
    host: 'localhost',
      user: 'root',
      password: '*****',
      database: 'imageIndex'
  };

var connection;
function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}
handleDisconnect();

app.get('/listUsers', function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let sql = 'SELECT * FROM images'
    connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        for (let i = 0; i < results.length; i++) {
            console.log('The solution is: ', results[i]);
            var newGps = formatDatee(results[i].gPSLatitude, results[i].gPSLongitude);
            results[i].newGps = newGps;
        }
        res.jsonp(results)
    });
})

var formatDatee = function (gSLatitude, gPSLongitude) {
    var olat = gSLatitude.split(', ');
    var olng = gPSLongitude.split(', ');
    var lat = 0, lng = 0, coord;
    for (var i = 0; i < olat.length; i++) {
        lat += olat[i] / Math.pow(60, i);
        lng += olng[i] / Math.pow(60, i);
    }
    lat = 'N' == 'S' ? -lat : lat;
    lng = 'E' == 'W' ? -lng : lng;
    coord = coordtransform.wgs84togcj02(lng, lat);
    console.log(coord)
    return coord;
}

var server = app.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})