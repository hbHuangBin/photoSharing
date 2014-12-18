
function validataUserName() {
	var $userName = $("#username");
	if (/^\s*$/.test($userName.val())) {
		$userName.closest("div.form-group").addClass("has-error");
		return false;
	}

	$userName.closest("div.form-group").removeClass("has-error");
	return true;
}

function validataPassword() {
	var $password = $("#password");
	if (/^\s*$/.test($password.val())) {
		$password.closest("div.form-group").addClass("has-error");
		return false;
	}

	$password.closest("div.form-group").removeClass("has-error");
	return true;
}

function doLogin() {
	var username = $("#username").val();
	var password = $("#password").val();
	var signinDone = false;

	$("#username, #password").prop("readonly", true);
	$("#signinBtn").prop("disabled", true);
	$("#signinLoader").show();

	$.ajax({
		type: "POST",
		url: "/login/signin",
		dataType: "json",
		timeout: 10000,
		cache: false,
		data: {
			user: username,
			pw: password
		},
		success: function(data) {
			if (data.success === true) {
				signinDone = true;
				setTimeout(function() {
					location.href = data.next;
				}, 1000);
			}
			else {
				showErrorMsg(data.msg ? data.msg : "Authenticating failed!");
			}
		},
		error: function(xhr, textStatus) {
			showErrorMsg("Error to communicate with server!");
		},
		complete: function(xhr, textStatus) {
			$("#signinLoader").hide();
			if (!signinDone) {
				$("#username, #password").prop("readonly", false);
				$("#signinBtn").prop("disabled", false);
				$("#username").focus();
				$("#username, #password").val("");
			}
		}
	});
}

function showErrorMsg(msg) {
	if (msg === null) {
		$("#signin_msg").hide();
	}
	else {
		$("#signin_msg").show().text(msg);
	}
}

function initEvents() {
	$("#signinBtn").click(function() {
		showErrorMsg(null);
		if (validataUserName() && validataPassword()) {
			doLogin();
		}
	});
	$("#username").blur(function() {
		validataUserName();
	});
	$("#password").blur(function() {
		validataPassword();
	});
	$("#username, #password").keypress(function(event) {
		if (event.which === 13) {
			event.preventDefault();
			event.stopPropagation();
			$("#signinBtn").triggerHandler("click");
		}
	});
}

$(document).ready(function() {
	initEvents();
});

