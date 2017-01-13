/**
 * Created by anthony on 16/12/16.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function (client) {
    console.log("client connected");

    client.on("outputChange", function (data) {
        console.log(data);
        client.broadcast.emit("inputChange", data);
    });
    client.on("wallTable", function (data) {
        console.log("wall:", data);
        client.broadcast.emit("wallVR", data);
    });

    client.emit("wallVR", [
        {
            id: 1,
            x: 3,
            y: 3,
            length: 34,
            angle: 0
        },{
            id: 2,
            x: 37,
            y: 3,
            length: 34,
            angle: 270
        },{
            id: 3,
            x: 3,
            y: 3,
            length: 34,
            angle: 270
        },{
            id: 4,
            x: 3,
            y: 37,
            length: 34,
            angle: 0
        }
    ]);
});

app.get('/', function (req, res) {
    return res.status(200)
        .json({value: "it works !"})
});

server.listen(4200);