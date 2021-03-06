/**
 * Created by lizq on 2017/8/7
 */

// Callback index.
let count = 0;

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
    let prefix = options.prefix || '__jp';
    let callback = options.callback || 'callback';
    let callbackName = options.callbackName;
    let params = options.data || {};
    let timeout = options.timeout ? options.timeout : 15000;
    let target = document.getElementsByTagName('script')[0] || document.head;
    let script;
    let timer;
    let promise;
    // Generate a unique id for the request.
    let id = callbackName || prefix + count++;

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
        let param = '';
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                param += `&${key}=${encodeURIComponent( params[ key ] )}`;
            }
        }
        return param;
    }

    function handleUrl(url, params) {
        if (!~url.indexOf('?')) { url += '?'; }
        url += serialize(params);
        url = url.replace('?&', '?');
        return url;
    }

    promise = new Promise((resolve, reject) => {
        if (timeout) {
            timer = setTimeout(() => {
                cleanup();
                reject(new Error('Timeout'));
            }, timeout);
        }
        window[id] = function (data) {
            cleanup();
            resolve(data);
        };
        if (!callbackName) {
            params[callback] = id;
        }
        url = handleUrl(url, params);
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

export default jsonp;
