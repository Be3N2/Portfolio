function drawSteeringChart(data) {

	let padding = 30;

	const steeringChart = d3.select("#steering")
              .append("svg")
              .attr("width", w)
              .attr("height", h)
              .attr("class","chart");

	var yScale = d3.scaleLinear()
				   .domain([-1,1])
				   .range([h-padding, padding])

	var xScale = d3.scaleLinear()
			       .domain([0, data.length])
			       .range([padding, w-padding]);

	var yAxis = d3.axisLeft()
				  .scale(yScale);

	var xAxis = d3.axisBottom()
				  .scale(xScale);
    
    steeringChart.append('g')
				.attr('transform', 'translate('+padding+',0)')
				.call(yAxis);

	steeringChart.append('g')
				.attr('transform', 'translate(0,' + (h-padding) + ')')
				.call(xAxis);

 	steeringChart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "red")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steering")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) {return yScale(d[4]) })
		 	  ); 
	steeringChart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "lightgrey")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steering")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return yScale(0.15) })
		 	  ); 
	steeringChart.append("path")
		      .datum(data)
		      .attr("fill", "none")
		      .attr("stroke", "lightgrey")
		      .attr("stroke-width", 1.5)
		      .attr("id", "steering")
		      .attr("d", d3.line()
		        .x(function(d,i) {return xScale(i) })
		        .y(function(d) { return yScale(-0.15) })
		 	  );  
	//cosine is always last column in processed data
	var cosLocation = data[0].length - 1;
	var maxCosCurve = d3.max(data, datum => datum[cosLocation]);
	var CosCurveScale = d3.scaleLinear()
		.domain([-1, 1])
		.range([h - padding, padding])
	steeringChart.append("path")
	  .datum(data)
	  .attr("fill", "none")
	  .attr("stroke", "yellow")
	  .attr("stroke-width", 1.5)
	  .attr("id", "cosCurveSteering")
	  .attr("d", d3.line()
	    .x(function(d,i) {return xScale(i) })
	    .y(function(d,i) {return CosCurveScale(d[cosLocation])})
	);       
}