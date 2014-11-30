'use strict';
  /**
   * @TODO:
   * - On istall Open page with changelog
   * - Settings Page
   * - Custom response
   */

//chrome.browserAction.setBadgeText({text: '(o_O)|")'});

var debugURLS = ['http://localhost/'];

var accessControlRequestHeaders;
var exposedHeaders;


var requestRules = [{
  'data': {
    'name': 'Origin',
    'value': 'http://evil.com/'
  },
  'mandatory': true,
  'fn': null
}, {
  'data': {
    'name': 'Access-Control-Request-Headers',
    'value': null,
  },
  'mandatory': false,
  'fn': function(rule, header) {
    accessControlRequestHeaders = header.value;
  }
}];


var responseRules = [{
  'data': {
    'name': 'Access-Control-Allow-Origin',
    'value': '*'
  },
  'mandatory': true,
  'fn': null
}, {
  'data': {
    'name': 'Access-Control-Allow-Headers',
    'value': accessControlRequestHeaders
  },
  'mandatory': true,
  'fn': null
}, {
  'data': {
    'name': 'Access-Control-Allow-Credentials',
    'value': 'true'
  },
  'mandatory': false,
  'fn': null
}, {
  'data': {
    'name': 'Access-Control-Allow-Methods',
    'value': 'POST, GET, OPTIONS, PUT'
  },
  'mandatory': true,
  'fn': null
}];

var requestListener = function(details) {
  requestRules.forEach(function(rule) {
    var flag = false;

    details.requestHeaders.forEach(function(header) {
      if (header.name === rule.data.name) {
        flag = true;
        if (rule.fn) {
          rule.fn.call(null, rule, header);
        } else {
          header.value = rule.data.value;
        }
      }
    });

    //add this rule anyway if it's not present in request headers
    if (!flag && rule.mandatory && rule.data.value) {
      details.requestHeaders.push(rule.data);
    }
  });

  if (debugURLS.indexOf(details.url) > -1) {
    console.group('Request');
    console.log(JSON.stringify(details, null, 2));
    console.groupEnd('Request');
  }

  return {
    requestHeaders: details.requestHeaders
  };
};

var responseListener = function(details) {
  var headers = responseRules.filter(function(rule) {
    var und; //undefined
    return rule.value !== und && rule.value !== null;
  });

  responseRules.forEach(function(rule) {
    var flag = false;

    details.responseHeaders.forEach(function(header) {
      // if rule exist in response - rewrite value
      if (header.name === rule.data.name) {
        flag = true;
        if (rule.fn) {
          rule.fn.call(null, rule.data, header);
        } else {
          if (rule.data.value) {
            header.value = rule.data.value;
          } else {
            //@TODO DELETE this header
          }
        }
      }
    });

    //add this rule anyway if it's not present in request headers
    if (!flag && rule.mandatory && rule.data.value) {
      details.responseHeaders.push(rule.data);
    }
  });

  //details.responseHeaders = details.responseHeaders.concat(headers);


  //@todo REMOVE test
  if (debugURLS.indexOf(details.url) > -1) {
    console.group('Response');
    console.log(JSON.stringify(headers, null, 2));
    console.log(JSON.stringify(details, null, 2));
    console.groupEnd('Response');
  }
  return {
    responseHeaders: details.responseHeaders
  };
};

/*Reload settings*/
var reload = function () {
  chrome.storage.local.get({
      'active': false,
      'urls': ['*://*/*'],
      'exposedHeaders': ''
    },
    function(result) {
      exposedHeaders = result.exposedHeaders;
      console.info(exposedHeaders);

      /*Remove Listeners*/
      chrome.webRequest.onHeadersReceived.removeListener(responseListener);
      chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);

      if (result.active) {
        chrome.browserAction.setIcon({
          path: 'images/on.png'
        });

        if (result.urls.length) {
          /*Add Listeners*/
          chrome.webRequest.onHeadersReceived.addListener(responseListener, {
            urls: result.urls
          }, ['blocking', 'responseHeaders']);

          chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
            urls: result.urls
          }, ['blocking', 'requestHeaders']);
        }
      } else {
        chrome.browserAction.setIcon({
          path: 'images/off.png'
        });
      }
    });
};

/*On install*/
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('previousVersion', JSON.stringify(details, null, 2));

  chrome.storage.local.set({
    'active': true
  });
  chrome.storage.local.set({
    'urls': ['*://*/*']
  });
  chrome.storage.local.set({
    'exposedHeaders': ''
  });
  reload();
});
