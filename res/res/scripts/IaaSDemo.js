/**
 * Methods for IaaS demonstration
 */

var IaaSHeight = 148;
var IaaSOpen = true;


$( document ).ready(function () {
	$("#setHighCPULoadButton").click(function (e) {
		sendPostRequestIaaS("setHighCPU")
	});
	
	$("#deployAppIaaSChatOption").click(function (e) {
		sendPostRequestForAppIaaS("deployApp", "Chatapp.jar")
	});
	$("#deployAppIaaSExchangeOption").click(function (e) {
		sendPostRequestForAppIaaS("deployApp", "Exchange.jar")
	});
	
	$("#lowerCPUIaaSChatOption").click(function (e) {
		sendPostRequestForAppIaaS("lowerCPU", "Chatapp.jar")
	});
	$("#lowerCPUIaaSExchangeOption").click(function (e) {
		sendPostRequestForAppIaaS("lowerCPU", "Exchange.jar")
	});
	
	$("#undeployAppIaaSChatOption").click(function (e) {
		sendPostRequestForAppIaaS("undeployApp", "Chatapp.jar")
	});
	$("#undeployAppIaaSExchangeOption").click(function (e) {
		sendPostRequestForAppIaaS("undeployApp", "Exchange.jar")
	});
	
	$("#resetCPULoadButton").click(function (e) {
		sendPostRequestIaaS("resetCPULoad")
	});
});

function sendPostRequestIaaS(apiCall) {
	var url = serverUrl + "iaas/api/"+apiCall;
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", url, false);
	xmlHttp.send(null);
}

function sendPostRequestForAppIaaS(apiCall, appName) {
	var url = serverUrl + "iaas/api/"+apiCall;
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", url, false);
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlHttp.send("app="+appName);
}


