var url = require('url');
var npmPackage = require('../package.json');
var check = false;
module.exports.create = function (pages) {
    var har = {
            'TimeTaken': []

    };
    pages.forEach(function (page) {
        if (!page.isFailed()) {
            var pageHar = fromPage(page);
            Array.prototype.push.apply(har.TimeTaken, pageHar.TimeTaken);
        }
    });
    return har;
};

function fromPage(page) {
    check = false;
    // TimeTaken
    var TimeTaken = [];
    for (var requestId in page.objects) {
        var object = page.objects[requestId];
        // skip incomplete TimeTaken, those that have no timing information (since
        // it's optional) or data URI requests
        if (!object.responseMessage || !object.responseFinished || !object.responseMessage.response.timing ||
            object.requestMessage.request.url.match('^data:')) {
            continue;
        }
        // check for redirections
        var redirectUrl = '';
        if (object.requestMessage.redirectResponse) {
            redirectUrl = object.requestMessage.redirectResponse.url;
        }
        // HTTP version or protocol name
        var protocol = object.responseMessage.response.protocol || 'unknown';
        // process headers
        var requestHeaders = convertHeaders(
            object.responseMessage.response.requestHeaders ||
            object.requestMessage.request.headers);
        var responseHeaders = convertHeaders(object.responseMessage.response.headers);
        // estimaate the header size according to the protocol
        if (protocol.match(/http\/[01].[01]/)) {
            // add status line length (12 = "HTTP/1.x" + "  " + "\r\n")
            requestHeaders.size += (object.requestMessage.request.method.length +
            object.requestMessage.request.url.length + 12);
            responseHeaders.size += (object.responseMessage.response.status.toString().length +
            object.responseMessage.response.statusText.length + 12);
        } else {
            // information not available due to possible compression newer
            // versions of HTTP
            requestHeaders.size = -1;
            responseHeaders.size = -1;
        }
        // query string
        var queryString = convertQueryString(object.requestMessage.request.url);
        // object timings
        var timing = object.responseMessage.response.timing;
        var duration = object.responseFinished - timing.requestTime;

        // fill entry
        var ur = object.requestMessage.request.url.toString();
        if (((object.requestMessage.request.url == page.url) || (ur.indexOf("ads?gdfp") != -1)) && check == false ) {
            if(ur.indexOf("ads?gdfp") != -1){
                check = true;
            }
            TimeTaken.push({
                'startedDateTime': new Date(object.requestMessage.wallTime * 1000).toISOString(),
                'time': toMilliseconds(duration),
                'request': {
                    'url': object.requestMessage.request.url
                }
            });
            // outcome
            if(check == true){
                var d1 = new Date(TimeTaken[0].startedDateTime);
                var d2 = new Date(TimeTaken[1].startedDateTime);
                TimeTaken = [];
                TimeTaken.push({'timeDifference':d2-d1});
                return {

                    'TimeTaken': TimeTaken
                };
            }

        }

    }

}

function toMilliseconds(time) {
    return time === -1 ? -1 : time * 1000;
}

function convertQueryString(fullUrl) {
    var query = url.parse(fullUrl, true).query;
    var pairs = [];
    for (var name in query) {
        var value = query[name];
        pairs.push({'name': name, 'value': value.toString()});
    }
    return pairs;
}

function convertHeaders(headers) {
    headersObject = {'pairs': [], 'size': undefined};
    if (Object.keys(headers).length) {
        headersObject.size = 2; // trailing "\r\n"
        for (var name in headers) {
            var value = headers[name];
            headersObject.pairs.push({'name': name, 'value': value});
            headersObject.size += name.length + value.length + 4; // ": " + "\r\n"
        }
    }
    return headersObject;
}
