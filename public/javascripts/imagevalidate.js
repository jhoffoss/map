/**
 * Created by James on 8/2/2016.
 */

$(function () {
	$('#photo').fileupload({
		dataType: 'json',
		done: function (e, data) {
			$.each(data.result.files, function (index, file) {
				$('<p/>').text(file.name).appendTo(document.body);
			});
		}
	});
});


