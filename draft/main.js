
// Make #intro
function makeSectionIntro() {
	d3.csv("data/relations_all.csv").then(makeNetwork);
}

function makeSectionEZHistory() {

	var svg_width = document.documentElement.clientWidth,
	svg_height = document.documentElement.clientHeight;

	var stages = [
		{
			name: "Ticket",
			color: "#FF0000",
			x: svg_width / 2 - 300,
			y: svg_height / 2
		},
		{
			name: "Transit Link Fare Card",
			color: "#00FF00",
			x: svg_width / 2,
			y: svg_height / 2
		},
		{
			name: "EZ-Link",
			color: "#0000FF",
			x: svg_width / 2 + 300,
			y: svg_height / 2
		},
	]

	d3.select("g").attr("transform", "").selectAll("circle.node")
		.data([]).exit().remove();
	d3.select("g").selectAll("circle.node")
		.data(stages).enter()
		.append("circle").attr("class", "node")
		.attr("transform", d => "translate(" + d.x + "," + d.y + ")")
		.attr("fill", d => d.color)
		.attr("r", 15 * 7);
}

function makeNetwork(networkData) {

	// Initialize nodes with EZ-Link Card
	var nodes = [], nodeNames = [];
	nodes.push({
		name: "EZ-Link Card"
	});
	nodeNames.push("EZ-Link Card");

	// Create node objects and node list
	networkData.forEach(edge => {
		sourceNode = {
			name: edge.source
		};
		edge.source = sourceNode;
		targetNode = {
			name: edge.target
		};
		edge.target = targetNode;
		if (nodeNames.indexOf(sourceNode.name) === -1) {
			nodeNames.push(sourceNode.name);
			nodes.push(sourceNode);
		}
		if (nodeNames.indexOf(targetNode.name) === -1) {
			nodeNames.push(targetNode.name);
			nodes.push(targetNode);
		}
	})

	var svg_width = document.documentElement.clientWidth,
	svg_height = document.documentElement.clientHeight;

	// Create nodes
	d3.select("#intro").append("svg")
		.attr("style", "width:" + svg_width + "px;height:" + svg_height + "px;")
		.append("g")
		.selectAll("circle.node")
		.data(nodes).enter()
		.append("circle").attr("class", "node")
		.attr("r", 15)
		.on("click", function() {
			zoom(svg_width, svg_height);
		});

	// temp code to highlight ezlink
	d3.selectAll("circle.node")
		.classed("ezlink", node => node.name === "EZ-Link Card");

	// forceSimulation
	var force = d3.forceSimulation()
		.force("charge", d3.forceManyBody().strength(-500))
		// .force("collision", d3.forceCollide(30))
		.force('x', d3.forceX(svg_width / 2).strength(d => (d.name === "EZ-Link Card") ? 1:0.5))
		.force('y', d3.forceY(svg_height / 2).strength(d => (d.name === "EZ-Link Card") ? 1:0.5))
		.force("link", d3.forceLink())
		.nodes(nodes)
		.on("tick", updateNetwork);
	force.force("link").links(networkData);
}

function updateNetwork() {
	d3.selectAll("circle")
		.attr("cx", d => d.x)
		.attr("cy", d => d.y);
}

function zoom(width, height) {
	var g = d3.select("g"), 
		x = width / 2,
		y = height / 2,
		k = 7;
	g.transition().duration(1000)
		.attr("transform", "translate(" + x + "," + y + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
	var circles = d3.selectAll("circle.node");
	circles.attr("opacity", 1).transition().duration(750)
		.attr("opacity", node => (node.name === "EZ-Link Card") ? 1:0.1);

	d3.select("circle.ezlink").on("click", makeSectionEZHistory);
}

window.addEventListener('DOMContentLoaded', makeSectionIntro)