function clickMe() {
	var action = $('#proflink').attr('data-action');
	$("#loginTarget").load("" + action);
	$(".overlay").show("fast");
};

function changeEvPhoto() {
	var action = $('#changeEvPhoto').attr('data-action');
	$("#loginTarget").load("" + action);
	$(".overlay").show("fast");
};

function addEv() {
	var action = $('#addEv').attr('data-action');
	$("#loginTarget").load("" + action);
	$(".overlay").show("fast");
};

function deleteEv(test) {
	$("#loginTarget").load("deleteById?uid="+test);
	$(".overlay").show("fast");
};

$(document).ready(function () {

	$("#loginLink").click(function (event) {
		event.preventDefault();
		$(".overlay").show("fast");
	});

	$(".overlayLink").click(function (event) {
		event.preventDefault();
		var action = $(this).attr('data-action');
		$("#loginTarget").load("" + action);
		$(".overlay").show("fast");
	});

	$(".updateProfileLink").click(function (event) {
		event.preventDefault();
		var action = $(this).attr('data-action');
		$("#loginTarget").load("" + action);
	});

	$(".updateImage").click(function (event) {
		event.preventDefault();
		var action = $(this).attr('data-action');
		$("#loginTarget").load("" + action);
	});

	$(".close").click(function (e) {
		if ($(".overlay").css("display") != "none") {
			e.preventDefault();
			$(".overlay").hide("fast");
		}
	});

	$(document).keyup(function (e) {
		if (e.keyCode == 27 && $(".overlay").css("display") != "none") {
			e.preventDefault();
			$(".overlay").hide("fast");
		}
	});
});
