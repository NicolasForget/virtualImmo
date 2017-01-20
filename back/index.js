/**
 * Created by anthony on 16/12/16.
 */

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');
var sofas = {
    0 : {
        name: "Basic Sofa",
        id: 0,
        miniature:"./furnitures/sofas/basic_sofa/basic_sofa.png",
        model3D: "./furnitures/sofas/basic_sofa/basic_sofa_3D.json",
        textures_availables: {
            beige : {
                name: 'Beige clair',
                topImg : "./furnitures/sofas/basic_sofa/top_beige.png",
                "all": "./furnitures/sofas/basic_sofa/toile_beige.jpg",
            },
            gris: {
                name: 'Gris clair',
                topImg : "./furnitures/sofas/basic_sofa/top_gris.png",
                "all": "./furnitures/sofas/basic_sofa/toile_grise.jpg",
            },
            noir : {
                name: 'Antracite',
                topImg : "./furnitures/sofas/basic_sofa/top_noir.png",
                "all": "./furnitures/sofas/basic_sofa/toile_noire.jpg",
            },
        },
        size: {
            x: 2,
            z: 1,
        }
    }
};

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
    client.on("tableWantFurniture", function(furniture_type){
        console.log("furniture_type");
        switch(furniture_type){
            case "sofa":
                var available_sofas = [];
                var keys = Object.keys(sofas);
                for (var i = 0; i < keys.length; i++){
                    var sofa = {};
                    sofa.name = sofas[keys[i]].name;
                    sofa.id = sofas[keys[i]].id;

                    var img = fs.readFileSync(sofas[keys[i]].miniature);
                    // convert binary data to base64 encoded string
                    sofa.miniature = new Buffer(img).toString('base64');

                    var keys_texture = Object.keys(sofas[keys[i]].textures_availables);
                    sofa.textures = {};
                    sofa.size = sofas[keys[i]].size;
                    for (var j = 0; j < keys_texture.length; j++){

                        var top = fs.readFileSync(sofas[keys[i]].textures_availables[keys_texture[j]].topImg);
                        sofa.textures[keys_texture[j]] = {
                            name : sofas[keys[i]].textures_availables[keys_texture[j]].name,
                            id: keys_texture[j],
                            topImg : new Buffer(top).toString('base64')
                        };
                    }
                    available_sofas.push(sofa);
                    client.emit("availableSofas", available_sofas);
                }
                break;
            default:
                client.emit("err", "furniture not found");
        }
    });
});

app.get('/', function (req, res) {
    return res.status(200)
        .json({value: "it works !"})
});

server.listen(4200);