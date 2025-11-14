
var margin = { top: 50, right: 50, bottom: 100, left: 80 };
var svgWidth = 800;
var svgHeight = 600;
var CHART_WIDTH = svgWidth - margin.left - margin.right;
var CHART_HEIGHT = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#main");
var g = svg.select("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("vgsales.csv", function(error, data) {
    if (error) throw error;

    data = data.filter(function(d) {
        return d.Year && !isNaN(+d.Year) && +d.Year <= 2017;
    });

    // Convert strings to numbers
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.Global_Sales = +d.Global_Sales;
        var fiveYearStart = Math.floor(d.Year / 5) * 5;
        d.fiveYear = fiveYearStart + "-" + (fiveYearStart + 4);
        
    });


    var salesByYear5 = d3.nest()
        .key(function(d){return d.fiveYear; })
        .rollup(function(v) {
            return d3.sum(v, function(d) { return d.Global_Sales; })
        })
        .entries(data)
        .map(function(d) {

            var startYear = parseInt(d.key.split("-")[0]);
            var endYear = startYear + 4;
            
            if (endYear > lastActualYear) {
                endYear = lastActualYear;
            }
            
            return { fiveYear: startYear + "-" + endYear, Year: startYear, TotalSales: +d.values };
        });

    salesByYear5.sort(function(a, b) { return a.Year - b.Year; });


    
    // // Group by Year and sum total sales per year
    // var salesByYear = d3.nest()
    //     .key(function(d) { return d.Year; })
    //     .rollup(function(v) {
    //         return d3.sum(v, function(d) { return d.Global_Sales; });
    //     })
    //     .entries(data)
    //     .map(function(d) {
    //         return { Year: +d.key, TotalSales: d.values };
    //     });

    // // Sort years ascending
    // salesByYear.sort(function(a, b) { return a.Year - b.Year; });

    var tickStep = 200
    var maxSalesRounded = Math.ceil(d3.max(salesByYear5, function(d) { return d.TotalSales; }) / tickStep) * tickStep;
    var tickIncrement = d3.range(0, maxSalesRounded + 1, tickStep);
    
    // Create scales
    var xScale = d3.scale.ordinal()
        .domain(salesByYear5.map( function(d) { return d.fiveYear; }))
        .rangeBands([0, CHART_WIDTH], 0.1);
    
    var yScale = d3.scale.linear()
        .domain([0, maxSalesRounded])
        .range([CHART_HEIGHT, 0]);

    

    // Create line generator
    var lineGenerator = d3.svg.line()
        .x(function(d){ return xScale(d.fiveYear) + xScale.rangeBand() / 2; })
        .y(function(d){ return yScale(d.TotalSales); });
    

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left").tickValues(tickIncrement).tickFormat(d3.format("d"));

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + CHART_HEIGHT + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "axis")
        .call(yAxis);

    // Add line path
    g.append("path")
        .datum(salesByYear5)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", lineGenerator);
});







