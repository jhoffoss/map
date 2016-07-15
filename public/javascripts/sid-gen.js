var $sid = $("#sid");
var length = 8,
		charset = "abcdefghijklmnopqrstuvwxyz0123456789",
		retVal = "";
for (var i = 0, n = charset.length; i < length; ++i) {
	retVal += charset.charAt(Math.floor(Math.random() * n));
}
$sid.attr('value', retVal);
