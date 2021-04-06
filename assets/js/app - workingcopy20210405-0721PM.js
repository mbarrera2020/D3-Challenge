// @TODO: YOUR CODE HERE!

// sample -- copy of D3 - day 3 activity 10

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold the cahrt,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Test / display data
console.log(chosenXAxis)
console.log(chosenYAxis)

// ****************************************************************
// function used for updating x-scale var upon click on axis label
// ****************************************************************
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// ****************************************************************
// function used for updating xAxis var upon click on axis label
// ****************************************************************
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// ****************************************************************
// function used for updating circles group with a transition to
// new circles
// ****************************************************************
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// ****************************************************************
// function used for updating circles group with new tooltip
// ****************************************************************
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty (%)";
  }
  else 
  if (chosenXAxis === "age") {
    label = "Age (Median)";
  }
  else {
    label = "Household Income (Median)";
  }

  // ?????????????????????????????????????
  // Issue #1 -- NEED HELP ON THIS SECTION 
  // ?????????????????????????????????????

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      // return (`${d.poverty}<br>${label} ${d[chosenXAxis]}`);
      // return (`${d.[chosenXAxis]}<br>${label} ${d[chosenXAxis]}`);
      return (`${d.state}<br>Poverty: ${d.poverty}%
        <br>Healthcare: ${d.healthcare}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below

d3.csv("assets/data/data.csv").then(function(censusData, err) {  
  if (err) throw err;

  // parse the data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.income = +data.income;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))

    // ?????????????????????????????????????
    // Issue #2 -- NEED HELP ON THIS SECTION 
    // ?????????????????????????????????????
    .attr("cy", d => yLinearScale(d.healthcare))
    // .attr("cy", d => yLinearScale(d.[chosenYAxis]))

    .attr("r", 20)
    .attr("class", "stateCircle")   // use state & display in the circle
    .attr("fill", "lightblue")
    .attr("opacity", ".5");

  // **************************************
  // Create group for three x-axis labels
  // **************************************
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // x-axis -- Label 1: In Poverty
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // x-axis -- Label 2: Age (Median) 
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // x-axis -- Label 3: Household Income
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
  

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // **********************************
  // x axis labels event listener
  // **********************************
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // // changes classes to change bold text -- for 2 x-axis labels
        // if (chosenXAxis === "poverty") {
        //   povertyLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        //   ageLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        // }
        // else {
        //   povertyLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
        //   ageLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        // }
        // // end code for 2 x-axis labels

        // changes classes to change bold text -- for 3 x-axis labels
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else
        if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else
        if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        // end code for 3 x-axis labels

      }
    });


}).catch(function(error) {
  console.log(error);
});