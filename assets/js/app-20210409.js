// @TODO: YOUR CODE HERE!

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
// function used for updating y-scale var upon click on axis label -- duplicated for y scale
// ****************************************************************
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
      d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);

  return yLinearScale;
}

// ****************************************************************
// function used for updating xAxis var upon click on axis label
// ****************************************************************
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// ****************************************************************
// function used for updating yAxis var upon click on axis label -- duplicated for y scale
// ****************************************************************
function renderYAxes(newYScale, yAxis) {
  var bottomAxis = d3.axisBottom(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return yAxis;
}

// ****************************************************************
// function used for updating circles group with a transition to
// new circles
// ****************************************************************
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    // .attr("cy", d => newYScale(d[chosenYAxis]));  // added for Y  -- breaks the code ???

  return circlesGroup;
}

// ****************************************************************
// function used for updating circles group with new tooltip
// ****************************************************************
function updateToolTip(chosenXAxis, circlesGroup) {

  var xlabel;

  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty (%)";
  }
  else 
  if (chosenXAxis === "age") {
    xlabel = "Age (Median)";
  }
  else {
    xlabel = "Household Income (Median)";
  }

  // ???????????????????????????????????????????????????????????????????????
  // Issue #1 -- NEED HELP ON THIS SECTION -- how to make this dynamic
  // ???????????????????????????????????????????????????????????????????????

  // ---------------------------------------------------------------
  // TOOLTIP -- 
  // ---------------------------------------------------------------
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      // return (`${d.poverty}<br>${xlabel} ${d[chosenXAxis]}`);
      // return (`${d.state}<br>${xlabel}</br>${d[chosenXAxis]}`);

      return (`${d.state}<br>Poverty: ${d.poverty}%
        <br>Healthcare: ${d.healthcare}%`);

    });

  circlesGroup.call(toolTip);

  // action taken on mouseover event
  circlesGroup.on("mouseover", function(data) {
    console.log(data)
    toolTip.show(data, this);
  })

  // action taken on mouseout event
    .on("mouseout", function(data, index) {
      console.log(data)
      toolTip.hide(data, this);
    });

  return circlesGroup;
}

// ---------------------------------------------------------------
// Retrieve data from the CSV file and execute everything below
// ---------------------------------------------------------------
d3.csv("assets/data/data.csv").then(function(censusData, err) {  
  if (err) throw err;

  console.log(censusData)

// parse the data
censusData.forEach(function(data) {
  data.poverty = +data.poverty;
  data.income = +data.income;
  data.age = +data.age;
  data.healthcare = +data.healthcare;
  data.smokes = +data.smokes;
  data.obesity = +data.obesity;
  data.abbr = data.abbr;
  });
 
  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d.healthcare)])    
    // .domain([0, d3.max(censusData, d => d.chosenYAxis)])      // ??? NEED TO FIX
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
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))    // display selected X axis data
  // .attr("cy", d => yLinearScale(d.healthcare))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))    // display selected Y axis data
    .attr("r", 15)                  // adjust size of circle
    .attr("class", "stateCircle")   // stateCircle is defined in d3Style.css
    .attr("text-anchor", "middle")
    .attr("fill", "lightblue")
    .attr("opacity", ".5")
    
    // .text(data.abbr)
    .text(d =>d.abbr)
    
    // ???????????????????????????????????????????????????
    // HELP HIGH PRIORITY -- how to display state abbr in the circle -- code does not work
    // ???????????????????????????????????????????????????
    
    circlesGroup.append("text").text(function(d){
        return d.abbr})

  /////////////////////////////////////////////////////
  // X AXIS SECTION -- SETUP X LABELS & EVENT LISTENER
  /////////////////////////////////////////////////////
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
  

  // **************************************
  // Create group for three y-axis labels
  // **************************************
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)", `translate(${width / 1.5}, ${height + 20})`);

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // y-axis -- Label 1: Lacks Healthcare (%)  // ??? HELP low priority NEED TO FIX LABEL LOCATION to be centered
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var healthcareLabel = ylabelsGroup.append("text")    
  // chartGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // y-axis -- Label 2: Smokes (%)
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var smokesLabel = ylabelsGroup.append("text")
  // chartGroup.append("text")
  //   .attr("transform", "rotate(-90)")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("axis-text", true)
    .text("Smokes (%)");

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // y-axis -- Label 3: Obese (%)
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  var obeseLabel = ylabelsGroup.append("text")
  // chartGroup.append("text")
  //   .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 1.5))
    .attr("dy", "1em")
    .attr("value", "obese") // value to grab for event listener
    .classed("axis-text", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // **********************************
  // X axis labels event listener
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
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltip with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // -----------------------------------------------------------
        // changes classes to change BOLD text -- for 3 x-axis labels
        // -----------------------------------------------------------
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

  
  // ????????????????????????????????????????????????
  // HELP - The section below does not work      
  // ????????????????????????????????????????????????

  /////////////////////////////////////////////////////
  // Y AXIS SECTION -- SETUP Y LABELS & EVENT LISTENER
  /////////////////////////////////////////////////////

  // // **********************************
  // // Y axis labels event listener
  // // **********************************
  // ylabelsGroup.selectAll("text")
  // .on("click", function() {
  //   // get value of selection
  //   var yvalue = d3.select(this).attr("value");
  //   if (yvalue !== chosenYAxis) {

  //     // replaces chosenYAxis with value
  //     chosenYAxis = yvalue;

  //     // console.log(chosenYAxis)

  //     // functions here found above csv import
  //     // updates y scale for new data
  //     yLinearScale = yScale(censusData, chosenYAxis);

  //     // updates y axis with transition
  //     yAxis = renderYAxes(yLinearScale, yAxis);

  //     // updates circles with new y values
  //     circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

  //     // updates tooltip with new info
  //     circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

      // -----------------------------------------------------------
      // changes classes to change BOLD text -- for 3 y-axis labels
      // ----------------------------------------------------------- 
      if (chosenYAxis === "healthcare") {
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else
      if (chosenYAxis === "smokes") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else
      if (chosenYAxis === "obese") {
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        obeseLabel
          .classed("active", true)
          .classed("inactive", false);
      }
      // end code for 3 y-axis labels

    }
  });

// ---------------------------------    
// Standard code -- do not touch
// ---------------------------------  
}).catch(function(error) {
  console.log(error);
});
