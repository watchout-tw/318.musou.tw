var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    ww = w.innerWidth || e.clientWidth || g.clientWidth,
    wh = w.innerHeight|| e.clientHeight|| g.clientHeight;

var $street, $legislature, $timlines, $eventDetail, $chart;

var updateEventDetail = function(data) {
	var className = 'showEventDetail';
	var $title = $eventDetail.find('h3');
	if($title.text() != data.title || $timelines.hasClass(className) === false) {
		$title.text(data.title);
		$eventDetail.find('time').text(data.time);

		var backgroundImage = data.youtubeID ? 'url(' + 'https://img.youtube.com/vi/' + data.youtubeID + '/hqdefault.jpg' + ')' : 'none';
		$eventDetail.find('.thumbnail').css('background-image', backgroundImage);
		$eventDetail.find('a').attr('href', data.link);

		$timelines.addClass(className);
	}
	else {
		$timelines.removeClass(className);
	}
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
		var $expand = $('<div>').addClass('expand').appendTo($chapter);
		var expandText = {expand: '瞭解詳情', collapse: '看完了'};
		var $expandButton = $('<button>').text(expandText.expand).appendTo($expand).click(function() {
			var $b = $(this);
			$b.parents('.chapter').toggleClass('expanded');
			$b.text(($b.text() == expandText.expand ? expandText.collapse : expandText.expand));
		});
		var $reports = $('<div>').addClass('reports').appendTo($chapter);
		for(var j = 0; j < data.reports.length; j++) {
			var report = data.reports[j];
			if(report.chapter == chapter.id) {
				var $report = $('<a>').attr({href: report.link, target: '_blank'}).addClass('report').appendTo($reports);
				var $thumbnail = $('<div>').addClass('thumbnail').appendTo($report);
				if(report.youtubeID) {
					var url = 'https://img.youtube.com/vi/' + report.youtubeID + '/hqdefault.jpg'; //maxresdefault
					$thumbnail.attr('style', 'background-image: url(' + url + ')');
				}
				$('<time>').text(report.time).appendTo($report);
				$('<h3>').text(report.title).appendTo($report);
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
});
