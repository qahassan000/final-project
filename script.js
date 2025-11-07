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
});
