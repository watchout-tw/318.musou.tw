d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

function wrap(text, width, em) { // Mandarin only
	text.each(function() {
		var el = d3.select(this),
			text = el.text(),
			step = Math.floor(width/em),
			lines = [],
			i;
		for(i = 0 ; i < text.length; i += step) {
			lines.push(text.substr(i, step));
		}

		if(lines.length > 1 && lines[lines.length - 1].length < 2) {
			lines[lines.length - 1] = lines[lines.length - 2].slice(-1) + lines[lines.length - 1];
			lines[lines.length - 2] = lines[lines.length - 2].substr(0, lines[lines.length - 2].length - 1);
		}
		el.html('');
		el.selectAll('tspan').data(lines).enter().append('tspan')
			.text(function(d, i) { return d; })
			.attr({
				'dx': (function(d, i) { return (i > 0 ? -em*lines[i - 1].length : 0); }),
				'dy': (function(d, i) { return (i > 0 ? em*lineH : 0); }),
			});
	});
}

var circleR = 15, circleStrokeW = 8, fontSize = 12, lineH = 1.2, lineW = 8;

var drawTimelines = function() {
	// data pre-processing
	data.events = data.events.sort(function(a, b) { return new Date(a.time) - new Date(b.time)});

	var dates = data.events.map(function(o) { return new Date(o.time); });//.sort(function(a, b) { return a - b; });
	var firstDay = new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
	//var months = Math.round((dates[dates.length - 1] - dates[0])/1000/(30*24*60*60));
	var lastDay = new Date(new Date(dates[dates.length - 1].getFullYear(), (dates[dates.length - 1].getMonth()) + 1, 1) - 1);
	//var step = 120;
	var timelineDict = {};
	for(var i = 0; i < data.timelines.length; i++) {
		var id = data.timelines[i].id;
		timelineDict[id] = data.timelines[i];
		timelineDict[id].num = i;
	};

	// now let us draw
	var cw = ww;
	var paddings = {top: 40, right: Math.round(cw/6), bottom: 40, left: Math.round(cw/6)};
	var ch = (lastDay - firstDay)/1000*0.00003 + paddings.top + paddings.bottom;//months*step;

	var xScale = d3.scale.linear().domain([0, 2]).range([0 + paddings.left, cw - paddings.right]);
	var yScale = d3.scale.linear().domain([firstDay.getTime()/1000, lastDay.getTime()/1000]).range([0 + paddings.top, ch - paddings.bottom]);
	var colors = d3.scale.category10();

	var svg = d3.select('#timelines').append('svg')
		.attr({
			'width': cw,
			'height': ch,
			'viewBox': '0 0 ' + cw + ' ' + ch,
		});

	// draw ticks each month
	var ticks = svg.append('g').classed('ticks', true);
	for(var i = firstDay; i < lastDay; i = new Date(i.setMonth(i.getMonth() + 1))) {
		ticks.append('circle').attr({
			'cx': cw/2,
			'cy': yScale(i.getTime()/1000),
			'r': 3,
			'fill': 'rgba(0, 0, 0, 0.35)',
		});
	}
	ticks.append('circle').attr({
		'cx': cw/2,
		'cy': yScale(lastDay.getTime()/1000),
		'r': 3,
		'fill': 'rgba(0, 0, 0, 0.35)'
	});

	var last = {x: 0, y: 0};
	svg.selectAll('g.event').data(data.events).enter().append('g')
		.classed('event', true)
		.each(function(d, i) {
			var g = d3.select(this);
			var x = xScale(timelineDict[d.timeline].num);
			var y = yScale((new Date(d.time)).getTime()/1000);
			var color = timelineDict[d.timeline].color;

			var overlapped = (y - last.y < 2*circleR && x == last.x);
			x += (overlapped ? 2*circleR : 0);
			g.classed('shifted', overlapped)
			g.append('circle')
				.classed('clickable', true)
				.attr({
					'cx': x,
					'cy': y,
					'r': circleR,
					'fill': '#ccc',
					'stroke': color,
					'stroke-width': circleStrokeW,
				});
			last = {x: x, y: y};

			g.on('click', function(d) {
				updateEventDetail(d);
			});
		});

	svg.selectAll('g.event.shifted').each(function(d, i) {
		var style = 'transform: translateX(-' + circleR + 'px);';
		d3.select(this).attr('style', style);
		d3.select(this.previousSibling).attr('style', style);
	});
};

var drawChart = function() {
	// data pre-processing
	for(var i = 0; i < data.proposals.length; i++) {
		var p = data.proposals[i];
		p.nodes = [];
		for(var j = 0; j < p.values.length; j++) {
			p.nodes.push({x: p.values[j].num, y: j});
		}
	}

	// now let us draw
	var cw = ww;
	var ch = d3.min([wh, 600]);
	var paddings = {top: 120, right: 40, bottom: 40, left: 40};
	var xScale = d3.scale.linear().domain([0, 5]).range([0 + paddings.left, cw - paddings.right]);
	var yScale = d3.scale.linear().domain([0, 4]).range([0 + paddings.top, ch - paddings.bottom]);
	var line = d3.svg.line()
		.x(function(d) { return xScale(d.x); })
		.y(function(d) { return yScale(d.y); });

	var svg = d3.select('#chart').append('svg')
		.attr({
			'width': cw,
			'height': ch,
			'viewBox': '0 0 ' + cw + ' ' + ch
		});

	var nodeR = 8;

	// draw axes
	svg.selectAll('g.axis').data(data.axes).enter().append('g')
		.classed('axis', true)
		.each(function(d, i) {
			var g = d3.select(this);
			g.append('line')
				.attr({
					'x1': 0,
					'y1': yScale(i),
					'x2': cw,
					'y2': yScale(i),
					'stroke': '#ccc',
					'stroke-width': 2,
				});
			g.append('text').text(d)
				.attr({
					'x': 4,
					'y': yScale(i) - nodeR,
				})
		});

	// draw proposals
	svg.selectAll('g.proposal').data(data.proposals).enter().append('g')
		.classed('proposal', true)
		.attr('id', function(d) { return d.name; })
		.each(function(d, i) {
			var g = d3.select(this);
			var color = d.color;//colors(i);

			// draw legend
			g.append('circle')
				.classed('clickable', true)
				.attr({
					'cx': xScale(i),
					'cy': 40,
					'r': circleR,
					'stroke': color,
					'stroke-width': circleStrokeW,
					'fill': '#ccc',
				});
			g.append('text')
				.text(d.name)
				.attr({
					'x': xScale(i),
					'y': 74,
					'text-anchor': 'middle',
				})

			// draw path and nodes
			g.append('path')
				.attr({
					'd': line(d.nodes), // http://www.oxxostudio.tw/articles/201411/svg-d3-02-line.html
					'y': 0,
					'stroke': color,
					'stroke-width': nodeR,
					'fill': 'none',
				});
			g.selectAll('g.value').data(d.values).enter().append('g')
				.classed('value', true)
				.each(function(d2, i2) {
					var g2 = d3.select(this);
					var x = xScale(d2.num), y = yScale(i2);
					g2.append('circle')
						.attr({
							'r': nodeR,
							'cx': x,
							'cy': y,
							'fill': color,
							'stroke': 'none',
						});
					g2.append('text').text(d2.text)
						.call(wrap, lineW*fontSize, fontSize)
						.attr({
							'x': x + nodeR,
							'y': (function() {
								var lines = d3.select(this).selectAll('tspan').size();
								return y + (i2 > d.values.length/2 ? -(nodeR + (lines - 1)*fontSize*lineH) : nodeR + fontSize);
							}),
							'transform': (function() {
								var maxLineW = 0;
								d3.select(this).selectAll('tspan').each(function() {
									var line = d3.select(this);
									maxLineW = (line.text().length > maxLineW ? line.text().length : maxLineW);
								});
								return (i >= data.proposals.length/3 ? 'translate(-' + (maxLineW*fontSize + 2*nodeR) + ')' : '');
							}),
						});
				})

			g.on('click', function() {
				var g = d3.select(this);
				var f = g.classed('focused');
				svg.classed('focusOn', !f).selectAll('g.proposal').classed('focused', false);
				g.classed('focused', !f).moveToFront();
			});
		});
};
