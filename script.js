
var margin = { top: 50, right: 50, bottom: 100, left: 80 };
var svgWidth = 800;
var svgHeight = 600;
var CHART_WIDTH = svgWidth - margin.left - margin.right;
var CHART_HEIGHT = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#main");
var g = svg.select("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var selectedGenres = new Set(["Action", "Sports", "Role-Playing", "Adventure", "Fighting", "Shooter", "Racing"]);
var saleTypes = ["Global_Sales", "NA_Sales", "EU_Sales", "JP_Sales"]

d3.select("#selectButton")
        .selectAll("option")
        .data(saleTypes)
        .enter()
        .append("option")
        .text(function(d) {return d.replace("_", " ");})
        .attr("value", function(d) {return d;});


d3.csv("vgsales.csv", function(error, data) {
    if (error) throw error;

    data = data.filter(function(d) {
        return d.Year && !isNaN(+d.Year) && +d.Year <= 2017;
    });
    
    // Convert strings to numbers
    data.forEach(function(d) {
        d.Year = +d.Year;
        saleTypes.forEach(function(type){d[type] = +d[type];});      
        var fiveYearStart = Math.floor(d.Year / 5) * 5;
        d.fiveYear = fiveYearStart + "-" + (fiveYearStart + 4);

        if (!selectedGenres.has(d.Genre)) {
            d.Genre = "Other";
        }
        
    });
    

    
    var nestedData = d3.nest()
        .key(function(d) {return d.Genre; })
        .key(function(d){return d.fiveYear; })
        .entries(data);

    
    var lastActualYear = d3.max(data, function(d) { return d.Year; });

    
     nestedData.forEach(function(genreGrouped) {
        genreGrouped.values = genreGrouped.values.map(function(d) {
            var startYear = parseInt(d.key.split("-")[0]);
            var endYear = startYear + 4;
            if (endYear > lastActualYear) {endYear = lastActualYear;}
            
            var objects = { Genre: genreGrouped.key, fiveYear: startYear + "-" + endYear, Year: startYear };
            saleTypes.forEach(function(type) { objects[type] = 0; });
            d.values.forEach(function(row) {
                saleTypes.forEach(function(type) { objects[type] += +row[type]; });
            });
            objects.TotalSales = objects.Global_Sales;
            return objects;
            
        });
         genreGrouped.values.sort(function(a, b) { return a.Year - b.Year; });
     });



    
    var allFiveYearLabels = nestedData[0].values.map(function(d){return d.fiveYear; });
    
    var tickStep = 100
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

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + CHART_HEIGHT + ")")
        .call(xAxis);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + CHART_WIDTH / 2)
        .attr("y", CHART_HEIGHT + margin.top + 40)
        .text("5-Year Interval");

    g.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -(margin.top + CHART_HEIGHT / 2))
        .attr("y", margin.left - 50)
        .text("Total Sales (Millions)");



    
    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };
    
    var genreNames = nestedData.map(function(d){ return d.key });
            var color = d3.scale.ordinal()
            .domain(genreNames)
            .range(["#000000", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7"])


    
    // Add line path
    nestedData.forEach(function(group){
        g.append("path")
        .datum(group.values)
        .attr("class", "clickable-line")
        .attr("fill", "none")
        .attr("stroke", color(group.key))
        .attr("stroke-width", 3)
        .attr("d", lineGenerator)
        .on("click", function(d) {
            d3.selectAll(".clickable-line").attr("stroke-width", 3).style("stroke", "grey").style("opacity", 0.3);
            d3.select(this).style("stroke", color(d[0].Genre)).style("opacity", 1).moveToFront();
            d3.event.stopPropagation();
            });
    });


    

    
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(650, 50)");

    legend.insert("rect", ":first-child")
    .attr("x", -10)
    .attr("y", -10)
    .attr("width", 150)
    .attr("height", 167)
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 1);
    
    nestedData.forEach(function(group, i){
        var glegend = legend.append("g").attr("transform", "translate(0," + i*20 + ")");
        glegend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", color(group.key));
       glegend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(group.key);
    });


    legend.selectAll("g")
        .on("click", function(d, i){
            var selectedGenre = nestedData[i].key;
            
            d3.selectAll(".clickable-line").attr("stroke-width", 3).style("stroke", "grey").style("opacity", 0.3);

            d3.selectAll(".clickable-line")
                .filter(function(lineData) {
                    return lineData[0].Genre === selectedGenre;
                })
                .style("stroke", color(selectedGenre)).style("opacity", 1).moveToFront();
            d3.event.stopPropagation();
        });


    


    
    svg.insert("rect", ":first-child") 
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("click", function() {
       
        d3.selectAll(".clickable-line")
            .style("stroke", function(d) { return color(d[0].Genre); }) 
            .style("opacity", 1)
            .attr("stroke-width", 3);

        
        d3.selectAll(".legend rect")
            .style("opacity", 1);
    });

    

    var tooltip = d3.select("#tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "6px")
            .style("border-radius", "4px")
    
        nestedData.forEach(function(group) {
            var points = g.selectAll(".point-" + group.key)
                .data(group.values)

            points.enter()
                .append("circle")
                .attr("class", "point point-" + group.key)
                .attr("cx", function(d) { return xScale(d.fiveYear) + xScale.rangeBand() / 2;})
                .attr("cy", function(d) { return yScale(d.TotalSales); })
                .attr("r", 5)
                .style("fill", color(group.key))
                .style("opacity", 0)
                .on("mouseover", function(d) {
                    
                    tooltip
                        .style("opacity", 1)
                        .html("Genre: " + d.Genre + "<br>Sales: " + Math.floor(d.TotalSales * 10) / 10)
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                    
                    d3.select(this).style("opacity", 1);
                })
                .on("mouseout", function(d) {
                    tooltip.style("opacity", 0)
                    d3.select(this).style("opacity", 0);
                })
        });


    function updateChart(selectedType) {
        nestedData.forEach(function(group) {
            group.values.forEach(function(d) {d.TotalSales = d[selectedType];});               
        });

        var tickStep = 100
        var maxSales = d3.max(nestedData, function(g){
        return d3.max(g.values, function(d){return d.TotalSales; });
        });
        var maxSalesRounded = Math.ceil(maxSales / tickStep) * tickStep;
        var tickIncrement = d3.range(0, maxSalesRounded + 1, tickStep);

        yScale.domain([0, maxSalesRounded]);
        yAxis.tickValues(tickIncrement);


        g.select(".y.axis")
            .transition().duration(700)
            .call(yAxis);

        d3.selectAll(".clickable-line")
            .transition().duration(700)
            .attr("d", lineGenerator);


        nestedData.forEach(function(group) {
            g.selectAll(".point-" + group.key)
                .data(group.values)
                .transition().duration(700)
                .attr("cy", function(d) { return yScale(d.TotalSales); }) // use TotalSales
                .attr("cx", function(d) { return xScale(d.fiveYear) + xScale.rangeBand()/2; });
        });
    }

    d3.select("#selectButton").on("change", function() {
       var selectedOption = d3.select(this).property("value");
       updateChart(selectedOption);     
    });

    
});







