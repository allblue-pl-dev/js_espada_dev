var EShrink = {
	self: null,

    ClassName: 'eShrink_Shrinked',

    GetScrollY: function()
	{
		return window.pageYOffset || document.documentElement.scrollTop;
	},


	_elements: null,
	_shrinkAt: -1,

	_inProgress: false,

    Class: function(elements, shrink_at)
    {
        var self = this.self = this;

        self._shrinkAt = shrink_at;
        self._elements = elements;

        if (window.readState === 'complete')
            self._initialize();
        else {
            window.addEventListener('load', function() {
                self._initialize();
            });
        }
    },

	_initialize: function()
	{
		var self = this.self;

		window.addEventListener('scroll', function(event) {
			if (self._inProgress)
				return;
			self._inProgress = true;

			setTimeout(function() {
                self._pageScrolled();
            }, 50);
		}, false);

		self._pageScrolled();
		self._addClass('eShrink_Anim');
	},

    _pageScrolled: function()
	{
		var self = this.self;

		var sy = EShrink.GetScrollY();
		if (sy >= self._shrinkAt)
			self._addClass('eShrink_Shrinked');			
		else
			self._removeClass('eShrink_Shrinked');

		self._inProgress = false;
	},

    /* Helpers */
    _addClass: function(class_name)
    {
        var self = this.self;

        for (var i = 0; i < self._elements.length; i++) {
            var elem = self._elements[i];

            if (elem.classList)
                elem.classList.add(class_name);
            else
                elem.className += ' ' + class_name;
        }
    },

    _removeClass: function(class_name)
    {
        var self = this.self;

        for (var i = 0; i < self._elements.length; i++) {
            var elem = self._elements[i];

            if (elem.classList)
                elem.classList.remove(class_name);
            else {
                var regexp = new RegExp('(^|\\b)' +
                        class_name.split(' ').join('|') +
                        '(\\b|$)', 'gi');

                elem.className = elem.className.replace(regexp, ' ');
            }
        }
    }

};
EShrink.Class.prototype = EShrink;
