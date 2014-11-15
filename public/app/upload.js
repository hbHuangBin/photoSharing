
window[PS.modPrefix + "upload"] = {
	moduleId: "upload",

	initMod: function() {
		var that = this;

		$(document).on("ps:pjaxReady:upload", function(evt, options) {
			that.initUploadZone();
			that.initEvents();
		});
	},

	initPage: function() {
		/* called when upload page is loaded directly instead of via PJAX */
		this.initUploadZone();
		this.initEvents();
	},

	uploadZone: null,

	initUploadZone: function() {
		var uploadZone = new Dropzone("#main_cont div.ps_upload_zone", {
			url: "/upload/doUpload",
			paramName: "photo",
			uploadMultiple: false,
			parallelUploads: 3,
			autoProcessQueue: false,
			clickable: "#main_cont button.ps_btn_add",
			addRemoveLinks: true
		});

		this.uploadZone = uploadZone;

		uploadZone.on('addedfile', function(file) {
			$('#main_cont div.ps_upload_zone_ins').hide();
			$('#main_cont button.ps_btn_add span.badge').text(uploadZone.files.length.toString());
		});
		uploadZone.on('removedfile', function(file) {
			if (uploadZone.files.length <= 0) {
				$('#main_cont div.ps_upload_zone_ins').show();
			}
			$('#main_cont button.ps_btn_add span.badge').text(uploadZone.files.length.toString());
		});
	},

	initEvents: function() {
		var that = this;

		$("#main_cont button.ps_btn_upload").click(function(evt) {
			$(this).prop('disabled', true);

			that.uploadZone.processQueue();
		});
	}
};

