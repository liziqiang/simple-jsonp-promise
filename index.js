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
 * - jsonp {String} qs jsonpeter (defaults to `callback`)
 * - timeout {Number} how long after the request until a timeout error
 *   is emitted (defaults to `15000`)
 */
let jsonp = function( url, options ) {
    options     = options || {};
    let prefix  = options.prefix || '__jp';
    let jsonp   = options.jsonp || 'callback';
    let params  = options.params || {};
    let timeout = options.timeout ? options.timeout : 15000;
    let target  = document.getElementsByTagName( 'script' )[ 0 ] || document.head;
    let script;
    let timer;
    let cleanup;
    let promise;
    let noop    = function() {};
    // Generate a unique id for the request.
    let id      = prefix + (count++);
    cleanup     = function() {
        // Remove the script tag.
        if ( script && script.parentNode ) {
            script.parentNode.removeChild( script );
        }
        window[ id ] = noop;
        if ( timer ) { clearTimeout( timer ); }
    };
    promise     = new Promise( ( resolve, reject ) => {
        if ( timeout ) {
            timer = setTimeout( function() {
                cleanup();
                reject( new Error( 'Timeout' ) );
            }, timeout );
        }
        window[ id ]    = function( data ) {
            cleanup();
            resolve( data );
        };
        params[ jsonp ] = id;
        for ( let key in params ) {
            url += (~url.indexOf( '?' ) ? '&' : '?') + key + '=' + encodeURIComponent( params[ key ] );
        }
        url            = url.replace( '?&', '?' );
        // Create script.
        script         = document.createElement( 'script' );
        script.src     = url;
        script.onerror = function() {
            cleanup();
            reject( new Error( 'Network Error' ) );
        };
        target.parentNode.insertBefore( script, target );
    } );
    return promise;
};
export default jsonp;
