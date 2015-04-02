(function ($) {
	"use strict";

	$.fn.wLang = function () {

		return this.each(function () {
			var langList = $(this).find('.w-lang-list'),
				currentLang = $(this).find('.w-lang-current'),
				that = this,
				langListHeight = langList.height();

			langList.css({height: 0, display: 'none'});


			currentLang.click(function() {
				currentLang.addClass('active');
				langList.css({display: 'block'});
				langList.animate({height: langListHeight}, 200);
			});

			$(document).mouseup(function (e)
			{
				if ($(that).has(e.target).length === 0)
				{
					langList.animate({height: 0}, 200, function() {
						langList.css({display: 'none'});
						currentLang.removeClass('active');

					});
				}
			});
		});
	};
})(jQuery);

jQuery(document).ready(function() {
	"use strict";

	jQuery('.w-lang').wLang();
});
