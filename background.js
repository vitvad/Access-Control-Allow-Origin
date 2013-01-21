var requestListener = function(details){
	var flag = false,
		rule = {
			name: "Origin",
			value: "http://evil.com/"
		};

	for (var i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name === rule.name) {
			flag = true;
			details.requestHeaders[i].value = rule.value;
			break;
		}
	}
	if(!flag) details.requestHeaders.push(rule);
	return {requestHeaders: details.requestHeaders};
};

var responseListener = function(details){
	var rule = {
			"name": "Access-Control-Allow-Origin",
			"value": "*"
		};

	details.responseHeaders.push(rule);

	return {responseHeaders: details.responseHeaders};
};


/*On install*/
chrome.runtime.onInstalled.addListener(function(){
	localStorage.active = false;
});

/*Icon change*/
chrome.browserAction.onClicked.addListener(function(tab){
	if(localStorage.active === "true"){
		localStorage.active = false;
		chrome.browserAction.setIcon({path: "off.gif"});

		/*Remove Response Listener*/
		chrome.webRequest.onHeadersReceived.removeListener(responseListener);
		chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);
	}else{
		localStorage.active = true;
		chrome.browserAction.setIcon({path: "on.gif"});

		/*Add Response Listener*/
		chrome.webRequest.onHeadersReceived.addListener(responseListener,{
			urls: [
				"*://*/*"
			]
		},["blocking", "responseHeaders"]);

		chrome.webRequest.onBeforeSendHeaders.addListener(requestListener,{
			urls: [
				"*://*/*"
			]
		},["requestHeaders"]);
	}
});