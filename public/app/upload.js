
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

	previewTemplate: '<div class="dz-preview dz-image-preview col-md-3 col-xs-6">' +
						'<div class="thumbnail">' +
							'<div class="dz-details">' +
								'<div class="dz-details-text">' +
									'<div class="dz-filename"><span data-dz-name></span></div>' +
									'<div class="dz-size" data-dz-size></div>' +
								'</div>' +
								'<img class="dz-thumbnail" data-dz-thumbnail />' +
							'</div>' +
							'<div class="dz-progress">' +
								'<div class="progress">' +
									'<div class="progress-bar progress-bar-striped" role="progressbar" style="width: 0;" data-dz-uploadprogress>' +
										'<span class="dz-upload-text">0%</span>' +
									'</div>' +
								'</div>' +
							'</div>' +
							'<div class="dz-remove">' +
								'<button type="button" class="close" data-dz-remove><span>&times;</span></button>' +
							'</div>' +
							'<div class="dz-error-message"><span data-dz-errormessage></span></div>' +
						'</div>' +
					'</div>',

	initUploadZone: function() {
		var uploadZone = new Dropzone("#main_cont div.ps_upload_zone", {
			url: "/upload/doUpload",
			paramName: "photo",
			uploadMultiple: false,
			parallelUploads: 3,
			autoProcessQueue: false,
			clickable: "#main_cont button.ps_btn_add",
			previewsContainer: "#main_cont div.ps_upload_zone_main_row",
			previewTemplate: this.previewTemplate,
			thumbnailWidth: 300,
			thumbnailHeight: null
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
		uploadZone.on('uploadprogress', function(file, percentage) {
			$(file.previewElement).find('span.dz-upload-text').text(percentage + '%');
			if (percentage >= 100) {
				$(file.previewElement).find('div.dz-remove').hide();
			}
		});
		uploadZone.on('complete', function(file) {
			if (uploadZone.getQueuedFiles().length > 0) {
				console.log('still has %d to be uploaded', uploadZone.getQueuedFiles().length);
				uploadZone.processQueue();
			}
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

