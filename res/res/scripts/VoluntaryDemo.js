/**
 * Methods for Voluntary demonstration
 */

var voluntaryHeight = 148;
var voluntaryOpen = true;

$( document ).ready(function () {	
	$("#deployAppVoluntaryChatOption").click(function (e) {
		sendPostRequestForAppVoluntary("deployApp", "Chatapp.jar")
	});
	$("#deployAppVoluntaryExchangeOption").click(function (e) {
		sendPostRequestForAppVoluntary("deployApp", "Exchange.jar")
	});
	
	$("#initFailChatOption").click(function (e) {
		sendPostRequestForAppVoluntary("initiatorFail", "Chatapp.jar")
	});
	$("#initFailExchangeOption").click(function (e) {
		sendPostRequestForAppVoluntary("initiatorFail", "Exchange.jar")
	});
	
	$("#newInitChatOption").click(function (e) {
		sendPostRequestForAppVoluntary("newInitiator", "Chatapp.jar")
	});
	$("#newInitExchangeOption").click(function (e) {
		sendPostRequestForAppVoluntary("newInitiator", "Exchange.jar")
	});
	
	$("#execFailChatOption").click(function (e) {
		sendPostRequestForAppVoluntary("executorFail", "Chatapp.jar")
	});
	$("#execFailExchangeOption").click(function (e) {
		sendPostRequestForAppVoluntary("executorFail", "Exchange.jar")
	});
	
	$("#undeployAppVoluntaryChatOption").click(function (e) {
		sendPostRequestForAppVoluntary("undeployApp", "Chatapp.jar")
	});
	$("#undeployAppVoluntaryExchangeOption").click(function (e) {
		sendPostRequestForAppVoluntary("undeployApp", "Exchange.jar")
	});
});

function sendPostRequestForAppVoluntary(apiCall, appName) {
	var url = serverUrl + "voluntary/api/"+apiCall;
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", url, false);
	xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlHttp.send("app="+appName);
}



