
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


    var xScale = d3.scale.linear(),
        yScale = d3.scale.linear();
    
    xScale.domain([1980, 2020]).range([0, CHART_WIDTH]);
    yScale.domain([0, d3.max(data, function(d){return d.Global_Sales;})]).range([CHART_HEIGHT, 0]);
    
    var lineGenerator = d3.svg.line()
        .x(function(d){return xScale(d.Year); })
        .y(function(d){return yScale(d.Global_Sales); });
    
    var g = d3.select("svg").select("g");
    
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(function(d){return "" + d;} ),
        yAxis = d3.svg.axis().scale(yScale).orient("left");
    
    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + CHART_HEIGHT + ")")
        .call(xAxis);
    
    g.append("g")
        .attr("class", "axis")
        .call(yAxis);
    
    g.append("path")
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", "3px")
        .attr("d", lineGenerator(data));

});






