
var loadedData = [];
var chartOn = false;

//d3 important values
window.w = 800;
window.h = 300;
let padding = 30;

$("#Search").click(function() {
	var ParticipantID = $("#ParticipantID").val();
	$.get("lookup", {"ParticipantID": ParticipantID})
		.done(function( data ) {
			if (data.length > 0) {
				loadedData = data;
				console.log(data);
				//time to populate the data into the rest of the page
				var $dropdown = $("#failTimeSelector");
				$dropdown.empty();

				$(".FailSelectorContainer").toggle(true);
				
				$dropdown.append("<option hidden disabled selected value> -- select an option -- </option>");
				
				$.each(data, function(i) {
				    $dropdown.append($("<option />").val(i).text("Fail Time " + data[i]["Fail Time"]));
				});
			} else {
				alert("No results");
			}
		});

	$("#Search").attr("disabled", true);
	setTimeout(function() {$("#Search").removeAttr("disabled");}, 10000);
});

$("#failTimeSelector").change(function() {
	var selectedNum = $("#failTimeSelector").val();

	//if chart is hidden, display now
	$("#chart").toggle(true);
	$("#chart").empty();
	//render the appropriate d3 charts
	const chart = d3.select("#chart")
              .append("svg")
              .attr("width", w)
              .attr("height", h)
              .attr("class","chart");
  	
  	drawAxis(chart, loadedData[selectedNum]["Brake"].length, 0, 100);
  	drawData(chart, loadedData[selectedNum]["Brake"], 0, 100, "steelblue");
  	drawData(chart, loadedData[selectedNum]["Speed"], 0, 100, "red");
  	drawData(chart, loadedData[selectedNum]["Steering"], -1, 1, "darkgreen");

  	if (loadedData[selectedNum]["SteeringData"].cosineApprox.length > 0) {
  		drawSteeringAxis(chart, loadedData[selectedNum]["SteeringData"].cosineApprox, -1, 1);
  		drawData(chart, loadedData[selectedNum]["SteeringData"].cosineApprox, -1, 1, "green");
  	}
});

function drawAxis(chart, length, min, max) {
	var yScale = d3.scaleLinear()
		.domain([min, max])
		.range([h-padding, padding]);

	var xScale = d3.scaleLinear()
	      .domain([0, length])
	      .range([padding, w-padding]);

	var yAxis = d3.axisLeft()
			.scale(yScale);

	var xAxis = d3.axisBottom()
			.scale(xScale);

	chart.append('g')
		.attr('transform', 'translate('+padding+',0)')
		.call(yAxis);

	chart.append("g")
	      .attr("transform", "translate(0," + (h-padding )+ ")")
	      .call(xAxis);
}

function drawSteeringAxis(chart, data, min, max) {
	var yScale = d3.scaleLinear()
		.domain([min, max])
		.range([h-padding, padding]);

	var xScale = d3.scaleLinear()
	      .domain([0, data.length])
	      .range([padding, w-padding]);

	var yAxis = d3.axisLeft()
			.scale(yScale);

	var xAxis = d3.axisBottom()
			.scale(xScale);

	chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "lightgrey")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steering")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return yScale(0.15) })
		 	  ); 
	chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "lightgrey")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steering")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return yScale(-0.15) })
		        ); 
}

function drawData(chart, data, min, max, color) {

	var yScale = d3.scaleLinear()
		.domain([min, max])
		.range([h-padding, padding]);

	var xScale = d3.scaleLinear()
	      .domain([0, data.length])
	      .range([padding, w-padding]);

	chart.append("path")
	  .datum(data)
	  .attr("fill", "none")
	  .attr("stroke", color)
	  .attr("stroke-width", 1.5)
	  .attr("id", "speed")
	  .attr("d", d3.line()
	    .x(function(d,i) {return xScale(i) })
	    .y(function(d) { return yScale(d) })
	);
}

/*
d3.request("./assets/Data3Test.csv")
		.mimeType("text/csv")
		.response(function (xhr) {
			var data = d3.csvParse(xhr.responseText);
			var formattedArr = [];
			data.forEach((d) => {
				var formatted = [+d["Fail Time"], +d.Speed, +d.Brake, +d.Gas, +d.Steering, +d["X-Position"], +d["Z-Position"], +d["Cosine Curves"]];
				formattedArr.push(formatted);
			});
			return formattedArr;
		})
		.get(function(data) {

			var maxBrake = d3.max(data, datum => datum[2]);

			var brakeYScale = d3.scaleLinear()
				.domain([0, maxBrake])
				.range([h-padding, padding]);

			chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "red")
		      .attr("stroke-width", 1.5)
		      .attr("id", "brake")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d,i) {return brakeYScale(d[2])})
		    );

		    //cosine is always last column in processed data
		    var cosLocation = data[0].length - 1;
		    var maxCosCurve = d3.max(data, datum => datum[cosLocation]);
		    var CosCurveScale = d3.scaleLinear()
		    	.domain([0, maxCosCurve])
		    	.range([h - padding, padding])
		    chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "yellow")
		      .attr("stroke-width", 1.5)
		      .attr("id", "cosCurve")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d,i) {return CosCurveScale(d[cosLocation])})
		    );

		    var maxGas = d3.max(data, datum => datum[3]);

			var gasYScale = d3.scaleLinear()
				.domain([0, maxGas])
				.range([h-padding, padding]);
		      
		    chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "black")
		      .attr("stroke-width", 1.5)
		      .attr("id", "gas")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return gasYScale(d[3]) })
		    ); 

		    drawSteeringChart(data);

		    var ySteeringScale = d3.scaleLinear()
				   .domain([-1,1])
				   .range([h-padding, padding])

			var xSteeringScale = d3.scaleLinear()
			       .domain([0, data.length])
			       .range([padding, w-padding]);
			var ySteeringAxis = d3.axisRight()
				  .scale(ySteeringScale);

			chart.append('g')
				.attr('transform', 'translate('+ (w - padding)+',0)')
				.attr("id", "steeringOverlay")
				.call(ySteeringAxis);

			chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "green")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steeringOverlay")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xSteeringScale(i) })
		        .y(function(d) { return ySteeringScale(d[4]) })
		 	  ); 
		});

function toggleSpeed() {
	var opacity = d3.select("#speed").style("opacity");
	d3.selectAll("#speed").transition().style("opacity", opacity == 1 ? 0:1)
}

function toggleBrake() {
	var opacity = d3.select("#brake").style("opacity");
	d3.selectAll("#brake").transition().style("opacity", opacity == 1 ? 0:1)
}

function toggleGas() {
	var opacity = d3.select("#gas").style("opacity");
	d3.selectAll("#gas").transition().style("opacity", opacity == 1 ? 0:1)
}

function toggleSteering() {
	var opacity = d3.select("#steeringOverlay").style("opacity");
	d3.selectAll("#steeringOverlay").transition().style("opacity", opacity == 1 ? 0:1);;
}

function toggleCos() {
	var opacity = d3.select("#cosCurve").style("opacity");
	d3.selectAll("#cosCurve").transition().style("opacity", opacity == 1 ? 0:1)
}

*/

