/**
 * script for the all application
 */

import $ from 'jquery/dist/jquery.min';

import TUIOManager from 'tuiomanager/core/TUIOManager';

import { radToDeg } from 'tuiomanager/core/helpers';

const tuioManager = new TUIOManager();
tuioManager.start();

const buildApp = () => {
    const width = 1500;
    const height = 750;

    /*const sofaMenuDom = d3.select("#sofaMenu");
    const tableMenuDom = d3.select("#tableMenu");
    const bedMenuDom = d3.select("#bedMenu");
    
    var sofaMenuWidget = new MenuWidget(sofaMenuDom);
    var tableMenuWidget = new MenuWidget(tableMenuDom);
    var bedMenuWidget = new MenuWidget(bedMenuDom);*/
    
    const mapWidget = new MapWidget(0, 0, width, height);
    $('#main-content').append(mapWidget.domElem);
    //mapWidget.initMap();
    initMap(width, height);
};

$(window).ready(() => {
    buildApp();
});

const sofaTagId = "A6";
const tableTagId = "B5";
const bedTagId = "20";
const editTagId = "D8";
const deleteTagId = "B4";

// ====================================================================================================================
/*
 * TUIO Map Widget
 */
// ====================================================================================================================

import TUIOWidget from 'tuiomanager/core/TUIOWidget';

class MapWidget extends TUIOWidget {

    constructor(x, y, width, height) {
        super(x, y, width, height);

        this._lastTouchesValues = {};
        this._lastTagsValues = {};

        this._domElem = document.getElementsByClassName('roomMap');
    }

    get domElem() { return this._domElem; }

    onTouchCreation(tuioTouch) {
        super.onTouchCreation(tuioTouch);
        if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
            tuioToClick(tuioTouch.x, tuioTouch.y);
            this._lastTouchesValues = {
                ...this._lastTouchesValues,
                [tuioTouch.id]: {
                x: tuioTouch.x,
                y: tuioTouch.y,
            },
        };
        }
    }

    onTagCreation(tuioTag) {
        super.onTagCreation(tuioTag);
        if (this.isTouched(tuioTag.x, tuioTag.y)) {
            var type = null;
            switch(tuioTag.id){
                case sofaTagId:
                    type = "sofa";
                    break;
                case bedTagId:
                    type = "bed";
                    break;
                case tableTagId:
                    type = "table";
            }

            if(type){
                tuioTagMenu(tuioTag.x,tuioTag.y,type);
            }

            this._lastTagsValues = {
                ...this._lastTagsValues,
                [tuioTag.id]: {
                x: tuioTag.x,
                y: tuioTag.y,
            },
        };
        }
    }

    onTagDeletion(tuioTagId) {
        super.onTagDeletion(tuioTagId);
        var type = null;
        switch(tuioTagId){
            case sofaTagId:
                type = "sofa";
                break;
            case bedTagId:
                type = "bed";
                break;
            case tableTagId:
                type = "table";
        }
        if (type){
            tuioMenuDelete(type);
        }
    }

    onTagUpdate(tuioTag) {
        if (typeof (this._lastTagsValues[tuioTag.id]) !== 'undefined') {

            var type = null;
            switch(tuioTag.id){
                case sofaTagId:
                    type = "sofa";
                    break;
                case bedTagId:
                    type = "bed";
                    break;
                case tableTagId:
                    type = "table";
            }

            if (type){
                const lastTagValue = this._lastTagsValues[tuioTag.id];
                const diffX = tuioTag.x - lastTagValue.x;
                const diffY = tuioTag.y - lastTagValue.y;

                const newX = this.x + diffX;
                const newY = this.y + diffY;



                this.moveTo(newX, newY, radToDeg(tuioTag.angle), type);
                this._lastTagsValues = {
                    ...this._lastTagsValues,
                    [tuioTag.id]: {
                    x: tuioTag.x,
                    y: tuioTag.y,
                },
            };
            }
        }
    }

    moveTo(x, y, angle = null, type) {
        tuioMenuMove(x, y, type);
        if (angle !== null) {
            rotateMenu(angle,'menu-' + type);
        }
    }
}

// ====================================================================================================================
/*
 * TUIO Menu Widget
 */
// ====================================================================================================================

/*class MenuWidget extends TUIOWidget {

    constructor(domE) {
        super(0, 0, 400, 400);

        this._lastTouchesValues = {};
        this._lastTagsValues = {};
        this._domElem = domE;
    }

    get domElem() { return this._domElem; }
    
    setX(newX){
        this._x = newX;
    }
    
    setY(newY){
        this._y = newY;
    }
    
    onTouchCreation(tuioTouch) {
        super.onTouchCreation(tuioTouch);
        if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
            tuioToClick(tuioTouch.x, tuioTouch.y);
            this._lastTouchesValues = {
                ...this._lastTouchesValues,
                [tuioTouch.id]: {
                x: tuioTouch.x,
                y: tuioTouch.y,
            },
        };
        }
    }
}*/

function tuioToClick(x,y){
    console.log("toto");
    var ev = document.createEvent("MouseEvent");
    var el = document.elementFromPoint(x,y);
    ev.initMouseEvent(
        "click",
        true /* bubble */, true /* cancelable */,
        window, null,
        x, y, 0, 0, /* coordinates */
        false, false, false, false, /* modifier keys */
        0 /*left*/, null
    );
    if (el){
        el.dispatchEvent(ev);
    }
}

// ====================================================================================================================
/*
 * TUIO Furniture Widget
 */
// ====================================================================================================================

class FurnitureWidget extends TUIOWidget {

    constructor(x, y, width, height, domE) {
        super(x, y, width, height);

        this._lastTouchesValues = {};
        this._lastTagsValues = {};
        this._domElem = domE;
    }

    get domElem() { return this._domElem; }

    onTouchCreation(tuioTouch) {
        super.onTouchCreation(tuioTouch);
        if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
            d3.select('.meubleSelected').classed("meubleSelected",false);
            this._domElem.setAttribute('class', 'meubleSelected');
            this._lastTouchesValues = {
                ...this._lastTouchesValues,
                [tuioTouch.id]: {
                x: tuioTouch.x,
                y: tuioTouch.y,
            },
        };
        }
    }

    onTouchUpdate(tuioTouch) {
        if (typeof (this._lastTouchesValues[tuioTouch.id]) !== 'undefined') {
            const lastTouchValue = this._lastTouchesValues[tuioTouch.id];

            const diffX = tuioTouch.x - lastTouchValue.x;
            const diffY = tuioTouch.y - lastTouchValue.y;

            let oldX = parseInt(this._domElem.getAttribute('transform').split(/\,|\(|\)/)[1]);
            let oldY = parseInt(this._domElem.getAttribute('transform').split(/\,|\(|\)/)[2]);

            this._x = oldX + diffX;
            this._y = oldY + diffY;
            translateMeubleSelected(this._x,this._y);

            this._lastTouchesValues = {
                ...this._lastTouchesValues,
                [tuioTouch.id]: {
                x: tuioTouch.x,
                y: tuioTouch.y,
            },
        };
        }
    }

    onTouchDeletion(tuioTouch) {
        super.onTouchDeletion(tuioTouch);
        if(d3.select(".meubleSelected")[0][0] !== null){
            translateMeubleSelectedFinished();  
        }
    }

    onTagCreation(tuioTag) {
        super.onTagCreation(tuioTag);
        if (this.isTouched(tuioTag.x, tuioTag.y)) {
            if (tuioTag.id == editTagId){
                d3.select('.meubleSelected').classed("meubleSelected",false);
                this._domElem.setAttribute('class', 'meubleSelected');
                this._lastTagsValues = {
                    ...this._lastTagsValues,
                    [tuioTag.id]: {
                    x: tuioTag.x,
                    y: tuioTag.y,
                },
            };
            }
        }
    }

    onTagUpdate(tuioTag) {
        if (typeof (this._lastTagsValues[tuioTag.id]) !== 'undefined') {
            if (tuioTag.id == editTagId){
                const lastTagValue = this._lastTagsValues[tuioTag.id];

                //const diffX = tuioTag.x - lastTagValue.x;
                //const diffY = tuioTag.y - lastTagValue.y;

                //let oldX = parseInt(this._domElem.getAttribute('transform').split(/\,|\(|\)/)[1]);
                //let oldY = parseInt(this._domElem.getAttribute('transform').split(/\,|\(|\)/)[2]);

                //this._x = oldX + diffX;
                //this._y = oldY + diffY;
                //translateMeubleSelected(this._x,this._y);
                rotateMeubleSelected(radToDeg(tuioTag.angle));

                this._lastTagsValues = {
                    ...this._lastTagsValues,
                    [tuioTag.id]: {
                    x: tuioTag.x,
                    y: tuioTag.y,
                },
            };
            }
        }
    }

    onTagDeletion(tuioTagId) {
        super.onTagDeletion(tuioTagId);
        if (tuioTagId == editTagId){
            if(d3.select(".meubleSelected")[0][0] !== null){
                translateMeubleSelectedFinished();
            }
        }else if(tuioTagId == deleteTagId){
            if(d3.select(".meubleSelected")[0][0] !== null){
                var oType = d3.select('.meubleSelected').attr("meubleType");
                var oIndex = d3.select('.meubleSelected').attr("meubleIndex");
                d3.select('.meubleSelected').remove();
                socket.emit("removeFurniture", {type : oType, index : parseInt(oIndex)});
                console.log("[removeFurniture]" + oType + " " + oIndex);
            }
        }
    }


    moveTo(x, y, angle = null) {
        /*this._x = x;
    this._y = y;
    this._domElem.css('left', `${x}px`);
    this._domElem.css('top', `${y}px`);
    if (angle !== null) {
      this._domElem.css('transform', `rotate(${angle}deg)`);
    }*/
    }
}

// ====================================================================================================================
/*
 * Main code
 */
// ====================================================================================================================


//init socket for create the wall.
// var socket = io.connect('http://192.168.43.43:4200');
//  socket.on('connect', function () {
//          var murs = [
//     {
//         type: "wall",
//         x: 0,
//         y: 0,
//         length: 15,
//         radius: 0
//     },
//     {
//         type: "wall",
//         x: 15,
//         y: 0,
//         length: 6,
//         radius: 270
//     },
//     {
//         type: "wall",
//         x: 15,
//         y: 6,
//         length: 2,
//         radius: 270
//     },
//     {
//         type: "door",
//         x: 15,
//         y: 8,
//         length: 2,
//         radius: 270
//     },
//     {
//         type: "wall",
//         x: 15,
//         y: 10,
//         length: 5,
//         radius: 270
//     },
//     {
//         type: "wall",
//         x: 7.5,
//         y: 6,
//         length: 15,
//         radius: 0
//     },
//     {
//         type: "wall",
//         x: 30,
//         y: 6,
//         length: 9,
//         radius: 270
//     },
//     {
//         type: "wall",
//         x: 11,
//         y: 15,
//         length: 11,
//         radius: 180
//     },
//     {
//         type: "door",
//         x: 5.5,
//         y: 15,
//         length: 2,
//         radius: 0
//     },
//     {
//         type: "wall",
//         x: 6.5,
//         y: 15,
//         length: 2,
//         radius: 0
//     },
//     {
//         type: "wall",
//         x: 7.5,
//         y: 15,
//         length: 15,
//         radius: 0
//     },
//     {
//         type: "wall",
//         x: 0,
//         y: 0,
//         length: 15,
//         radius: 270
//     },
//     {
//         type: "roof",
//         x: 0,
//         y: 0,
//         xLength: 15,
//         yLength: 15
//     },
//     {
//         type: "roof",
//         x: 15,
//         y: 6,
//         xLength: 15,
//         yLength: 9
//     }
// ];
//          socket.emit('wallTable', murs);
//  });


var sofaSelected;
var selectSofaIndex = 0;

var selectValue = "sofa";
var defs = d3.select("#roomMap").append("defs");
var socket = io.connect('http://mayl.me:8080');
var translate0 = [0, 0], scale0 = 1;
var svg, rect, container, meuble, domBeds, domTables, domSofas;
var meubleSofaMenu = [];
var meubleTableMenu = [];
var meubleBedMenu = [];


// the sofa data array 
var sofas = [];

// the beds data array 
var beds = [];

// the tables data array 
var tables = [];

var mSofa, mTable, mBed;
//mouse click position
var clickX,clickY;

var rectX = 0;
var rectY = 0;

var createPosition = {
    sofa : {
        x:0,
        y:0
    },
    table : {
        x:0,
        y:0
    },
    bed : {
        x:0,
        y:0
    }
};

var menuPositionX = 0;
var menuPositionY = 0;

//------------------------------------------------BEDS------------------------------------------------------
var tablesOnMap = [];
var bedsOnMap = [];
var sofasOnMap = [];
//------------------------------------------------BEDS------------------------------------------------------
// var objectColor;
//----------------------------------------------------------------------------------------------------------


var oList;
var oIndex;
var oType;



var currentAngle = 0;
var buttonSvg;

var imgHeight = 750, imgWidth = 1500,      // Image dimensions (don't change these)
    width =  1500, height = 750,             // Dimensions of cropped region
    translate0 = [0, 0], scale0 = 1;  // Initial offset & scale

/*var zoom = d3.behavior.zoom()
.scaleExtent([1, 8])
.on("zoom", zoomed);*/

var initMap = function(width, height) {


    socket.emit("tableWantFurniture","sofa");

    socket.on('availableSofas', function (data) {
        //console.log(data);
        if(data.length > 2){
            for (var i = 0; i < data.length;i++){
                var sofaMenuInfo = data[i];
                // var sofas=[];

                var s = [];

                var size = sofaMenuInfo.size
                var colors = Object.keys(sofaMenuInfo.textures);
                for (var k = 0; k < colors.length;k++){
                    // console.log(k);
                    var color = colors[k];
                    var texture = sofaMenuInfo.textures[color];
                    // console.log(texture);
                    var sofaColors = {
                        id : sofaMenuInfo.id,
                        textureId:texture.id,
                        icon:texture.topImg,
                        action:"objectSelect(sofas["+sofaMenuInfo.id+"]," + k + ",\"sofa\");",
                        size:{
                            length: (size.z * 50),
                            width: (size.x * 50)
                        },
                        color: color
                    };
                    // sofas.push(sofaColors);
                    s.push(sofaColors);
                    createPatternOfMeuble(sofaColors,"sofa");
                }
                sofas[i] = s;

                // sofass.push(sofas);


                var sofa = {
                    id:i,
                    icon:sofaMenuInfo.miniature,
                    action:"createMenuMeuble(menuPositionX,menuPositionY,sofas,\"sofa\","+i+");",
                    object: data[i]
                }
                meubleSofaMenu.push(sofa);
            }
        }

    });

    //table data from server

    socket.emit("tableWantFurniture","table");

    socket.on('availableTables', function (data) {
        //console.log(data);
        for (var i = 0; i < data.length;i++){
            var tableMenuInfo = data[i];
            var t = [];
            var size = tableMenuInfo.size
            var colors = Object.keys(tableMenuInfo.textures);

            for (var k = 0; k < colors.length;k++){
                var color = colors[k];
                var texture = tableMenuInfo.textures[color];
                var tableColors = {
                    id : tableMenuInfo.id,
                    textureId:texture.id,
                    icon:texture.topImg,
                    action:"objectSelect(tables[" + i + "]," + k + ",\"table\");",
                    size:{
                        length: (size.z * 50),
                        width: (size.x * 50)
                    },
                    color: color
                };
                t.push(tableColors);
                createPatternOfMeuble(tableColors,"table");
            }

            tables[i] = t;

            var table = {
                id:i,
                icon:tableMenuInfo.miniature,
                action:"createMenuMeuble(menuPositionX,menuPositionY,tables,\"table\","+i+");",
                object: data[i]
            }
            meubleTableMenu.push(table);
        }
    });

    //bed data from server

    socket.emit("tableWantFurniture","bed");

    socket.on('availableBeds', function (data) {
        //console.log(data);
        for (var i = 0; i < data.length;i++){
            var bedMenuInfo = data[i];
            var t = [];
            var size = bedMenuInfo.size
            var colors = Object.keys(bedMenuInfo.textures);

            for (var k = 0; k < colors.length;k++){
                var color = colors[k];
                var texture = bedMenuInfo.textures[color];
                var bedColors = {
                    id : bedMenuInfo.id,
                    textureId:texture.id,
                    icon:texture.topImg,
                    action:"objectSelect(beds[" + i + "]," + k + ",\"bed\");",
                    size:{
                        length: (size.z * 50),
                        width: (size.x * 50)
                    },
                    color: color
                };
                t.push(bedColors);
                createPatternOfMeuble(bedColors,"bed");
            }

            beds[i] = t;

            var bed = {
                id:i,
                icon:bedMenuInfo.miniature,
                action:"createMenuMeuble(menuPositionX,menuPositionY,beds,\"bed\","+i+");",
                object: data[i]
            }
            meubleBedMenu.push(bed);
        }
        //createToolBar();
        d3.select("#loading").style("display","none");
    });



    socket.on("changedFurnitureTexture",function(data){
        //console.log("[changedFurnitureTexture]" + data);

        container.select(".g-"+data.type+"s").selectAll(".g-element").each(function(){
            if(data.index == d3.select(this).select("rect").attr("meubleIndex")){
                d3.select(this).select("rect").style("fill","url(#"+data.type+data.id+data.textureId+")");
                d3.select(this).select("rect").attr("textureId",data.textureId);
            }
        });
        //console.log("url(#"+data.type+data.id+data.textureId+")");
        //console.log(data);
    });

    socket.on("position", function(data){
                var player = $("#player");
                player.css("left", data.x*50 );
                player.css("top", data.y*50 );
            });

    socket.on("removeFurniture",function(data){
        //console.log("[removeFurniture] "+data);
        container.select(".g-"+data.type+"s").selectAll(".g-element").each(function(){
            if(data.index == d3.select(this).select("rect").attr("meubleIndex")){
                d3.select(this).remove();
            }
        });
    });

    svg = d3.select("#roomMap")
    /*.attr("width",  width)
        .attr("height", height)*/
        .append("g")
        .attr("transform", "translate(" + translate0 + ")").attr("id","g-map");
    /*//.call(zoom)
        .on("dblclick.zoom", null);*/

    rect = svg.append("rect")
        .attr("fill","#ffffff")
        .attr("class", "overlay")
        .attr("width", width + "px")
        .attr("height", height + "px");

    container = svg.append("g").attr("class","zoomArea").attr("transform","translate(0,0)scale(1)");
    container.append("g").attr("class","imgMap").attr("transform","translate(0,0)").append("image")
        .attr("width",  width + "px")
        .attr("height", height + "px")
        .attr("xlink:href", "assets/big-room.png");

    container.append("g")
        .attr("class", "x axis")
        .selectAll("line")
        .data(d3.range(0, width, 50))
        .enter().append("line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 0)
        .attr("x2", function(d) { return d; })
        .attr("y2", height);

    container.append("g")
        .attr("class", "y axis")
        .selectAll("line")
        .data(d3.range(0, height, 50))
        .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) { return d; })
        .attr("x2", width)
        .attr("y2", function(d) { return d; });

    container.append("g").attr("class","g-sofa").attr("transform","translate(0,0)").append("text");

    meuble = container.append("g").attr("class","g-meuble").attr("transform","translate(0,0)");
    domBeds = meuble.append("g").attr("class","g-beds").attr("transform","translate(0,0)");
    domTables = meuble.append("g").attr("class","g-tables").attr("transform","translate(0,0)");
    domSofas = meuble.append("g").attr("class","g-sofas").attr("transform","translate(0,0)");

    var rotElement = "map";

    function onchangeRot() {
        rotElement = d3.select('#selectBoxRot').select('select').property('value')
    };

    svg.on("dblclick",doubleClick);

    //updateR(0);

    //TODO : set type regarding tagID

}

function createMeubleSelectMenu(x,y,type){
    switch(type){
        case "bed":
            changeMenuLayer(true,"bedMenu");
            if(mBed){
                mBed.hide();
            }

            d3.select("#menu-bed").selectAll("g").each(function(){
                d3.select(this).remove();
            });

            mBed = new d3.radialMenu().radius(50).thickness(150).iconSize(120).arrow("assets/cross.png")
                .appendTo("#menu-bed").show(meubleBedMenu).centerAction("changeMenuLayer(false,\"bedMenu\");");

            var menu = $("#bedMenu svg");
            menu.css('position', 'absolute');
            menu.css("left",  - 200);
            menu.css("top",  - 200);

            var menuParent = $("#bedMenu");
            menuParent.css('position', 'absolute');
            menuParent.css("left",  x);
            menuParent.css("top",  y);
            break;
        case "table":
            changeMenuLayer(true,"tableMenu");
            if(mTable){
                mTable.hide();
            }

            d3.select("#menu-table").selectAll("g").each(function(){
                d3.select(this).remove();
            });

            mTable = new d3.radialMenu().radius(50).thickness(150).iconSize(120).arrow("assets/cross.png")
                .appendTo("#menu-table").show(meubleTableMenu).centerAction("changeMenuLayer(false,\"tableMenu\");");

            var menu = $("#tableMenu svg");
            menu.css('position', 'absolute');
            menu.css("left",  - 200);
            menu.css("top",  - 200);

            var menuParent = $("#tableMenu");
            menuParent.css('position', 'absolute');
            menuParent.css("left",  x);
            menuParent.css("top",  y);
            break;
        default:
            changeMenuLayer(true,"sofaMenu");
            if(mSofa){
                mSofa.hide();
            }

            d3.select("#menu-sofa").selectAll("g").each(function(){
                d3.select(this).remove();
            });

            mSofa = new d3.radialMenu().radius(50).thickness(150).iconSize(120).arrow("assets/cross.png")
                .appendTo("#menu-sofa").show(meubleSofaMenu).centerAction("changeMenuLayer(false,\"sofaMenu\");");

            var menu = $("#sofaMenu svg");
            menu.css('position', 'absolute');
            menu.css("left",  - 200);
            menu.css("top",  - 200);

            var menuParent = $("#sofaMenu");
            menuParent.css('position', 'absolute');
            menuParent.css("left",  x);
            menuParent.css("top",  y);
    }

}

function doubleClick(){
    if(selectValue == "sofa" || selectValue == "table" || selectValue == "bed"){
        var zoomAreaPosition = d3.select(".zoomArea").attr("transform").split(/\(|\,|\)/);

        clickX = d3.mouse(this)[0] - parseFloat(zoomAreaPosition[1],10);
        clickY = d3.mouse(this)[1] - parseFloat(zoomAreaPosition[2],10);

        rectX = clickX;
        rectY = clickY;

        menuPositionX = d3.event.pageX;
        menuPositionY = d3.event.pageY;

        switch(selectValue){
            case "bed":
                createMeubleSelectMenu(d3.event.pageX, d3.event.pageY,"bed");
                break;
            case "table":
                createMeubleSelectMenu(d3.event.pageX, d3.event.pageY,"table");
                break;
            default: 
                createMeubleSelectMenu(d3.event.pageX, d3.event.pageY,"sofa");
        };

        createPosition[selectValue].x = rectX;
        createPosition[selectValue].y = rectY;
        console.log(createPosition);
    }
}	



d3.select("#rAngle").on("input", function() {
    updateR(+this.value);
});

function updateR(nAngle) {
    d3.select("#rAngle-value").text(nAngle);
    d3.select("#rAngle").property("value", nAngle);

    if(selectValue == 'sofa'){
        rotateMenu(nAngle,"menu-sofa");
    }
    else if(selectValue == 'bed'){
        rotateMenu(nAngle,"menu-bed");
    }
    else if(selectValue == 'table'){
        rotateMenu(nAngle,"menu-table");
    }else{
        rotateMap(nAngle);
    }
    // else if(selectValue == 'touchRotate'){
    // 	rotateMeubleSelected(nAngle);
    // }

}

//------------------------------------------   rotate function --------------------------------------------------
function rotateMap(nAngle){
    var transformZoomArea = d3.select(".zoomArea").attr("transform");
    var splitTransformZoomArea = transformZoomArea.split("rotate")[0];
    d3.select('.zoomArea').attr("transform",splitTransformZoomArea + "rotate("+nAngle+",400,400)");
}

function rotateMenu(nAngle,svgMenu){
    var transformZoomArea = d3.select("#"+svgMenu).attr("transform");
    var splitTransformZoomArea = transformZoomArea.split("rotate")[0];
    d3.select('#'+svgMenu).attr("transform",splitTransformZoomArea + "rotate("+nAngle+")");
    d3.select('#'+svgMenu).select(".arrow").attr("transform","rotate(" + (-nAngle) + ")");

}

function rotateMeubleSelected(nAngle){
    if (d3.select('.meubleSelected')[0][0] != null){
        var oType = d3.select('.meubleSelected').attr("meubleType");
        var oIndex = d3.select('.meubleSelected').attr("meubleIndex");
        var transformZoomArea = d3.select(".meubleSelected").attr("transform");
        var splitTransformZoomArea = transformZoomArea.split("rotate")[0];
        var rotateCenter = transformZoomArea.split("rotate")[1].split(",");
        // console.log(rotateCenter);
        d3.select('.meubleSelected').attr("transform",splitTransformZoomArea + "rotate("+nAngle+","+rotateCenter[1]+","+rotateCenter[2]);
        var objectList;
        switch(oType){
            case "table":
                objectList = tablesOnMap;
                break;
            case "bed":
                objectList = bedsOnMap;
                break;
            default:
                objectList = sofasOnMap;
        }

        objectList[oIndex].angle = nAngle;
        setObjectPoints(objectList,oIndex);


        if(isObjectBadPlaced(objectList,oIndex)){
            d3.select('.meubleSelected').classed("badPlaceObject",true);
        }else{
            d3.select('.meubleSelected').classed("badPlaceObject",false);
        };
    }
}

function translateMeubleSelected(x,y){
    if (d3.select('.meubleSelected')[0][0] != null){
        var oIndex = d3.select('.meubleSelected').attr("meubleIndex");
        var objectList;
        switch(d3.select('.meubleSelected').attr("meubleType")){
            case "table":
                objectList = tablesOnMap;
                break;
            case "bed":
                objectList = bedsOnMap;
                break;
            default:
                objectList = sofasOnMap;
        }

        objectList[oIndex].rectX = x;
        objectList[oIndex].rectY = y;
        setObjectPoints(objectList,oIndex);
        if(isObjectBadPlaced(objectList,oIndex)){
            d3.select('.meubleSelected').classed("badPlaceObject",true);
        }else{
            d3.select('.meubleSelected').classed("badPlaceObject",false);
        };
        d3.select('.meubleSelected').attr("transform","translate(" + objectList[oIndex].rectX + "," + objectList[oIndex].rectY + ")rotate(" + objectList[oIndex].angle + "," + objectList[oIndex].objectCenterX + "," + objectList[oIndex].objectCenterY + ")");
        //        d3.select('.meubleSelectedParent').select("text").attr("transform","translate(" + objectList[oIndex].rectX + "," + objectList[oIndex].rectY + ")");
    }
}

function translateMeubleSelectedFinished(){
    var oType = d3.select('.meubleSelected').attr("meubleType");
    var oIndex = d3.select('.meubleSelected').attr("meubleIndex");
    var objectList;
    switch(oType){
        case "table":
            objectList = tablesOnMap;
            break;
        case "bed":
            objectList = bedsOnMap;
            break;
        default:
            objectList = sofasOnMap;
    }

    d3.select('.meubleSelected').attr("opacity",0.5).style("stroke","#FFFFFF");
    if(isObjectBadPlaced(objectList,oIndex)){
        //        d3.select('.meubleSelectedParent').style("display","none");
        // d3.select('.meubleSelected').remove();
    }else{
        d3.select('.meubleSelected').classed("badPlaceObject",false);
        sendDataToVRServer(objectList,oIndex, oType,d3.select('.meubleSelected').attr("meubleId"),d3.select('.meubleSelected').attr("textureId"),"moveFurniture");
    };

    // if(isObjectWantDelete(objectList,oIndex)){
    //     d3.select('.meubleSelected').remove();
    //     socket.emit("removeFurniture", {type : oType, index : parseInt(oIndex)});
    //     console.log("[removeFurniture]" + oType + " " + oIndex);
    // }
}


function objectSelect(meuble, index, type){
    // console.log(index);
    switch(type){
        case "table":
            if(mTable)mTable.hide();
            changeMenuLayer(false,"tableMenu");
            break;
        case "bed":
            if(mBed)mBed.hide();
            changeMenuLayer(false,"bedMenu");
            break;
        default:
            if(mSofa)mSofa.hide();
            changeMenuLayer(false,"sofaMenu");
    }
    // objectColor = meuble[index].color;
    // console.log(objectColor);
    objectCreate(clickX,clickY,meuble[index].size.width,meuble[index].size.length,type, meuble[index].id, meuble[index].textureId);
    //selectValue = "touchMove";
    //updateButtonColors(d3.select("#touchMove"),d3.select("#touchMove").select(this.parentNode));
}


function objectCreate(px,py,width,height,type, meubleId, textureId){
    //showResetButton();
    var angle = 0;
    var demiDiagonal = Math.sqrt(width * width + height * height) / 2;
    var objectCenterX = width / 2;
    var objectCenterY = height / 2;
    var objectPoints = [
        {x : 0, y : 0},
        {x : 0, y : 0},
        {x : 0, y : 0},
        {x : 0, y : 0}
    ];
    initObjectPointsPosition(objectPoints,px,py,width,height);

    var dataObject = {
        angle : angle,
        demiDiagonal : demiDiagonal,
        objectCenterX : objectCenterX,
        objectCenterY : objectCenterY,
        objectPoints : objectPoints,
        rectX : createPosition[type].x,
        rectY : createPosition[type].y,
        width : width,
        height : height
    };



    switch(type){
        case "table":
            tablesOnMap.push(dataObject);
            addObjectOnMap(domTables,tablesOnMap,tablesOnMap.length - 1,"table", meubleId, textureId);
            break;
        case "bed":
            bedsOnMap.push(dataObject);
            addObjectOnMap(domBeds,bedsOnMap,bedsOnMap.length - 1,"bed", meubleId, textureId);
            break;
        case "sofa":
            sofasOnMap.push(dataObject);
            addObjectOnMap(domSofas,sofasOnMap,sofasOnMap.length - 1,"sofa", meubleId, textureId);
            break;
        default:;
    }

}

function initObjectPointsPosition(objectPoints,px,py,width,height){
    objectPoints[0].x = px;
    objectPoints[0].y = py + height;
    objectPoints[1].x = px + width;
    objectPoints[1].y = py + height;
    objectPoints[2].x = px + width;
    objectPoints[2].y = py;
    objectPoints[3].x = px;
    objectPoints[3].y = py;
}

function setObjectPoints(objectList, index){
    var objectMeuble = objectList[index];
    objectMeuble.objectPoints[0].x = objectMeuble.objectCenterX + objectMeuble.rectX + objectMeuble.demiDiagonal * Math.cos(objectMeuble.angle / 180 * Math.PI - Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX) + Math.PI);
    objectMeuble.objectPoints[0].y = objectMeuble.objectCenterY + objectMeuble.rectY + objectMeuble.demiDiagonal * Math.sin(objectMeuble.angle / 180 * Math.PI - Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX) + Math.PI);
    objectMeuble.objectPoints[1].x = objectMeuble.objectCenterX + objectMeuble.rectX + objectMeuble.demiDiagonal * Math.cos(objectMeuble.angle / 180 * Math.PI + Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX));
    objectMeuble.objectPoints[1].y = objectMeuble.objectCenterY + objectMeuble.rectY + objectMeuble.demiDiagonal * Math.sin(objectMeuble.angle / 180 * Math.PI + Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX));
    objectMeuble.objectPoints[2].x = objectMeuble.objectCenterX + objectMeuble.rectX + objectMeuble.demiDiagonal * Math.cos(objectMeuble.angle / 180 * Math.PI - Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX));
    objectMeuble.objectPoints[2].y = objectMeuble.objectCenterY + objectMeuble.rectY + objectMeuble.demiDiagonal * Math.sin(objectMeuble.angle / 180 * Math.PI - Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX));
    objectMeuble.objectPoints[3].x = objectMeuble.objectCenterX + objectMeuble.rectX + objectMeuble.demiDiagonal * Math.cos(objectMeuble.angle / 180 * Math.PI + Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX) + Math.PI);
    objectMeuble.objectPoints[3].y = objectMeuble.objectCenterY + objectMeuble.rectY + objectMeuble.demiDiagonal * Math.sin(objectMeuble.angle / 180 * Math.PI + Math.atan(objectMeuble.objectCenterY / objectMeuble.objectCenterX) + Math.PI);
}

function addObjectOnMap(meubleParent,objectList,index,type, meubleId, textureId){


    setObjectPoints(objectList, index);
    sendDataToVRServer(objectList,index,type,meubleId,textureId,"tableAddFurniture");

    var dragObject = d3.behavior.drag()
    .on("dragstart", mouseOn)
    .on("drag", mouseMove)
    .on("dragend", mouseOff);
    //    d3.select('.meubleSelectedParent').classed("meubleSelectedParent",false);
    var element = meubleParent.append("g").attr("class","g-element").attr("transform","translate(0,0)");
    d3.select('.meubleSelected').classed("meubleSelected",false);

    var childRect = element.append("rect").attr("meubleId",meubleId).attr("textureId",textureId).attr("meubleIndex",index).attr("meubleType",type).classed("meubleSelected",true).attr("transform","translate(" + objectList[index].rectX + "," + objectList[index].rectY + ")rotate(" + objectList[index].angle + "," + objectList[index].objectCenterX + "," + objectList[index].objectCenterY + ")").attr("width",objectList[index].width).attr("height",objectList[index].height).attr("opacity",0.5).style("fill","url(#"+type+meubleId+textureId+")").call(dragObject);

    updateR(0);

    //    element.append("text").attr("transform","translate(" + objectList[index].objectPoints[3].x + "," + objectList[index].objectPoints[3].y + ")").text(type + "-" + index);

    var lastId = objectList.length -1;
    var furniture = new FurnitureWidget(objectList[lastId].rectX, objectList[lastId].rectY, objectList[lastId].width, objectList[lastId].height, childRect[0][0]);

}

function isObjectBadPlaced(objectList,index){
    var objectMeuble = objectList[index];
    var areaX = [];

    for(var i = 0; i < objectMeuble.objectPoints.length; i++){
        if(objectMeuble.objectPoints[i].x < 0 || objectMeuble.objectPoints[i].x > 1500 || objectMeuble.objectPoints[i].y < 0 || objectMeuble.objectPoints[i].y > 750)
            return true;
        if(objectMeuble.objectPoints[i].x > 750 && objectMeuble.objectPoints[i].y < 300)
            return true;

        areaX.push(objectMeuble.objectPoints[i].x);
    }
    if(areaX[0] > 750 && areaX[1] > 750 && areaX[2] > 750 && areaX[3] > 750){
        return false;
    }else if(areaX[0] < 740 && areaX[1] < 740 && areaX[2] < 740 && areaX[3] < 740){
        return false;
    }

    return true;
}

function isObjectWantDelete(objectList,index){
    var objectMeuble = objectList[index];

    for(var i = 0; i < objectMeuble.objectPoints.length; i++){
        if(objectMeuble.objectPoints[i].x > 1000 && objectMeuble.objectPoints[i].x < 1250 && objectMeuble.objectPoints[i].y > 0 && objectMeuble.objectPoints[i].y < 300)
            return true;
    }
    return false;
}


function mouseOn(d){
    d3.select('.meubleSelected').classed("meubleSelected",false);
    d3.select(this).classed("meubleSelected",true);
    //    d3.select('.meubleSelectedParent').classed("meubleSelectedParent",false);
    //    d3.select(this.parentNode).classed("meubleSelectedParent",true);
    oType = d3.select('.meubleSelected').attr("meubleType");
    oIndex = d3.select('.meubleSelected').attr("meubleIndex");
    var color;
    switch(oType){
        case "bed":
            color = "#8A2BE2";
            break;
        case "table":
            color = "#A52A2A";
            break;
        case "sofa":
            color = "#FFD700";
            break;
        default:;
    }
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).attr("opacity",0.9).style("stroke",color);

    var r = d3.select('.meubleSelected').attr("transform").split("rotate(")[1].split(",")[0];
    updateR(r);

    switch(d3.select('.meubleSelected').attr("meubleType")){
        case "bed":
            oList = bedsOnMap;
            break;
        case "table":
            oList = tablesOnMap;
            break;
        default:
            oList = sofasOnMap;

    }
}

function mouseMove(d){
    oList[oIndex].rectX += d3.event.dx;
    oList[oIndex].rectY += d3.event.dy;
    setObjectPoints(oList,oIndex);
    if(isObjectBadPlaced(oList,oIndex)){
        d3.select(this).classed("badPlaceObject",true);
    }else{
        d3.select(this).classed("badPlaceObject",false);
    };
    d3.select(this).attr("transform","translate(" + oList[oIndex].rectX + "," + oList[oIndex].rectY + ")rotate(" + oList[oIndex].angle + "," + oList[oIndex].objectCenterX + "," + oList[oIndex].objectCenterY + ")");
    //    d3.select(this.parentNode).select("text").attr("transform","translate(" + oList[oIndex].rectX + "," + oList[oIndex].rectY + ")");
}

function mouseOff(d){
    d3.select(this).attr("opacity",0.5).style("stroke","#FFFFFF");
    if(isObjectBadPlaced(oList,oIndex)){
        d3.select(this.parentNode).remove();
        socket.emit("removeFurniture", {type : d3.select(this).attr("meubleType"), index : parseInt(d3.select(this).attr("meubleIndex"))});
    }else{
        d3.select(this).classed("badPlaceObject",false);
        sendDataToVRServer(oList,oIndex, d3.select(this).attr("meubleType"),d3.select(this).attr("meubleId"),d3.select(this).attr("textureId"),"moveFurniture");
    };
}

function sendDataToVRServer(objectList, index, type, meubleId, textureId, actionType){
    var object = {
        type : type,
        id: parseInt(meubleId),
        textureId: textureId,
        index:parseInt(index),
        position:{
            x: (objectList[index].objectPoints[3].x + objectList[index].objectPoints[1].x) / 2 / 50,
            y:0.5,
            z: (objectList[index].objectPoints[3].y + objectList[index].objectPoints[1].y) / 2 / 50,
            angle: (360 - objectList[index].angle)
        }
    };
    socket.emit(actionType, object);
    //console.log(object);

    console.log(type + " [" + actionType + "} Send to server");
}


function createMenuMeuble(x,y,menuElements,type, id){
    var idMenu = "sofaMenu";
    var svgMenu = "menu-sofa";

    var menuCorrespondantId = menuElements[id];

    //console.log(menuCorrespondantId);


    switch(type){            
        case "bed":
            idMenu = "bedMenu";
            svgMenu = "menu-bed";
            changeMenuLayer(true,idMenu);
            d3.select("#" + svgMenu).selectAll("g").each(function(){
                d3.select(this).remove();
            });
            if(mBed){
                mBed.hide();
            }
            mBed = new d3.radialMenu().radius(50).thickness(150).iconSize(120).arrow("assets/return.png")
                .appendTo("#" + svgMenu).show(menuCorrespondantId).centerAction("createMeubleSelectMenu(createPosition.bed.x,createPosition.bed.y,\"bed\")");
            //bedMenuWidget.setX(createPosition.bed.x);
            //bedMenuWidget.setY(createPosition.bed.y);
            break;
        case "table":
            idMenu = "tableMenu";
            svgMenu = "menu-table";
            changeMenuLayer(true,idMenu);
            d3.select("#" + svgMenu).selectAll("g").each(function(){
                d3.select(this).remove();
            });
            if(mTable){
                mTable.hide();
            }
            mTable = new d3.radialMenu().radius(50).thickness(150).iconSize(120).arrow("assets/return.png")
                .appendTo("#" + svgMenu).show(menuCorrespondantId).centerAction("createMeubleSelectMenu(createPosition.table.x,createPosition.table.y,\"table\")");
            //tableMenuWidget.setX(createPosition.table.x);
            //tableMenuWidget.setY(createPosition.table.y);
            break;
        default: 
            idMenu = "sofaMenu";
            svgMenu = "menu-sofa";
            changeMenuLayer(true,idMenu);
            d3.select("#" + svgMenu).selectAll("g").each(function(){
                d3.select(this).remove();
            });
            if(mSofa){
                mSofa.hide();
            }
            mSofa = new d3.radialMenu().radius(50).thickness(150).iconSize(120).arrow("assets/return.png")
                .appendTo("#" + svgMenu).show(menuCorrespondantId).centerAction("createMeubleSelectMenu(createPosition.sofa.x,createPosition.sofa.y,\"sofa\")");
            //sofaMenuWidget.setX(createPosition.sofa.x);
            //sofaMenuWidget.setY(createPosition.sofa.y);
            
    };
}



function changeMenuLayer(flag,idMenu){
    if(flag){
        d3.select("#" + idMenu).attr("class","piemenufirstLayer");
    }else{
        d3.select("#" + idMenu).attr("class","piemenuLastLayer");
    }
}

function createPatternOfMeuble(meuble,type){
    defs.append("pattern")
        .attr("id",type+meuble.id+meuble.textureId)
        .attr("patternUnits","userSpaceOnUse")
        .attr("width",meuble.size.width)
        .attr("height",meuble.size.length)
        .append("image")
        .attr("xlink:href","data:image/png;base64,"+meuble.icon)
        .attr("x","0")
        .attr("y","0")
        .attr("width",meuble.size.width)
        .attr("height",meuble.size.length);
}

function tuioTagMenu(x,y,type){
    createMeubleSelectMenu(x, y,type);

    createPosition[type].x = x;
    createPosition[type].y = y;
}

function tuioMenuDelete(type){
    switch(type){
        case "bed":

            if(mBed){
                mBed.hide();
            }
            changeMenuLayer(false,"bedMenu");
            d3.select("#menu-bed").selectAll("g").each(function(){
                d3.select(this).remove();
            });
            break;
        case "table":

            if(mTable){
                mTable.hide();
            }
            changeMenuLayer(false,"tableMenu");
            d3.select("#menu-table").selectAll("g").each(function(){
                d3.select(this).remove();
            });
            break;
        default:

            if(mSofa){
                mSofa.hide();
            }
            changeMenuLayer(false,"sofaMenu");
            d3.select("#menu-sofa").selectAll("g").each(function(){
                d3.select(this).remove();
            });
    }
}

function tuioMenuMove(x,y, type){
    var oldX = parseInt(d3.select("#" + type + "Menu").style("left").split("px")[0]);
    var oldY = parseInt(d3.select("#" + type + "Menu").style("top").split("px")[0]);

    var newX = x + oldX;
    var newY = y + oldY;

    switch(type){
        case "bed":
            createPosition.bed.x = newX;
            createPosition.bed.y = newY;
            break;
        case "table":
            createPosition.table.x = newX;
            createPosition.table.y = newY;
            break;
        case "sofa":
            createPosition.sofa.x = newX;
            createPosition.sofa.y = newY;
            break;
    }

    d3.select("#" + type + "Menu").style("left", newX + "px");
    d3.select("#" + type + "Menu").style("top", newY + "px");

}

// ====================================================================================================================
/*
 * Menu part
 */
// ====================================================================================================================

d3.radialMenu = function() {

    // Protect against missing new keyword
    if (!(this instanceof d3.radialMenu)) {
        return new d3.radialMenu();
    }

    //#region Local Variables

    // The following variables have getter/setter functions exposed so are configurable
    var data = [{}];
    var padding = 1;
    var radius = 50;
    var thickness = 20;
    var iconSize = 16;
    var animationDuration = 250;                // The duration to run animations for
    var onClick = function(a) { alert(a); };

    // Private Variables
    // var offsetAngleDeg = -180 / data.length;    // Initial rotation angle designed to put centre the first segment at the top
    var offsetAngleDeg = 0; 
    var control = {};                           // The control that will be augmented and returned
    var pie;                                    // The pie layout
    var arc;                                    // The arc generator
    var segmentLayer;                           // The layer that contains the segments

    var arrowImg = "";
    var arrowSize = 60;

    var centerAction="";



    //#endregion

    //#region Getter/Setter Accessors

    /**
     * The function to execute on a menu click
     * @param {object} onClick - The function to execute on a menu click
     * @returns {number} The function to execute on a menu click or the control
     */
    control.onClick = function (_) {
        if (!arguments.length) return onClick;
        onClick = _;
        return control;
    };

    /**
     * Time in ms to animate transitions
     * @param {object} animationDuration - The time in ms to animate transitions
     * @returns {number} The time in ms to animate transitions or the control
     */
    control.animationDuration = function (_) {
        if (!arguments.length) return animationDuration;
        animationDuration = _;
        return control;
    };

    /**
     * Padding between segments
     * @param {object} padding - The padding between segments
     * @returns {number} The padding between segments or the control
     */
    control.padding = function (_) {
        if (!arguments.length) return padding;
        padding = _;
        return control;
    };

    /**
     * Size of the icons within the segments
     * @param {object} iconSize - Size of the icons within the segments
     * @returns {number} The Size of the icons within the segments or the control
     */
    control.iconSize = function (_) {
        if (!arguments.length) return iconSize;
        iconSize = _;
        return control;
    };

    /**
     * Changes the inner radius of the menu
     * @param {object} radius - The inner radius
     * @returns {number} The inner radius or the control
     */
    control.radius = function (_) {
        if (!arguments.length) return radius;
        radius = _;
        arc.innerRadius(radius);
        arc.outerRadius(radius + thickness);
        return control;
    };

    /**
     * Changes the thickness of the menu
     * @param {object} thickness - The thickness of the menu
     * @returns {number} The thickness of the menu or the control
     */
    control.thickness = function (_) {
        if (!arguments.length) return thickness;
        thickness = _;
        arc.outerRadius(radius + thickness);
        return control;
    };

    //#endregion

    //#region Private Functions

    /**
     * Calculates the mid point of an arc
     * @param {object} d - The D3 data object that represents the arc
     * @returns {object} A co-ordinate with an x, y location
     */
    function calcMidPoint(d) {
        var angle = d.startAngle + ((d.endAngle - d.startAngle) / 2);       
        var r = radius + (thickness / 2);
        return {
            x: r * Math.sin(angle),
            y: -r * Math.cos(angle)
        };
    }

    /**
     * Initializes the control
     */
    function init() {

        // Create pie layout 
        pie = d3.layout.pie()
            .value(function(d) { return data.length; })
            .padAngle(padding * Math.PI / 180);    

        // Create the arc function
        arc = d3.svg.arc()
            .innerRadius(radius)
            .outerRadius(radius + thickness);  
    }

    /** 
    * Appends the control to the DOM underneath the given target
    * @param {selector} target - Either a D3 object or a string selector to insert the menu into. Must be an SVG element, or child of an SVG element
    * @returns {object} The control
    */
    control.appendTo = function (target) {

        // Convert the target into a valid D3 selection
        // that we can append our menu into
        target = d3.select(target);

        // Create the visualiziation   
        segmentLayer = target.append("g")
            .attr("transform", "rotate(" + offsetAngleDeg + ")")

        //                      .on("mousemove",function(){
        //     var x = d3.mouse(this)[0];
        //     var y = d3.mouse(this)[1];
        //     var ro = 0;
        //     if(x > 0 && y > 0){
        //         ro = - (Math.atan(x/y) / 2 / Math.PI * 360) ;
        //     }else if(x > 0 && y < 0){
        //         ro = - (180 - Math.atan(x/(-y)) / 2 / Math.PI * 360) ;
        //     }else if(x < 0 && y > 0){
        //         ro = Math.atan((-x)/y) / 2 / Math.PI * 360 ;
        //     }else if(x < 0 && y < 0){
        //         ro = 180 - Math.atan(x/y) / 2 / Math.PI * 360 ;
        //     }

        //     arrow.attr("transform","rotate(" + ro + ")");
        //     console.log(x);
        //     console.log(y);
        //     console.log("--"+ro);
        // })
        ;
        //arrow for menu
        var arrow = target.append("g").attr("transform", "rotate(0)").attr("class","arrow");
        arrow.append("image").attr("href",arrowImg).attr("width",arrowSize).attr("height",arrowSize).attr("x",-arrowSize/2).attr("y",-arrowSize/2).on("click",function(d){eval(centerAction)});

        return control;
    };

    control.arrow = function(_){
        if (!arguments.length) return arrowImg;
        arrowImg = _;
        return control;
    }

    control.centerAction = function(_){
        if (!arguments.length) return centerAction;

        centerAction = _;
        //console.log(centerAction);
        return control;
    }

    control.arrowSize = function(_){
        if (!arguments.length) return arrowSize;
        arrowSize = _;
        return control;
    }

    /**
    * Display the menu
    * @returns {object} The control
    */
    control.show = function(_) {

        // Calculate the new offset angle based on the number of data items and
        // then rotate the menu to re-centre the first segment
        data = _;
        // offsetAngleDeg = -180 / data.length;
        var offsetAngleDeg = 0; 
        segmentLayer.attr("transform", "rotate(" + offsetAngleDeg + ")");

        // Join the data to the elements
        var dataJoin = segmentLayer .selectAll(".menu-segment-container")
        .data(pie(data));

        // Updates first

        // Update the segments first to make space for any new ones
        dataJoin.select(".menu-segment")
            .transition()
            .duration(animationDuration)
            .attrTween("d", function(a) {
            // interpolate the objects - which is going to allow updating 
            // the angles of the segments within the arc function
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {
                return arc(i(t));
            };
        });

        // Update the location of the icons
        dataJoin.select(".menu-icon")
            .transition()
            .attr("x", function(d) { return calcMidPoint(d).x - iconSize / 2; })
            .attr("y", function(d) { return calcMidPoint(d).y - iconSize / 2; })
            .attr("transform", function(d) { 
            var mp = calcMidPoint(d);                          
            var angle = -offsetAngleDeg;
            // var angle = 60;
            return "rotate(" + angle + "," + mp.x + "," + mp.y + ")";
        });

        // Enter new actors

        // Enter the groups
        var menuSegments = dataJoin .enter()
        .append("g")
        .attr("class", "menu-segment-container");

        // Add the segments                         
        menuSegments.append("path")
            .attr("class", "menu-segment")
            .each(function(d) { this._current = d; })                   // store the initial data value for later
            .on("click", function(d) { eval(d.data.action); })         
            .transition()
            .duration(animationDuration)
            .attrTween("d", function(a) {
            // Create interpolations from the 0 to radius - to give the impression of an expanding menu
            var innerTween = d3.interpolate(0, radius);
            var outerTween = d3.interpolate(0, arc.outerRadius()());
            return function(t) {               
                // Re-configure the radius of the arc
                return arc.innerRadius(innerTween(t)).outerRadius(outerTween(t))(a);
            };
        });

        // Add the icons   
        menuSegments.append("image")
            .attr("class", "menu-icon")
            .attr("xlink:href", function(d) {
            if(d.data.icon.length > 30){
                return "data:image/png;base64," + d.data.icon;

            } else{
                return d.data.icon;
            }
        })
            .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("x", function(d) { return calcMidPoint(d).x - iconSize / 2; })
            .attr("y", function(d) { return calcMidPoint(d).y - iconSize / 2; })
            .attr("transform", function(d,i) { 
            // We need to rotate the images backwards to compensate for the rotation of the menu as a whole
            var mp = calcMidPoint(d);                          
            // var angle = -offsetAngleDeg;
            var angle = 360 / data.length;
            var angle1 = ( 0.5 + i ) * angle;

            // console.log(i);
            // console.log(data.length);
            return "rotate(" + angle1 + "," + mp.x + "," + mp.y + ")";
        })
            .style("opacity", 0)
            .transition()
            .delay(animationDuration)
            .style("opacity", 1);       // Fade in the icons

        // Remove old groups
        dataJoin.exit().remove();

        return control;
    };

    /**
    * Hide the menu
    * @returns {object} The control
    */
    control.hide = function() {

        // Join the data with an empty array so that we'll exit all actors
        var dataJoin = segmentLayer .selectAll(".menu-segment-container")
        .data(pie([]))
        .exit();

        // Select all the icons and fade them out
        dataJoin.select(".menu-icon")  
            .style("opacity", 1)
            .transition()
            .delay(animationDuration)
            .style("opacity", 0);

        // Select all the segments and animate them back into the centre                 
        dataJoin.select("path") 
            .transition()
            .delay(animationDuration)       // wait for the icons to fade
            .duration(animationDuration) 
            .attrTween("d", function(a) {
            // Create interpolations from the radius to 0 - to give the impression of a shrinking menu
            var innerTween = d3.interpolate(radius, 0);
            var outerTween = d3.interpolate(arc.outerRadius()(), 0);
            return function(t) {               
                // Re-configure the radius of the arc
                return arc.innerRadius(innerTween(t)).outerRadius(outerTween(t))(a);
            };
        })
            .each("end", function(d) { 
            dataJoin.remove();      // Remove all of the segment groups once the transition has completed
        });

        return control;
    };

    // Initialize and then return the control
    init();
    return control;
};

