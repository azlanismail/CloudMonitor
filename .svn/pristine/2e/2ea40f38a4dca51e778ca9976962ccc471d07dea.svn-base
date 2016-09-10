/**
 * Utility functions for visualization
 */


function log (level, string) {
	
	if (level >= logLevel) {
		
		var d = new Date();
	
		var dd = d.getDate() < 10 ? "0"+d.getDate() : d.getDate();
		var mm = d.getMonth() < 10 ? "0"+d.getMonth() : d.getMonth();
		var yy = d.getFullYear();
		var HH = d.getHours() < 10 ? "0"+d.getHours() : d.getHours();
		var MM = d.getMinutes() < 10 ? "0"+d.getMinutes() : d.getMinutes();
		var SS = d.getSeconds() < 10 ? "0"+d.getSeconds() : d.getSeconds();
	
		console.log(dd+"."+mm+"."+yy+" "+HH+":"+MM+":"+SS+" "+level+": "+string);
	}
}

function setCookie (cookie, value) {
	var date = new Date();
	date = new Date(date.getTime() + cookieExpiration);
	document.cookie = cookie + "=" + value +"; expires="+date.toGMTString()+";";
}


function enDisableElementWithId (elementId, disabled) {
	document.getElementById(elementId).disabled = disabled;
}