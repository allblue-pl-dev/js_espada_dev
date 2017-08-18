'use strict';

var EGallery = {

	this: null,

	blueImpOptions: {},

	galleries: new Array(),
	galleries_i: 0,
	images_i: 0,
	links: new Array(),

	Class: function()
	{
		var self = this;
		$(document).ready(function() {
			self.loadGroups();
			self.loadImages();

			self.initialize();
		});
	},

	loadGroups: function()
	{
		var self = this;
		$('.egallery_group').each(function (){
			self.galleries['egallery_group_' + self.galleries_i] = new Array();

			$(this).find('a.eimage').each(function () {
				var elem_raw = this;
				var elem = $(this);
				$(this).find('img:first').each(function () {
					self.links.push(elem_raw);

					if (typeof elem.attr('data-egallery') === 'undefined')
						self.galleries['egallery_group_' + self.galleries_i].push(elem_raw);
					else {
						var gallery_name = elem.attr('data-egallery');
						if (typeof self.galleries[gallery_name] === 'undefined')
							self.galleries[gallery_name] = new Array();
						self.galleries[gallery_name].push(elem_raw);
					}
				});
			});

			self.galleries_i++;
		});

		$('.eimages_group').each(function (){
			self.galleries['egallery_group_' + self.galleries_i] = new Array();

			$(this).find('a').each(function () {
				var elem_raw = this;
				var elem = $(this);
				$(this).find('img:first').each(function () {
					self.links.push(elem_raw);

					if (typeof elem.attr('data-egallery') === 'undefined') {
						self.galleries['egallery_group_' + self.galleries_i].push(elem_raw);
					} else {
						var gallery_name = elem.attr('data-egallery');
						if (typeof self.galleries[gallery_name] === 'undefined')
							self.galleries[gallery_name] = new Array();
						self.galleries[gallery_name].push(elem_raw);
					}
				});
			});

			self.galleries_i++;
		});
	},

	loadImages: function()
	{
		var self = this;
		$('a.eimage').each(function () {
			var elem = $(this);

			if (self.links.indexOf(this) > -1)
				return;

			if (typeof elem.attr('data-egallery') === 'undefined') {
				self.galleries['egallery_images_' + self.images_i] = new Array();
				self.galleries['egallery_images_' + self.images_i].push(this);
				self.images_i++;
			} else {
				var gallery_name = elem.attr('data-egallery');
				if (typeof self.galleries[gallery_name] === 'undefined')
					self.galleries[gallery_name] = new Array();
				self.galleries[gallery_name].push(this);
			}
		});
	},

	initialize: function()
	{
		var galleries_keys = Object.keys(this.galleries);
		var galleries_keys_length = galleries_keys.length;

		var self = this;
		galleries_keys.forEach(function(gallery_name) {
			var gallery_elems = self.galleries[gallery_name];
			var gallery_elems_length = gallery_elems.length;

			self.links[gallery_name] = new Array();

			gallery_elems.forEach(function(elem) {
				self.links[gallery_name].push(self.linkGet(elem));

				$(elem).click(function (event) {
					event = event || window.event;
					var target = event.target || event.srcElement,
							link = target.src ? target.parentNode : target,
							options = {index: link, event: event};

					for (var property_name in self.blueImpOptions)
						options[property_name] = self.blueImpOptions[property_name];

					blueimp.Gallery(self.links[gallery_name], options);
				});
			});
		});
	},

	linkGet: function (elem)
	{
		var target = null;
		var link = null;
		var img_src = "";
		var img_title = "";

		var url = elem.href;

		var img = $(elem).find('img').eq(0);
		if (typeof img !== 'undefined') {
			var temp = $(img).attr('alt');
			if (typeof temp !== 'undefined')
				img_title = temp;
			temp = $(img).attr('src');
			if (typeof temp !== 'undefined')
				img_src = temp;
		}

		if (url.indexOf('youtube.') > -1) {
			var video_id = "";
			var video_id_start = url.indexOf('v=');

			if (video_id_start > -1) {
				var video_id_end = url.indexOf('&', video_id_start);

				if (video_id_end === -1)
					video_id_end = url.length;
				video_id = url.substring(video_id_start + 2, video_id_end);
			}

			if (video_id != "") {
				return {
					title: img_title,
					href: url,
					type: 'text/html',
					youtube: video_id,
					poster: img_src
				}
			};
		}

		return elem;
	}

};
EGallery.Class.prototype = EGallery;
