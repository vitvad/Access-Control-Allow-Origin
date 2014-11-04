var accessControlRequestHeaders;

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
	
	for (var i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name === "Access-Control-Request-Headers") {
			accessControlRequestHeaders = details.requestHeaders[i].value	
		}
	}	
	
	return {requestHeaders: details.requestHeaders};
};

var responseListener = function(details){
	var flag = false,
	rule = {
			"name": "Access-Control-Allow-Origin",
			"value": "*"
		};

	for (var i = 0; i < details.responseHeaders.length; ++i) {
		if (details.responseHeaders[i].name === rule.name) {
			flag = true;
			details.responseHeaders[i].value = rule.value;
			break;
		}
	}
	if(!flag) details.responseHeaders.push(rule);

	if (accessControlRequestHeaders) {

		details.responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders});

	}

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
		chrome.browserAction.setIcon({path: "off.png"});

		/*Remove Response Listener*/
		chrome.webRequest.onHeadersReceived.removeListener(responseListener);
		chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);
	}else{
		localStorage.active = true;
		chrome.browserAction.setIcon({path: "on.png"});

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