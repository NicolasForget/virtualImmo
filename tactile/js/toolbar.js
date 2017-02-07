//colors for different button states 
var defaultColor= "#7777BB";
var hoverColor= "#0000ff";
var pressedColor= "#000077";

function createToolBar(){
            d3.select(".rotaryKnob").style("display","inline");
            d3.select("#loading").style("display","none");

            var w= 900;
            var h= 80;
            var svgToolBar= d3.select("#toolBar")
                        .append("svg")
                        .attr("width",w)
                        .attr("height",h)

            //backdrop of color
           	var background = svgToolBar.append("rect")
                                .attr("id","backgroundRect")
                                .attr("width","100%")
                                .attr("height","100%")
                                .attr("x",0)
                                .attr("y",0)
                                .attr("fill","#FFFFFF")
            //container for all buttons
            var allButtonsMeuble = svgToolBar.append("g").attr("transform","translate(600,0)")
                                .attr("id","allButtonsMeuble")
            var allButtonsTouch = svgToolBar.append("g").attr("transform","translate(300,0)")
                                .attr("id","allButtonsTouch")

            //fontawesome button labels
            var labelsTouche= [{
                "label":"\uf047",
                "id":"touchMove",
                "v":"visible"
            },{
                "label":"\uf021",
                "id":"touchRotate",
                "v":"hidden"
            }];
            var labels= [
            {
                "label":"table",
                "id":"table",
                "v":"visible"
            },
            {
                "label":"sofa",
                "id":"sofa",
                "v":"visible"
            },
            {
                "label":"bed",
                "id":"bed",
                "v":"visible"
            }];

            

            //groups for each button (which will hold a rect and text)
            var buttonGroupsMeuble = allButtonsMeuble.selectAll("g.button")
                                    .data(labels)
                                    .enter()
                                    .append("g")
                                    .attr("class","button").attr("id",function(d){return d.id;})
                                    .style("cursor","pointer")
                                    .style("visibility",function(d){return d.v;})
                                    .on("click",function(d,i) {
                                        selectValue = d.id;
                                        console.log(selectValue);
                                        updateButtonColors(d3.select(this), d3.select(this.parentNode))
                                        // d3.select("#numberToggle").text(i+1)
                                    })
                                    .on("mouseover", function() {
                                        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                            d3.select(this)
                                                .select("rect")
                                                .attr("fill",hoverColor);
                                        }
                                    })
                                    .on("mouseout", function() {
                                        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                            d3.select(this)
                                                .select("rect")
                                                .attr("fill",defaultColor);
                                        }
                                    });

            // //groups for each button (which will hold a rect and text)
            var buttonGroupsTouch = allButtonsTouch.selectAll("g.button")
                                    .data(labelsTouche)
                                    .enter()
                                    .append("g")
                                    .attr("class","button").attr("id",function(d){return d.id;})
                                    .style("cursor","pointer")
                                    .style("visibility",function(d){return d.v;})
                                    .on("click",function(d,i) {
                                        selectValue = d.id;
                                        console.log(selectValue);
                                        updateButtonColors(d3.select(this), d3.select(this.parentNode))
                                        // d3.select("#numberToggle").text(i+1)
                                    })
                                    .on("mouseover", function() {
                                        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                            d3.select(this)
                                                .select("rect")
                                                .attr("fill",hoverColor);
                                        }
                                    })
                                    .on("mouseout", function() {
                                        if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                            d3.select(this)
                                                .select("rect")
                                                .attr("fill",defaultColor);
                                        }
                                    });

            var bWidth= 60; //button width
            var bHeight= 60; //button height
            var bSpace= 20; //space between buttons
            var x0= 20; //x offset
            var y0= 10; //y offset

            //adding a rect to each toggle button group
            //rx and ry give the rect rounded corner
            buttonGroupsMeuble.append("rect")
                        .attr("class","buttonRect")
                        .attr("width",bWidth)
                        .attr("height",bHeight)
                        .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
                        .attr("y",y0)
                        .attr("rx",5) //rx and ry give the buttons rounded corners
                        .attr("ry",5)
                        .attr("fill",defaultColor)

            //adding text to each toggle button group, centered 
            //within the toggle button rect
            buttonGroupsMeuble.append("text")
                        .attr("class","buttonText")
                        .attr("font-family","FontAwesome")
                        .attr("x",function(d,i) {
                            return x0 + (bWidth+bSpace)*i + bWidth/2;
                        })
                        .attr("y",y0+bHeight/2)
                        .attr("text-anchor","middle")
                        .attr("dominant-baseline","central")
                        .attr("fill","white")
                        .text(function(d) {return d.label;})


            buttonGroupsTouch.append("rect")
                        .attr("class","buttonRect")
                        .attr("width",bWidth)
                        .attr("height",bHeight)
                        .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
                        .attr("y",y0)
                        .attr("rx",5) //rx and ry give the buttons rounded corners
                        .attr("ry",5)
                        .attr("fill",defaultColor)

            //adding text to each toggle button group, centered 
            //within the toggle button rect
            buttonGroupsTouch.append("text")
                        .attr("class","buttonText")
                        .attr("font-family","FontAwesome")
                        .attr("x",function(d,i) {
                            return x0 + (bWidth+bSpace)*i + bWidth/2;
                        })
                        .attr("y",y0+bHeight/2)
                        .attr("text-anchor","middle")
                        .attr("dominant-baseline","central")
                        .attr("fill","white")
                        .text(function(d) {return d.label;})



}


function updateButtonColors(button, parent) {
    d3.select("#allButtonsMeuble").selectAll("rect")
        .attr("fill",defaultColor);
    d3.select("#allButtonsTouch").selectAll("rect")
        .attr("fill",defaultColor);
    d3.select(".actionSelected").classed("actionSelected",false).style("stroke",null);
    parent.classed("actionSelected",true).style("stroke","red");
    button.select("rect").attr("fill",pressedColor);
    if(selectValue == "sofa" ||selectValue == "table" ||selectValue == "bed"){
        d3.select("#touchRotate").style("visibility","hidden");
    }else{
        d3.select("#touchRotate").style("visibility","visible");
    }

}