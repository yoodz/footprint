var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
var coordtransform = require('coordtransform')

var connection = mysql.createConnection({
    host: '101.132.98.93',
    user: 'root',
    password: '123456',
    database: 'imageIndex'
});
connection.connect();

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