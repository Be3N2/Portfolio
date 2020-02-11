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


function toggleCos() {
	var opacity = d3.select("#cosCurve").style("opacity");
	d3.selectAll("#cosCurve").transition().style("opacity", opacity == 1 ? 0:1)
}