(function ($) {
	"use strict";

	$.fn.wSearch = function () {


		return this.each(function () {
			var searchForm = $(this).find('.w-search-form'),
				searchShow = $(this).find('.w-search-show'),
				searchClose = $(this).find('.w-search-close');

			if($().simplePlaceholder) {
				searchForm.find('.w-search-input-h input').simplePlaceholder();
			}

			if (searchShow) {
				searchShow.click(function(){
					searchForm.animate({ top: '0px'}, 250, function(){
						searchForm.find('.w-search-input input').focus();
					});
				});
			}

			if (searchClose) {
				searchClose.click(function(){
					searchForm.animate({ top: '-100%'}, 250);
				});
			}
		});
	};
})(jQuery);

jQuery(document).ready(function() {
	"use strict";

	jQuery('.w-search').wSearch();
});
