import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

ReactDOM.render(<App />, document.getElementById("root"));