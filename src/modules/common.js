'use strict';

/* eslint-disable */
function extendDefaults(source, properties) {
    let property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            if(properties[property] !== null &&
                typeof properties[property] !== 'undefined') {
                source[property] = properties[property];
            }
        }
    }
    return source;
}

function getParentUrl() {
    let referrer = (window.location !== window.parent.location)
        ? (document.referrer && document.referrer !== '')
            ? document.referrer
            : document.location.href
        : document.location.href;

    if (document.referrer.indexOf('localhost') !== -1) {
        referrer = 'https://gamedistribution.com/';
    }

    return referrer;
}

function getQueryParams(){
    let match;
    const pl = /\+/g;  // Regex for replacing addition symbol with a space
    const search = /([^&=]+)=?([^&]*)/g;
    const decode = function (s) {
        return decodeURIComponent(s.toLowerCase().replace(pl, " "));
    };
    const query = window.location.search.substring(1);

    let urlParams = {};
    while (match = search.exec(query)) {
        urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams;
}

function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
        return uri + separator + key + '=' + value;
    }
}

/**
 * debounce
 * Ensures a function won't be called before a defined amount of time.
 * Ex:
 *    on window resize, ensure a function won't be called
 *    until the user stopped resizing window for {time param}
 *
 * @param { function } fn Callback to be executed after debounce
 * @param { int } time Time to wait before function execution
 * @return {function(...[*])}
 */
function debounce(fn, time = 300) {
    // Store active timeout.
    let timeout;

    return (...args) => {
        // Clear active timeout to prevent fn execution
        clearTimeout(timeout);
        // Start a new timeout
        timeout = setTimeout(fn.bind(null, ...args), time);
    };
}

export {
    extendDefaults,
    getParentUrl,
    getQueryParams,
    updateQueryStringParameter,
    debounce,
};
/* eslint-enable */
