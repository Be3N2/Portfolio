
var loadedData = [];
var chartOn = false;

var precision = 3;

//d3 important values
window.w = 800;
window.h = 300;
let padding = 50;

$("#Search").click(function() {
	var ParticipantID = $("#ParticipantID").val();
	$.get("lookup", {"ParticipantID": ParticipantID})
		.done(function( data ) {
			if (data.length > 0) {
				loadedData = data;
				console.log(data);
				//time to populate the data into the rest of the page
				populateTableData(data);

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

function mean(dataArray) {
	let sum = 0;
	for (let i = 0; i < dataArray.length; i++) {
		sum += dataArray[i];
	}
	return sum / dataArray.length;
}

function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

function populateTableData(data) {
	//use loadedData to populate the participant table
	$table = $(".ParticipantResultsTable");
	$table.toggle(true);
	//calculate all values per category
	var failTime3 = failTimeData(data, 3);
	var failTime5 = failTimeData(data, 5);
	var failTime7 = failTimeData(data, 7);

	//first clear old data if it exists
	$table.find(".tableGen").remove();

	//populate new data
	$table.find("#meanDecelerationFPS").append("<td class='tableGen'>" + failTime3["meanDecelFPS"] +"</td>");
	$table.find("#meanDecelerationFPS").append("<td class='tableGen'>" + failTime5["meanDecelFPS"] +"</td>");
	$table.find("#meanDecelerationFPS").append("<td class='tableGen'>" + failTime7["meanDecelFPS"] +"</td>");

	$table.find("#meanDecelerationMPS").append("<td class='tableGen'>" + failTime3["meanDecelMPS"] +"</td>");
	$table.find("#meanDecelerationMPS").append("<td class='tableGen'>" + failTime5["meanDecelMPS"] +"</td>");
	$table.find("#meanDecelerationMPS").append("<td class='tableGen'>" + failTime7["meanDecelMPS"] +"</td>");

	$table.find("#meanLateralPosisition").append("<td class='tableGen'>" + failTime3["meanLateralPosition"] +"</td>");
	$table.find("#meanLateralPosisition").append("<td class='tableGen'>" + failTime5["meanLateralPosition"] +"</td>");
	$table.find("#meanLateralPosisition").append("<td class='tableGen'>" + failTime7["meanLateralPosition"] +"</td>");

	$table.find("#SDLP").append("<td class='tableGen'>" + failTime3["meanSDLP"] +"</td>");
	$table.find("#SDLP").append("<td class='tableGen'>" + failTime5["meanSDLP"] +"</td>");
	$table.find("#SDLP").append("<td class='tableGen'>" + failTime7["meanSDLP"] +"</td>");

	$table.find("#meanSteeringError").append("<td class='tableGen'>" + failTime3["meanSteeringError"] +"</td>");
	$table.find("#meanSteeringError").append("<td class='tableGen'>" + failTime5["meanSteeringError"] +"</td>");
	$table.find("#meanSteeringError").append("<td class='tableGen'>" + failTime7["meanSteeringError"] +"</td>");
}

function failTimeData(data, time) {
	//return stats object for that time category
	/*
	returnobj = {
		"meanDecelFPS":
		"meanDecelMPS"
		"meanLateralPosition"
		"meanSDLP"
		"meanSteeringError"
	}
	*/
	var returnObj = {};

	var meanDecelFPS = [];
	var meanDecelMPS = [];
	var meanLateralPosition = [];
	var meanSDLP = [];
	var meanSteeringError = [];
	for (var i = 0; i < data.length; i++) {
		if (data[i]["Fail Time"] == time) {
			meanDecelFPS.push(data[i]["DecelData"]["meanDecelSpeedBased"]);
			meanDecelMPS.push(data[i]["DecelData"]["meanDecelDistanceBased"]);
			meanLateralPosition.push(data[i]["LateralData"]["MeanLateral"]);
			meanSDLP.push(data[i]["LateralData"]["SDLP"]);
			if (data[i]["SteeringData"]["meanError"]) meanSteeringError.push(data[i]["SteeringData"]["meanError"]);
		}
	}
	returnObj.meanDecelFPS = mean(meanDecelFPS).toFixed(precision);
	returnObj.meanDecelMPS = mean(meanDecelMPS).toFixed(precision);
	returnObj.meanLateralPosition = mean(meanLateralPosition).toFixed(precision);
	returnObj.meanSDLP = mean(meanSDLP).toFixed(precision);
	returnObj.meanSteeringError = mean(meanSteeringError).toFixed(precision);
	return returnObj;
}

$("#failTimeSelector").change(function() {
	var selectedNum = $("#failTimeSelector").val();

	//display calculations
	var $failData = $(".failTimeData");

	$failData.toggle(true);
	$failData.find(".meanDecelFPS").text(loadedData[selectedNum]["DecelData"]["meanDecelSpeedBased"].toFixed(precision));
	$failData.find(".meanDecelMPS").text(loadedData[selectedNum]["DecelData"]["meanDecelDistanceBased"].toFixed(precision));
	$failData.find(".meanLateral").text(loadedData[selectedNum]["LateralData"]["MeanLateral"].toFixed(precision));
	$failData.find(".stdLateral").text(loadedData[selectedNum]["LateralData"]["SDLP"].toFixed(precision));
	if (loadedData[selectedNum]["SteeringData"]["meanError"])
		$failData.find(".meanSteering").text(loadedData[selectedNum]["SteeringData"]["meanError"].toFixed(precision));
	else 
		$failData.find(".meanSteering").text("N/A");
	//draw chart
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
  	drawData(chart, loadedData[selectedNum]["Brake"], 0, 100, "brakePath", "steelblue");
  	drawData(chart, loadedData[selectedNum]["Speed"], 0, 100, "speedPath", "red");
  	drawData(chart, loadedData[selectedNum]["Steering"], -1, 1, "steeringPath", "darkgreen");
  	//activate buttons
  	$("#controls").toggle(true);

  	drawSteeringAxis(chart, loadedData[selectedNum]["Steering"], -1, 1); 

  	if (loadedData[selectedNum]["SteeringData"].fullApprox) {
  		drawData(chart, loadedData[selectedNum]["SteeringData"].fullApprox, -1, 1, "steeringApproxPath", "lightgreen");
  		$("#approxToggle").toggle(true);
  	} else {
  		$("#approxToggle").toggle(false);
  	}
});

function drawAxis(chart, length, min, max) {
	var yScale = d3.scaleLinear()
		.domain([min, max])
		.range([h-padding, padding]);

	var xScale = d3.scaleLinear()
	      .domain([0, parseInt(length*0.15)])
	      .range([padding, w-padding]);

	var yAxis = d3.axisLeft()
			.scale(yScale);

	var xAxis = d3.axisBottom()
			.scale(xScale);

	chart.append('g')
		.attr('transform', 'translate('+ padding+',0)')
		.call(yAxis);
	chart.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 7)
		.attr("x",0 - (h / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Speed Mph");  

	xAxis.tickSize(-1 * (h - padding * 2));
	xAxis.ticks(parseInt(length*0.15));
	//xAxis.tickFormat((d, i) => {return d + "s"});

	var g = chart.append("g")
	      .attr("transform", "translate(0," + (h-padding )+ ")")
	      .attr("class", "secondTicks")
	      .call(xAxis);
	chart.append("text")             
		  .attr("transform",
		        "translate(" + (w / 2) + " ," + (h - 20) + ")")
		  .style("text-anchor", "middle")
		  .text("Seconds");

	g.selectAll(".tick:first-of-type text").remove();
	g.selectAll(".tick:last-of-type text").remove();
}

function drawSteeringAxis(chart, data, min, max) {
	var yScale = d3.scaleLinear()
		.domain([min, max])
		.range([h-padding, padding]);

	var xScale = d3.scaleLinear()
	      .domain([0, data.length])
	      .range([padding, w-padding]);

	var yAxis = d3.axisRight()
			.scale(yScale);

	chart.append("text")
		.attr("transform", "rotate(90)")
		.attr("y", 0 - w)
		.attr("x", h / 2)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Steering Scale");  

	chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "lightgrey")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steeringPathBounds")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return yScale(0.10) })
		 	  ); 

	chart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "lightgrey")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steeringPathBounds")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return yScale(-0.10) })
		      ); 
    
    chart.append('g')
				.attr('transform', 'translate('+(w-padding)+',0)')
				.attr("id", "steeringScalePath")
				.call(yAxis);
}

function drawData(chart, data, min, max, id, color) {

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
	  .attr("id", id)
	  .attr("d", d3.line()
	    .x(function(d,i) {return xScale(i) })
	    .y(function(d) { return yScale(d) })
	);
}

$("#speedToggle").on("click", function() {
	var opacity = d3.select("#speedPath").style("opacity");
	d3.selectAll("#speedPath").transition().style("opacity", opacity == 1 ? 0:1)
});

$("#brakeToggle").on("click", function() {
	var opacity = d3.select("#brakePath").style("opacity");
	d3.selectAll("#brakePath").transition().style("opacity", opacity == 1 ? 0:1)
});

$("#steeringToggle").on("click", function() {
	var opacity = d3.select("#steeringPath").style("opacity");
	d3.selectAll("#steeringPath").transition().style("opacity", opacity == 1 ? 0:1);;	
});

$("#approxToggle").on("click", function() {	
	var opacity = d3.select("#steeringApproxPath").style("opacity");
	d3.selectAll("#steeringApproxPath").transition().style("opacity", opacity == 1 ? 0:1)	
});