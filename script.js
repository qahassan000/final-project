
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

    var selectedGenres = new Set(["Action", "Sports", "Role-Playing", "Adventure", "Fighting", "Shooter", "Racing"]);
    
    // Convert strings to numbers
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.Global_Sales = +d.Global_Sales;
        var fiveYearStart = Math.floor(d.Year / 5) * 5;
        d.fiveYear = fiveYearStart + "-" + (fiveYearStart + 4);

        if (!selectedGenres.has(d.Genre)) {
            d.Genre = "Other";
        }
        
    });
    
    var lastActualYear = d3.max(data, function(d) { return d.Year; });

    var nestedData = d3.nest()
        .key(function(d) {return d.Genre; })
        .key(function(d){return d.fiveYear; })
        .rollup(function(v) {
            return d3.sum(v, function(d) { return d.Global_Sales; });
        })
        .entries(data);
        
        
     nestedData.forEach(function(genreGrouped) {
        genreGrouped.values = genreGrouped.values.map(function(d) {
            var startYear = parseInt(d.key.split("-")[0]);
            var endYear = startYear + 4;
            
            if (endYear > lastActualYear) {
                endYear = lastActualYear;
            }
            return { Genre: genreGrouped.key, fiveYear: startYear + "-" + endYear, Year: startYear, TotalSales: +d.values };
        });
         genreGrouped.values.sort(function(a, b) { return a.Year - b.Year; });
     });

    

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

    var allFiveYearLabels = nestedData[0].values.map(function(d){return d.fiveYear; });
    
    var tickStep = 200
    var maxSales = d3.max(nestedData, function(g){
        return d3.max(g.values, function(d){return d.TotalSales; });
    });
    var maxSalesRounded = Math.ceil(maxSales / tickStep) * tickStep;
    var tickIncrement = d3.range(0, maxSalesRounded + 1, tickStep);
    
    // Create scales
    var xScale = d3.scale.ordinal()
        .domain(allFiveYearLabels)
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

    var res = nestedData.map(function(d){ return d.Genre }) // list of group names
    var color = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(res)

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + CHART_HEIGHT + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "axis")
        .call(yAxis);

    // Add line path
    nestedData.forEach(function(group){
        g.append("path")
        .datum(group.values)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 3)
        .attr("d", lineGenerator);
    });
    
});







