var accessControlRequestHeaders;
var exposedHeaders;

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

	if(exposedHeaders) {
		details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": exposedHeaders});
	}

	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD"});

	return {responseHeaders: details.responseHeaders};
	
};

/*On install*/
chrome.runtime.onInstalled.addListener(function(){
	chrome.storage.local.set({'active': false});
	chrome.storage.local.set({'urls': ["*://*/*"]});
	chrome.storage.local.set({'exposedHeaders': ''});
	reload();
});

/*Reload settings*/
function reload() {
	chrome.storage.local.get({'active': false, 'urls': ["*://*/*"], 'exposedHeaders': ''}, function(result) {

		exposedHeaders = result.exposedHeaders;

		/*Remove Listeners*/
		chrome.webRequest.onHeadersReceived.removeListener(responseListener);
		chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);

		if(result.active) {
			chrome.browserAction.setIcon({path: "on.png"});

			if(result.urls.length) {

				/*Add Listeners*/
				chrome.webRequest.onHeadersReceived.addListener(responseListener, {
					urls: result.urls
				},["blocking", "responseHeaders"]);

				chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
					urls: result.urls
				},["requestHeaders"]);
			}
		} else {
			chrome.browserAction.setIcon({path: "off.png"});
		}
	});
}
