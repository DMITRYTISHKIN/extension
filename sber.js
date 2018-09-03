define( ["qlik", "./d3.v5.min"],
	function ( qlik, d3v5 ) {
		d3 = d3v5;
		
		return {
			initialProperties: {
				qHyperCubeDef: {
					qDimensions: [],
					qMeasures: [],
					qInitialDataFetch: [{
						qWidth: 4,
						qHeight: 1000
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 1,
						max: 1
					},
					measures: {
						uses: "measures",
						min: 1,
						max: 1
					},
					sorting: {
						uses: "sorting"
					},
					settings: {
						uses: "settings",
						items: {
							MyColorPicker: {
								label:"My color-picker",
								component: "color-picker",
								ref: "myColor",
								type: "object",
								defaultValue: {
									index: 6,
									color: "#46c646"
								}
							}
						}
					}
				}
			},
			support: {
				snapshot: true,
				export: true,
				exportData: true
			},
			paint: function ($element, layout) {
				var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
				var color = "#46c646";

				if (layout.myColor) {
					color = layout.myColor.color;
				}

				var measureLabel = layout.qHyperCube.qMeasureInfo[0].qFallbackTitle
				var dimensionLabel = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle

				var data = qMatrix.map(function(d) {
					return {
						Metric1 : new Date(d[0].qText),
					    Metric2 : d[1].qNum,
					}
				});
				
				var width = $element.width();
				var height = $element.height();
				var id = "container_" + layout.qInfo.qId;

				if (document.getElementById(id)) {
					$("#" + id).empty();
				}
				else {
					$element.append($('<div />').attr("id", id).width(width).height(height));
				}
				
				draw(data, { measureLabel, dimensionLabel }, width, height, id, color);
				return qlik.Promise.resolve();
			}
		};

	} );
	
function draw(data, labels, width, height, id, color) {
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
		width  = width - margin.left - margin.right,
		height = height - margin.top - margin.bottom,
		svg    = d3.select("#"+id).append("svg").attr("width", width + 70).attr("height", height + 50),
		g      = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleTime()
		.rangeRound([0, width]);

	var y = d3.scaleLinear()
		.rangeRound([height, 0]);

	var line = d3.line()
		.x(function(d) { return x(d.Metric1); })
		.y(function(d) { return y(d.Metric2); });

	x.domain(d3.extent(data, function(d) { return d.Metric1; }));
	y.domain(d3.extent(data, function(d) { return d.Metric2; }));

	g.append("g")
		.attr("transform", "translate(0," + (height) + ")")
		.attr("fill", "#000")
		.call(d3.axisBottom(x))
		.append("text")
		.attr("fill", "#000")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text(labels.dimensionLabel);

	g.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "#000")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.style("text-anchor", "end")
		.text(labels.measureLabel)

	g.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", color)
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);
}
