'use strict';

import 'es6-promise/auto';
import 'whatwg-fetch';

import {
    extendDefaults,
    getParentUrl,
    getQueryParams,
    updateQueryStringParameter,
} from './modules/common';

let instance = null;

/**
 * Embed
 */
class Embed {
    /**
     * Constructor of Embed.
     * @param {Object} options
     * @return {*}
     */
    constructor(options) {
        // Make this a singleton.
        if (instance) {
            return instance;
        } else {
            instance = this;
        }

        // Set some defaults. We replace them with real given
        // values further down.
        const defaults = {
            debug: false,
        };

        if (options) {
            this.options = extendDefaults(defaults, options);
        } else {
            this.options = defaults;
        }

        this.referrer = getParentUrl();
        console.log(this.referrer);
    }

    /**
     * start
     */
    start() {
        const params = getQueryParams();
        this.createFrame(params.url, params.width, params.height);
    }

    /**
     * createFrame
     * @param {String} url
     * @param {String} width
     * @param {String} height
     */
    createFrame(url, width, height) {
        const frameUrl = updateQueryStringParameter(url, 'gd_sdk_referrer_url', this.referrer);

        /* eslint-disable */
        const css = ``;
        /* eslint-enable */

        const head = document.head || document.getElementsByTagName('head')[0];
        const style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);

        const iframe = document.createElement('iframe');
        iframe.src = frameUrl;
        iframe.width = width;
        iframe.height = height;
        iframe.scrolling = 'none';
        iframe.frameBorder = '0';
        iframe.style.width = `${width}px`;
        iframe.style.height = `${height}px`;

        const body = document.body || document.getElementsByTagName('body')[0];
        body.insertBefore(iframe, body.firstChild);
    }
}

export default Embed;

const embed = new Embed({});
embed.start();
