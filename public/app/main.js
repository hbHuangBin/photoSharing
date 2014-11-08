
var PS = {
	initNavbar: function() {
		$("nav a.pjaxable").click(function(evt) {
			$("nav ul.nav > li").removeClass("active");
			$(this).parentsUntil("ul.nav", "li").not(function() {
				return !($(this).parent().hasClass("nav"));
			}).addClass("active");
		});
		$(document).pjax("nav a.pjaxable", "#main_cont");
	},

	initPjaxEvent: function() {
		$(document).on("pjax:success", function(evt, data, status, xhr, options) {
		});
	}
};

$(document).ready(function() {
	PS.initNavbar();
	PS.initPjaxEvent();
});

