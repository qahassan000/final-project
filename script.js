// Small SVG setup
var width = 600, height = 300, margin = 40;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");

var innerWidth = width - 2*margin;
var innerHeight = height - 2*margin;

// Tiny test dataset
var salesByYear = [
    {Year: 2000, Global_Sales: 10},
    {Year: 2001, Global_Sales: 15},
    {Year: 2002, Global_Sales: 20},
    {Year: 2003, Global_Sales: 12},
    {Year: 2004, Global_Sales: 18}
];

// Scales
var x = d3.scale.linear()
    .domain(d3.extent(salesByYear, function(d){ return d.Year; }))
    .range([0, innerWidth]);

var y = d3.scale.linear()
    .domain([0, d3.max(salesByYear, function(d){ return d.Global_Sales; })])
    .range([innerHeight, 0]);

// Line generator
var line = d3.svg.line()
    .x(function(d){ return x(d.Year); })
    .y(function(d){ return y(d.Global_Sales); });

// Add axes
svg.append("g")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format("d")));

svg.append("g")
    .call(d3.svg.axis().scale(y).orient("left"));

// Draw line
svg.append("path")
    .datum(salesByYear)
    .attr("d", line)
    .style("stroke", "steelblue")
    .style("fill", "none")
    .style("stroke-width", 2);

// Draw points
svg.selectAll("circle")
    .data(salesByYear)
  .enter().append("circle")
    .attr("cx", function(d){ return x(d.Year); })
    .attr("cy", function(d){ return y(d.Global_Sales); })
    .attr("r", 4)
    .style("fill", "red");
