function RemoveBox () {

    var size = 20,
        x = 0,
        y = 0,
        rx = 0,
        ry = 0,
        markStrokeWidth = 3,
        boxStrokeWidth = 3,
        checked = true,
        clickEvent;

    function removeBox (selection) {

        var g = selection.append("g").attr("class","removeObject").attr("transform","translate(" + x + "," + y + ")"),
            box = g.append("rect")
            .attr("width", size)
            .attr("height", size)
            .attr("rx", rx)
            .attr("ry", ry)
            .style({
                "fill-opacity": 0,
                "stroke-width": boxStrokeWidth,
                "stroke": "red"
            });

        //Data to represent the check mark
        // var coordinates = [
        //     {x: (size / 8), y: (size / 3)},
        //     {x: (size / 2.2), y: (size) - (size / 4)},
        //     {x: (size) - (size / 8), y: ((size / 10))}
        // ];

        var d = "M" + (size / 8) + "," + (size / 8) + " L" + (size/8*7) + "," + (size/8*7) + " M" + (size/8*7) + "," + (size / 8) + " L" + (size / 8) + "," + (size/8*7); 

        var line = d3.svg.line()
                .x(function(d){ return d.x; })
                .y(function(d){ return d.y; })
                .interpolate("basic");

        var mark = g.append("path")
            .attr("d", d)
            .style({
                "stroke-width" : markStrokeWidth,
                "stroke" : "red",
                "fill" : "none",
                "opacity": (checked)? 1 : 0
            });

        g.on("click", function () {
            checked = !checked;
            mark.style("opacity", (checked)? 1 : 0);

            if(clickEvent)
                clickEvent();

            d3.event.stopPropagation();
        });

    }

    removeBox.size = function (val) {
        size = val;
        return removeBox;
    }

    removeBox.x = function (val) {
        x = val;
        return removeBox;
    }

    removeBox.y = function (val) {
        y = val;
        return removeBox;
    }

    removeBox.rx = function (val) {
        rx = val;
        return removeBox;
    }

    removeBox.ry = function (val) {
        ry = val;
        return removeBox;
    }

    removeBox.markStrokeWidth = function (val) {
        markStrokeWidth = val;
        return removeBox;
    }

    removeBox.boxStrokeWidth = function (val) {
        boxStrokeWidth = val;
        return removeBox;
    }

    removeBox.checked = function (val) {

        if(val === undefined) {
            return checked;
        } else {
            checked = val;
            return removeBox;
        }
    }

    removeBox.clickEvent = function (val) {
        clickEvent = val;
        return removeBox;
    }

    return removeBox;
}