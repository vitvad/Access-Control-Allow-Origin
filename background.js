var accessControlRequestHeaders;
var exposedHeaders;

var requestListener = function(details){
	var flag = false;
	// Specify a `name` and `value` property within `rule` to
	// customize a request header. For instance, the commented
	// out values will include in the header "Origin: 'https://my_changed_origin.com'"
	var rule = null;
	// var rule = {
		// name: "Origin",
		// value: "https://my_changed_origin.com"
	// };
	var i;

	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (rule && details.requestHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
			flag = true;
			details.requestHeaders[i].value = rule.value;
			break;
		}
	}
	if(rule && !flag) details.requestHeaders.push(rule);
	
	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() === "access-control-request-headers") {
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
		if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
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

	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});

	return {responseHeaders: details.responseHeaders};
	
};

/*On install*/
chrome.runtime.onInstalled.addListener(function(){
	chrome.storage.local.set({'active': false});
	chrome.storage.local.set({'urls': ["<all_urls>"]});
	chrome.storage.local.set({'exposedHeaders': ''});
	reload();
});

/*Reload settings*/
function reload() {
	chrome.storage.local.get({'active': false, 'urls': ["<all_urls>"], 'exposedHeaders': ''}, function(result) {

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
				},["blocking", "requestHeaders"]);
			}
		} else {
			chrome.browserAction.setIcon({path: "off.png"});
		}
	});
}
