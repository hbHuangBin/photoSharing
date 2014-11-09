
window[PS.modPrefix + "upload"] = {
	moduleId: "upload",

	initMod: function() {
		var that = this;

		$(document).on("ps:pjaxReady:upload", function(evt, options) {
			that.initUploadZone();
		});
	},

	uploadZone: null,

	initUploadZone: function() {
		var uploadZone = new Dropzone("#main_cont div.ps_upload_zone", {
			url: "/upload/doUpload",
			paramName: "photo",
			uploadMultiple: false,
			autoProcessQueue: false,
			clickable: "#main_cont button.ps_btn_add",
			addRemoveLinks: true
		});

		this.uploadZone = uploadZone;
	}
};

