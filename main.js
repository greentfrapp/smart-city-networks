var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1pIyebLlRCmnfO6lBxZsj8TpVJr-bGBa1xlg1kARcECI/pubhtml';

function init() {
	
	Tabletop.init({
		key: publicSpreadsheetUrl,
		callback: loadNodes,
		simpleSheet: false
	})
}

function loadNodes(datas, tabletop) {

	var data = datas.relations.elements;
	var nodeDetails = datas.nodes.elements;
	
	var width = document.documentElement.clientWidth * 0.5;
	var height = document.documentElement.clientHeight;

	d3.select("svg")
		.attr("style", "width:" + width + "px;height:" + height + "px;");

	console.log("Data loaded!")
	
	var node_names = [];
	var node_id = 0;
	var nodes = {};
	var nodeList = [];
	var tagList = ["All"];

	var nodeImg = {},
	nodeDesc = {};
	nodeDetails.forEach(node => {
		nodeImg[node.id] = node.imgSrc;
		nodeDesc[node.id] = node.description;
	})

	data.forEach(relation => {
		if (!(relation.source in nodes)) {
			node = {id: relation.source};
			node.imgSrc = nodeImg[relation.source]
			node.description = nodeDesc[relation.source]
			nodes[relation.source] = node;
			nodeList.push(node);
		}
		if (!(relation.target in nodes)) {
			node = {id: relation.target};
			node.imgSrc = nodeImg[relation.target]
			node.description = nodeDesc[relation.target]
			nodes[relation.target] = node;
			nodeList.push(node);
		}
		relation.source = nodes[relation.source];
		relation.target = nodes[relation.target];
		relation.tags.split(",").forEach(tag => {
			if (tagList.indexOf(tag) === -1) {
				tagList.push(tag);
			}
		})
	});

	initNetwork(data, nodeList, "");

	d3.select(".infobox").select("h3").html("Filter");

	dropdown = d3.select("form")
				.append("select")
				.attr("class", "ui fluid dropdown")
				.on("change", function() {
					changeTag(data, nodeList);
				});
	// var dropdown = d3.select("form")
	// 			.append("div")
	// 			.attr("class", "ui dropdown")
	// 			.on("change", function() {
	// 				changeTag(data, nodeList);
	// 			});

	// dropdown.append("div").attr("class", "text").html("Filter")
	// dropdown.append("i").attr("class", "dropdown icon")
	// var menu = dropdown.append("div").attr("class", "menu")
	// menu.selectAll("div.item")
	// 	.data(tagList)
	// 	.enter()
	// 	.append("div")
	// 	.attr("class", "item")
	// 	.attr("data-value", d => d)
	// 	.html(d => d);


	dropdown.selectAll("option")
			.data(tagList)
			.enter()
			.append("option")
			.attr("value", d => d)
			.html(d => d);

	$('.ui.dropdown')
	  .dropdown()
	;
}

function initNetwork(data, nodeList, tag) {
	var width = document.documentElement.clientWidth * 0.5;
	var height = document.documentElement.clientHeight;
	// var width = 683;
	// var height = 542;

	var linkForce = d3.forceLink().distance(100);

	var force = d3.forceSimulation()
		.force("charge", d3.forceManyBody().strength(-400))
		.force("collision", d3.forceCollide(50))
		.force("y", d3.forceY(height / 2))
		.force("x", d3.forceX(width / 2))
		.force("link", linkForce)
		.nodes(nodeList)
		.on("tick", updateNetwork);

	force.force("link").links(data);
	d3.select("svg").selectAll("line.link").data([]).exit();
	d3.select("svg").selectAll("circle").data([]).exit();

	// d3.select("svg").selectAll("line.link")
	// 	.data(data)
	// 	.enter()
	// 	.append("line")
	// 	.attr("class", "link")
	// 	.style("opacity", .5)
	// 	.style("stroke-width", 5)
	// 	.on("click", edgeOver);

	d3.select("svg").selectAll("path")
		.data(data)
		.enter()
		.append("path")
		.attr("class", "arc")
		.style("stroke-width", 5)
		.style("opacity", .5)
		.attr("d", arc)
		.on("click", edgeClick)
		.on("mouseover", edgeHover)
		.on("mouseout", reset);

	d3.select("svg")
		.append("defs")
		.selectAll("pattern")
		.data(nodeList)
		.enter()
		.append("pattern")
		.attr("id", d => d.id.replace(' ', ''))
		.attr('patternUnits', 'objectBoundingBox')
		.attr('width', "100%")
		.attr('height', "100%")
		.attr('viewBox', "0 0 1 1")
		.attr('preserveAspectRatio', "xMidYMid slice")
		.append("image")
		.attr('preserveAspectRatio', "xMidYMid slice")
		.attr("xlink:href", d => d.imgSrc)
		.attr('width', "1")
		.attr('height', "1");

	d3.select("svg")
		.selectAll("circle")
		.data(nodeList)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 30)
		.on("click", function(d) {
			nodeClick(d, data);
		})
		.on("mouseover", nodeHover)
		.on("mouseout", reset)
		.each(function(d, i) {
			var el = d3.select(this);
			if (d.imgSrc) {
				el.attr("fill", d => "url(#" + d.id.replace(' ', '') + ")")
			} else {
				el.attr("fill", "#FFFFFF")
			}
		});

	
}

function updateNetwork() {
	d3.select("svg").selectAll("path")
		.attr("d", arc)
	// d3.selectAll("line.link")
//            .attr("x1", d => d.source.x)
//            .attr("x2", d => d.target.x)
//            .attr("y1", d => d.source.y)
//            .attr("y2", d => d.target.y);
	d3.selectAll("circle")
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
}

function nodeClick(node, data) {
	d3.select("#main")
		.html(node.id);
	var nodeEdges = [];
	data.forEach(relation => {
		if (relation.source.id === node.id || relation.target.id === node.id) {
			if (nodeEdges.indexOf(relation.relation) === -1 && relation.relation.length > 0) {
				nodeEdges.push(relation.relation);
			}
		}
	})

	d3.select("#sub")
		.select("div.list")
		.selectAll("div.item")
		.data([])
		.exit()
		.remove();

	d3.select("#sub")
		.select("div.list")
		.selectAll("div.item")
		.data(nodeEdges)
		.enter()
		.append("div")
		.attr("class", "item")
		.html(d => "<i class='exchange icon'></i> " + d)

	if (node.description) {
		d3.select("#desc")
			.html("<p>" + node.description.split("\n").join("</p><p>") + "</p>");
	} else {
		d3.select("#desc")
			.html("");
	}
		
	d3.selectAll("circle")
		.classed("highlighted", p => p.id === node.id);
	d3.selectAll("path")
		.classed("highlighted-link", p => p.source.id === node.id || p.target.id === node.id);
}

function nodeHover(node) {
	d3.select("#tooltip")
		.select("p")
		.html(node.id)
	d3.selectAll("circle")
		.classed("hovered", p => p.id === node.id);
	d3.selectAll("circle.hovered")
		.transition()
		.attr("r", 40);
}

function edgeClick(edge) {
	d3.select("#main")
		.html(edge.relation);
	var edgeNodes = [];
	edgeNodes.push(edge.source.id);
	edgeNodes.push(edge.target.id);
	d3.select("#sub")
		.select("div.list")
		.selectAll("div.item")
		.data([])
		.exit()
		.remove();

	d3.select("#sub")
		.select("div.list")
		.selectAll("div.item")
		.data(edgeNodes)
		.enter()
		.append("div")
		.attr("class", "item")
		.html(d => "<i class='circle outline icon'></i> " + d)

	if (edge.description) {
		d3.select("#desc")
			.html("<p>" + edge.description.split("\n").join("</p><p>") + "</p>");
	} else {
		d3.select("#desc")
			.html("");
	}

	d3.selectAll("path")
		.classed("highlighted-link", p => p.id === edge.id);
	d3.selectAll("circle")
		.classed("highlighted", p => p.id === edge.target.id || p.id === edge.source.id);
}

function edgeHover(edge) {
	d3.select("#tooltip")
		.select("p")
		.html(edge.relation);
	d3.selectAll("path")
		.classed("hovered-link", p => p.id === edge.id);
}

function reset(el) {
	d3.select("#tooltip")
		.select("p")
		.html("");
	d3.selectAll("circle.hovered")
		.transition()
		.attr("r", 30);
	d3.selectAll("circle.hovered")
		.classed("hovered", false);
	d3.selectAll("path.hovered-link")
		.classed("hovered-link", false);
}

function changeTag(data, nodeList) {
	var tag = d3.select("select").property("value");
	d3.select("#rel").html(tag);
	if (tag === "All") {
		d3.select("svg").selectAll("path")
			.classed("invisible", false);
	} else {
		d3.select("svg").selectAll("path")
			.classed("invisible", p => {
				return (p.tags.split(",").indexOf(tag) === -1);
			});
	}
}

function arc(d, i) {
	var draw = d3.line().curve(d3.curveBasis),
	// midX = (d.source.x + d.target.x) / 2,
	// midY = (d.source.y + d.target.y) / 2
	midX = (d.source.x + d.target.x) / 2 + ((d.id % 5) * 2 * (-1) ** (d.id % 5) + 1) * 3,
	midY = (d.source.y + d.target.y) / 2 + ((d.id % 5) * 2 * (-1) ** (d.id % 5) + 1) * 3
	return draw([[d.source.x, d.source.y], [midX, midY], [d.target.x, d.target.y]])
}

window.addEventListener('DOMContentLoaded', init)