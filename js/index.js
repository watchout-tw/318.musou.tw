var COMMA = '､';

// http://stackoverflow.com/a/88094

var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    ww = w.innerWidth || e.clientWidth || g.clientWidth,
    wh = w.innerHeight|| e.clientHeight|| g.clientHeight;

var $window, $body, $progress, $street, $legislature, $timlines, $eventDetail, $chart;

var getThumbnailURL = function(data) {
	if(data.thumbnailFilePath) {
		return data.thumbnailFilePath;
	}
	else if(data.youtubeID) {
		return 'https://img.youtube.com/vi/' + data.youtubeID + '/hqdefault.jpg'; //maxresdefault
	}
	else {
		return 'none';
	}
}

var updateEventDetail = function(data) {
	var className = 'showEventDetail';
	var $title = $eventDetail.find('h3');
	if($title.text() != data.title || $timelines.hasClass(className) === false) {
		$title.text(data.title);
		$eventDetail.find('time').text(data.time);
		$eventDetail.find('.thumbnail').css('background-image', 'url(' + getThumbnailURL(data) + ')');
		$eventDetail.find('a').attr('href', data.link);

		$timelines.addClass(className);
	}
	else {
		$timelines.removeClass(className);
	}
}

var parseTags = function(data) {
	var groups = [];
	var singles = [];
	var lines = (data ? data.split(';') : []);
	for(var i = 0; i < lines.length; i++) {
		var line = lines[i].split(':');
		var people = line[0].split(',');
		var action = line[1];
		groups.push({people: people, action: action});
		for(var j = 0; j < people.length; j++) {
			singles.push({person: people[j], action: action});
		}
	}
	return {groups: groups, singles: singles};
}
var evaluateEvent = function(data) {
	var tags = {
		good: parseTags(data.tagsGood),
		neutral: parseTags(data.tagsNeutral),
		bad: parseTags(data.tagsBad),
	}
	var score = (tags.good.singles.length > tags.bad.singles.length ? 'good' : (tags.good.singles.length < tags.bad.singles.length ? 'bad' : 'neutral'));

	return {tags: tags, tagsCount: tags.good.singles.length + tags.neutral.singles.length + tags.bad.singles.length, score: score};
}
var makeEventDOM = function(data, classList) {
	var $event = $('<a>').attr({id: data.uuid, href: data.link, target: '_blank'}).addClass(classList);
	$('<div>').addClass('thumbnail').appendTo($event).attr('style', 'background-image: url(' + getThumbnailURL(data) + ')');
	$('<time>').text(data.time).appendTo($event);
	$('<h3>').text(data.title).appendTo($event);

	var evaluation = evaluateEvent(data);
	var $tags = $('<div>').addClass('tags').appendTo($event);
	for(var score in evaluation.tags) {
		for(var group of evaluation.tags[score].groups) {
			var $group = $('<div>').addClass('tagGroup').addClass(score).appendTo($tags);
			var $person = $('<div>').addClass('person').html(group.people.join(COMMA)).appendTo($group);
			var $action = $('<div>').addClass('action').html(group.action).appendTo($group);
		}
	}
	$event.addClass(evaluation.score);
	return $event;
}

$(function() {
	// override
	ww = $('body').width();

	$street = $('#street');
	for(var i = 0; i < data.chapters.length; i++) {
		var chapter = data.chapters[i];
		var $chapter = $('<div>').addClass('chapter').appendTo($street);
		var $card = $('<div>').addClass('card').appendTo($chapter);
		$('<h2>').text(chapter.title).appendTo($card);
		$('<div>').addClass('title')
			.attr(
				'style',
				'background-image: url(' + "'images/graphics_" + chapter.id + ".svg'" + ');' + (chapter.id == 'civic' ? 'height: 180px;' : '')
			).appendTo($card);
		$('<p>').addClass('description').text(chapter.description).appendTo($card);
/*		var $expand = $('<div>').addClass('expand').appendTo($chapter);
		var expandText = {expand: '瞭解詳情', collapse: '看完了'};
		var $expandButton = $('<button>').text(expandText.expand).appendTo($expand).click(function() {
			var $b = $(this);
			$b.parents('.chapter').toggleClass('expanded');
			$b.text(($b.text() == expandText.expand ? expandText.collapse : expandText.expand));
		});*/
		var $reports = $('<div>').addClass('reports').appendTo($chapter);
		for(var j = 0; j < data.reports.length; j++) {
			var report = data.reports[j];
			if(report.chapter == chapter.id) {
				makeEventDOM(report, 'event report').appendTo($reports);
			}
		}
	}

	$legislature = $('#legislature');
/*	var $timelineTitles = $('#timelineTitles');
	for(var i = 0; i < data.timelines.length; i++) {
		$('<div>').addClass('title').appendTo($timelineTitles)
			.text(data.timelines[i].title)
			.css('background-color', data.timelines[i].color);
	}*/

	// nav
	$('nav > ul > li').click(function() {
		$('body').animate({'scrollTop': $('section#' + $(this).attr('data-target')).position().top - 88 + 1});
	});

	$timelines = $('#timelines');
	$eventDetail = $('#eventDetail');
	$timelines.click(function(event) {
		if(event.target.tagName.toLowerCase() == 'circle') {
			var $el = $(event.target);
			var offset = +$el.attr('cy');
			if($timelines.height() - offset > $eventDetail.outerHeight())
				offset += $el.attr('r')*2
			else
				offset -= $el.attr('r')*2 + $eventDetail.outerHeight();
			offset = Math.round(offset);
			$eventDetail.css('top', offset);
		}
	});
	$eventDetail.find('.close').click(function() {
		$timelines.removeClass('showEventDetail');
	});
	drawTimelines();
	drawChart();

	$window = $(window);
	$body = $('body');
	$progress = $('#progress');
	$window.scroll(function() {
		$progress.width($window.scrollTop()/($body.height() - $window.height())*100 + '%');
	});
});
