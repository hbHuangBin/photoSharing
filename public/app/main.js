/**
 * The main entry of application, defines namespace and essential functions to
 * initialize the frontend system.
 */
var PS = {
	modules: [
		{id: "upload", path: "/app/upload.js"}
	],
	modPrefix: "__ps_mod_",

	initModules: function() {
		var that = this;

		that.modules.forEach(function(elem, index, arr) {
			$('<script></script>').appendTo(document.body).load(function() {

				that[elem.id] = window[that.modPrefix + elem.id];
				delete window[that.modPrefix + elem.id];

				that[elem.id].initMod();

				arr.inited = arr.inited || 0;
				if (++(arr.inited) >= arr.length) {
					/* all module scripts loaded */
					$(document).trigger("ps:modulesInited");
				}
			}).attr("src", elem.path);
		});

		$(document).on("ps:modulesInited", function(evt) {
			if (window.callModuleId && callModuleId.length > 0) {
				that[callModuleId].initPage();
			}
		});
	},

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
		$(document).on("pjax:end", function(evt, xhr, options) {
			var pjaxId = $(options.target).data("pjaxid");
			$(document).trigger("ps:pjaxReady:"+pjaxId, options);
		});
	}
};

$(document).ready(function() {
	PS.initModules();
	PS.initNavbar();
	PS.initPjaxEvent();
});

