/**
 * Created by jhoff on 8/2/2016.
 */

var calcHeight = (($(document).height() * .92) - $("#loginTarget").height()) / 2;
$("#loginTarget").css("top","" + calcHeight + "px");
