/**
 * Configuration
 */


/**
 * Appearence
 */

var width = 1670;
var height = 1025;

var menuWidth = 270;
var menuInnerWidth = menuWidth - 20;
var collapsedMenuWidth = 100;
var collapsedMenuHeight = 40;
var menuDistance = 20;
var menuLabelOffsetX = 25;
var menuLabelOffsetY = 150;

var appTableWidth = 250;
var appTableHeight = 150;
var appTablePositioningFactor = 0.1;

var nodeTableWidth = 170;
var nodeTableHeight = 100;

var logLevel = 2;
var updateInterval = 1000;

var highCpuLoadLimit = 0.8;
var cpuYellowThreshold = 0.65
var cpuRedThreshold = 0.8;
var memYellowThreshold = 0.7
var memRedThreshold = 0.85;
var diskYellowThreshold = 0.85;
var diskRedThreshold = 0.9;

var showMessageText = true;
var showBroadcastText = true;
var showSingleNodes = false;

var cookieExpiration = 1000*60*60*24*365; // 1 year
var cookies = document.cookie.split(";");
for (var i in document.cookie.split(";")) {
	var cookie = cookies[i].split("=");
	var name = cookie[0].trim();
	var value = cookie[1];

	if (name == "showMessageText")
		showMessageText = value == "true" ? true : false;
	else if (name == "showBroadcastText")
		showBroadcastText = value == "true" ? true : false;
	else if (name == "showSingleNodes")
		showSingleNodes = value == "true" ? true : false;
}

var serverUrl = "http://"+window.location.hostname+":"+window.location.port+"/";
/*
var IaaSDemoState = "WAITING";
var voluntaryDemoState = "WAITING";
getIaaSDemoState();
setInterval(getIaaSDemoState, 10000);
*/

