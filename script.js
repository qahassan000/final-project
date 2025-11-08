
var CHART_WIDTH = 600;
var CHART_HEIGHT = 600;

d3.csv("vgsales.csv", function(error, data) {
    if (error) throw error;

    // Convert strings to numbers
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.Global_Sales = +d.Global_Sales;
        var fiveYearStart = Math.floor(d.Year / 5) * 5;
        d.fiveYear = fiveYearStart + "-" + (fiveYearStart + 4);
        
    });


    var salesByYear5 = d3.nest
        .key(function(d){return d.fiveYear; })
        .rollup(function(v) {
            return d3.sum(v, function(d) { return d.Global_Sales; })
        })
        .entries(data);
        .map(function(d) {
            return { fiveYear: +d.key, TotalSales: d.values };
        });

    salesByYear5.sort(function(a, b) { return a.fiveYear - b.fiveYear; });


    
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

    // Create scales
    var xScale = d3.scale.linear()
        .domain(d3.extent(salesByYear5, function(d) { return d.Year; }))
        .range([0, CHART_WIDTH]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(salesByYear5, function(d) { return d.TotalSales; })])
        .range([CHART_HEIGHT, 0]);

    // Create line generator
    var lineGenerator = d3.svg.line()
        .x(function(d){ return xScale(d.Year); })
        .y(function(d){ return yScale(d.TotalSales); });

    var g = d3.select("svg").select("g");

    // Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d"));
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

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







