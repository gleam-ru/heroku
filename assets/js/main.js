$(document).ready(function() {
	initComments();
});


/**
 * Инициализация логики работы модуля комментирования
 * (скрыт по-умолчанию, таггл, итд...)
 */
function initComments() {
	// если модуль комментариев не подключен
	if(typeof(_hcpw) === 'undefined')
		showComments();
	// $('.w-comments-list').hide();
	var ce = $('.w-comments-list');
	var sce = $('#showComments');
	var hce = $('#hideComments');
	$('#showComments, #hideComments').click(function() {
		sce.toggle();
		hce.toggle();
		ce.slideToggle();
		// если модуль комментариев не подключен
		if(typeof(_hcpw) === 'undefined')
			showComments();
	});
}

/**
 * Инициализация модуля комментирования внутри элемента #hypercomments_widget
 */
function showComments() {
	window._hcwp = window._hcwp || [];
	_hcwp.push({
		widget:"Stream",
		widget_id: 21585,
		callback: function() {
			// хакаем стили
			$('.hc_menu_box').remove();
			$('#hc_footer').remove();
		}
	});
	(function() {
		if("HC_LOAD_INIT" in window)
			return;
		HC_LOAD_INIT = true;
		var lang = (navigator.language || navigator.systemLanguage || navigator.userLanguage || "en").substr(0, 2).toLowerCase();
		var hcc = document.createElement("script");
		hcc.type = "text/javascript";
		hcc.async = true;
		hcc.src = ("https:" == document.location.protocol ? "https" : "http")+"://w.hypercomments.com/widget/hc/21585/"+lang+"/widget.js";
		var s = document.getElementsByTagName("script")[0];
		s.parentNode.insertBefore(hcc, s.nextSibling);
	})();
}