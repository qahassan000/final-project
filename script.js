
var CHART_WIDTH = 500;
var CHART_HEIGHT = 200;


d3.csv("vgsales.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        d.Year = +d.Year;             // Convert to number
        d.Global_Sales = +d.Global_Sales;
        d.NA_Sales = +d.NA_Sales;
        d.EU_Sales = +d.EU_Sales;
        d.JP_Sales = +d.JP_Sales;
    });

    console.log(data); // Check that values are numbers now


   var g = d3.select("svg").select("g");

    // Test circle to check if SVG & g are working
    g.append("circle")
        .attr("cx", 50)
        .attr("cy", 50)
        .attr("r", 5)
        .style("fill", "red");

});






