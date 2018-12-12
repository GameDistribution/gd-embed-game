'use strict';

import 'es6-promise/auto';
import 'whatwg-fetch';
import screenfull from 'screenfull';

import {
    extendDefaults,
    getParentUrl,
    getQueryParams,
    updateQueryStringParameter,
    debounce,
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

        this.params = getQueryParams();
        this.referrer = getParentUrl();
    }

    /**
     * start
     * @public
     */
    start() {
        if (this._isIE()) {
            this.startIEDisclaimer(() => {
                this._createFrame(
                    this.params.url,
                    parseInt(this.params.width),
                    parseInt(this.params.height),
                );
            });
        } else {
            this._createFrame(
                this.params.url,
                parseInt(this.params.width),
                parseInt(this.params.height),
            );
        }
    }

    /**
     * startDisclaimer
     * Used to display a disclaimer message for IE11 and below users.
     * As we simply can't guarantee IE11 and below support for games.
     * @param {Function} callback
     * @public
     */
    startIEDisclaimer(callback) {
        // If IE browser.
        const language = this.params.language ||
            this._getFirstBrowserLanguage();
        let message = '';
        let label = '';

        /* eslint-disable */
        switch (language) {
            case 'nl':
                message = `Deze game is mogelijk niet geoptimaliseerd voor jouw internetbrowser. Prestatieproblemen kunnen optreden.`;
                label = `Doorgaan`;
                break;
            case 'es':
                message = `Es posible que este juego no esté optimizado para este navegador. Los problemas de rendimiento pueden ocurrir.`;
                label = `Continuar`;
                break;
            default:
                message = `This game might not be optimized for your internet browser. Performance issues might occur.`;
                label = `Continue`;
        }
        /* eslint-enable */

        const messageElement = document.createElement('p');
        messageElement.innerText = message;

        const buttonElement = document.createElement('button');
        buttonElement.innerText = label;
        buttonElement.addEventListener('click', () => {
            container.innerHTML = '';
            if (typeof callback === 'function') {
                callback();
            }
        });

        const container = document.getElementById('container');
        container.appendChild(messageElement);
        container.appendChild(buttonElement);
    }

    /**
     * _createFrame
     * @param {String} url
     * @param {Number} width
     * @param {Number} height
     * @private
     */
    _createFrame(url, width, height) {
        const container = document.getElementById('container');

        const frame = document.createElement('iframe');
        frame.src = updateQueryStringParameter(url, 'gd_sdk_referrer_url',
            this.referrer);
        frame.scrolling = 'none';
        frame.frameBorder = '0';
        frame.setAttribute('allowfullscreen', 'true');

        this._setFrameDimensions(frame, width, height);

        container.insertBefore(frame, container.firstChild);

        addEventListener('resize', () => {
            debounce(this._setFrameDimensions(frame, width, height), 100);
        }, false);

        if (screenfull.enabled) {
            const button = document.createElement('button');
            /* eslint-disable */
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 9h-4v-5h-5v-4h9v9zm-9 15v-4h5v-5h4v9h-9zm-15-9h4v5h5v4h-9v-9zm9-15v4h-5v5h-4v-9h9z"/></svg>`;
            /* eslint-enable */
            button.style.position = 'absolute';
            button.style.top = '1rem';
            button.style.right = '1rem';
            button.addEventListener('click', () => {
                screenfull.request(frame);
                setTimeout(() => {
                    this._setFrameDimensions(frame, width, height);
                }, 1000);
            });

            this._fullscreenButton(button);

            container.insertBefore(button, container.firstChild);

            addEventListener('resize', () => {
                debounce(this._fullscreenButton(button), 100);
            }, false);
        }
    }

    /**
     * _fullscreenButton
     * @param {Object} button
     * @private
     */
    _fullscreenButton(button) {
        const displayMode = this._setDisplayMode();
        if (displayMode === 'mobile') {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    }

    /**
     * _setFrameDimensions
     * @param {Object} frame
     * @param {Number} width
     * @param {Number} height
     * @private
     */
    _setFrameDimensions(frame, width, height) {
        const dimensions = this._calculateAspectRatioFit(
            width,
            height,
            window.innerWidth,
            window.innerHeight,
        );

        frame.width = `${dimensions.width}`;
        frame.height = `${dimensions.height}`;
        frame.style.width = `${dimensions.width}px`;
        frame.style.height = `${dimensions.height}px`;
    }

    /**
     * _calculateAspectRatioFit
     * Resize arbitrary width x height region to fit inside another region.
     * @param {Number} srcWidth
     * @param {Number} srcHeight
     * @param {Number} maxWidth
     * @param {Number} maxHeight
     * @return {Object} { width, height }
     * @private
     */
    _calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return {
            width: Math.round(srcWidth * ratio),
            height: Math.round(srcHeight * ratio),
        };
    }

    /**
     * _getFirstBrowserLanguage
     * @return {*}
     * @private
     */
    _getFirstBrowserLanguage() {
        const nav = window.navigator;
        const browserLanguagePropertyKeys = [
            'language',
            'browserLanguage',
            'systemLanguage',
            'userLanguage'];
        let i;
        let language;

        // support for HTML 5.1 "navigator.languages"
        if (Array.isArray(nav.languages)) {
            for (i = 0; i < nav.languages.length; i++) {
                language = nav.languages[i];
                if (language && language.length) {
                    return language.split('-')[0];
                }
            }
        }

        // support for other well known properties in browsers
        for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
            language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                return language.split('-')[0];
            }
        }

        return null;
    }

    /**
     * _isIE
     * @return {boolean}
     * @private
     */
    _isIE() {
        // Check the userAgent property of the window.navigator object
        const ua = window.navigator.userAgent;

        // IE 10 or older.
        const msie = ua.indexOf('MSIE ');

        // IE 11.
        const trident = ua.indexOf('Trident/');

        return (msie > 0 || trident > 0);
    }

    /**
     * _setDisplayMode
     * @return {string}
     * @private
     */
    _setDisplayMode() {
        let displayMode = 'mobile';
        if (window.innerWidth >= 846 && window.innerWidth <= 1023) {
            displayMode = 'tablet';
        } else if (window.innerWidth > 1023) {
            displayMode = 'desktop';
        }

        return displayMode;
    }
}

export default Embed;

const embed = new Embed({});
embed.start();
