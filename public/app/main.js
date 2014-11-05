
var PS = {
	initNavbar: function() {
		$("#nav_upload").on("click", function(evt) {
			evt.preventDefault();
			PS.switchContent("upload");
		});
	},
	switchContent: function(name) {
		switch (name) {
			case "upload": {
				$("#main_cont").empty();
				/* XXX: for now create the html in js */
				$("#main_cont").html('<div id="upload_block" class="upload_zone">click to upload</div>');
				var uploadDz = new Dropzone("#upload_block", {
					url: "/upload/upload-image",
					autoProcessQueue: false
				});
				break;
			}
		}
	}
};

$(document).ready(function() {
	PS.initNavbar();
});

