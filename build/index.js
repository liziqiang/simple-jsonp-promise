'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by lizq on 2017/8/7
 */

// Callback index.
var count = 0;

/**
 * JSONP handler
 *
 * Options:
 * - prefix {String} callback prefix (defaults to `__jp`)
 * - callback {String} (defaults to `callback`)
 * - timeout {Number} how long after the request until a timeout error
 *   is emitted (defaults to `15000`)
 */
function jsonp(url, options) {
    options = options || {};
    var prefix = options.prefix || '__jp';
    var callback = options.callback || 'callback';
    var params = options.data || {};
    var timeout = options.timeout ? options.timeout : 15000;
    var target = document.getElementsByTagName('script')[0] || document.head;
    var script = void 0;
    var timer = void 0;
    var promise = void 0;
    // Generate a unique id for the request.
    var id = prefix + count++;

    function noop() {}

    function cleanup() {
        // Remove the script tag.
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
        window[id] = noop;
        if (timer) {
            clearTimeout(timer);
        }
    }

    function serialize(params) {
        var param = '?';
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                param += '&' + key + '=' + encodeURIComponent(params[key]);
            }
        }
        return param;
    }

    promise = new Promise(function (resolve, reject) {
        if (timeout) {
            timer = setTimeout(function () {
                cleanup();
                reject(new Error('Timeout'));
            }, timeout);
        }
        window[id] = function (data) {
            cleanup();
            resolve(data);
        };
        params[callback] = id;
        url += serialize(params);
        url = url.replace('?&', '?');
        // Create script.
        script = document.createElement('script');
        script.src = url;
        script.onerror = function () {
            cleanup();
            reject(new Error('Network Error'));
        };
        target.parentNode.insertBefore(script, target);
    });
    return promise;
}

exports.default = jsonp;