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
            url: 'https://html5.gamedistribution.com/a1c4858cc2db451bb97c8e926257b49a/',
            width: 900,
            height: 510,
            gdprTracking: '1',
            gdprTargeting: '1',
            gdprThirdParty: '1',
            language: this._getFirstBrowserLanguage(),
        };

        if (options) {
            this.options = extendDefaults(defaults, options);
        } else {
            this.options = defaults;
        }

        this.referrer = getParentUrl();

        // console.log(this.options);
        // console.log(this.referrer);
    }

    /**
     * start
     * @public
     */
    start() {
        let url = updateQueryStringParameter(
            this.options.url,
            'gd_sdk_referrer_url',
            this.referrer,
        );
        url = updateQueryStringParameter(
            url,
            'gdpr-tracking',
            this.options.gdprTracking,
        );
        url = updateQueryStringParameter(
            url,
            'gdpr-targeting',
            this.options.gdprTargeting,
        );
        url = updateQueryStringParameter(
            url,
            'gdpr-third-party',
            this.options.gdprThirdParty,
        );

        if (this._isIE()) {
            this.startIEDisclaimer(() => {
                this._createFrame(
                    url,
                    parseInt(this.options.width),
                    parseInt(this.options.height),
                );
            });
        } else {
            this._createFrame(
                url,
                parseInt(this.options.width),
                parseInt(this.options.height),
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
        let message = '';
        let label = '';

        /* eslint-disable */
        switch (this.options.language) {
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

        // First create an element to detect the height and width our viewport.
        // This is mostly a fix for iOS, as using window.innerWidth won't work.
        const viewport = document.createElement('div');
        viewport.style.position = 'absolute';
        viewport.style.zIndex = '0';
        viewport.style.bottom = '0';
        viewport.style.right = '0';
        viewport.style.width = '1px';
        viewport.style.height = '1px';

        container.appendChild(viewport);

        const frame = document.createElement('iframe');
        frame.src = url;
        frame.setAttribute('frameBorder', '0');
        frame.setAttribute('allowfullscreen', 'none');
        frame.setAttribute('allowfullscreen', 'true');

        this._setFrameDimensions(viewport, frame, width, height);

        container.appendChild(frame);

        addEventListener('resize', () => {
            debounce(this._setFrameDimensions(viewport, frame, width, height), 100);
        }, false);

        // Doesn't work for iOS.
        if (screenfull.enabled) {
            const displayMode = this._getDisplayMode();
            const backdrop = document.createElement('div');
            backdrop.style.display = displayMode === 'mobile'
                ? 'block'
                : 'none';
            backdrop.style.position = 'absolute';
            backdrop.style.zIndex = '1';
            backdrop.style.top = '0';
            backdrop.style.width = '100%';
            backdrop.style.height = '100%';
            backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

            container.appendChild(backdrop);

            const button = document.createElement('button');
            /* eslint-disable */
            button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 9h-4v-5h-5v-4h9v9zm-9 15v-4h5v-5h4v9h-9zm-15-9h4v5h5v4h-9v-9zm9-15v4h-5v5h-4v-9h9z"/></svg>`;
            /* eslint-enable */
            button.style.display = displayMode === 'mobile' ? 'block' : 'none';
            button.style.position = 'absolute';
            button.style.zIndex = '2';
            button.style.top = '50%';
            button.style.left = '50%';
            button.style.transform = 'translate(-50%, -50%)';
            button.addEventListener('click', () => {
                screenfull.request(frame);
                setTimeout(() => {
                    this._setFrameDimensions(viewport, frame, width, height);
                }, 1000);
            });

            container.appendChild(button);

            addEventListener('resize', () => {
                const displayMode = this._getDisplayMode();
                if (displayMode === 'mobile') {
                    backdrop.style.display = 'block';
                    button.style.display = 'block';
                } else {
                    backdrop.style.display = 'none';
                    button.style.display = 'none';
                }
            }, false);
        }
    }

    /**
     * _setFrameDimensions
     * @param {Object} viewport
     * @param {Object} frame
     * @param {Number} width
     * @param {Number} height
     * @private
     */
    _setFrameDimensions(viewport, frame, width, height) {
        const view = viewport.getBoundingClientRect();
        const dimensions = this._calculateAspectRatioFit(
            width,
            height,
            view.left,
            view.top,
        );

        console.log(`viewport: ${view.left}x${view.top}`);
        console.log(dimensions);

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
     * _getDisplayMode
     * @return {string}
     * @private
     */
    _getDisplayMode() {
        let displayMode = 'mobile';
        if (window.innerWidth > 768) {
            displayMode = 'desktop';
        }

        return displayMode;
    }
}

export default Embed;

const params = getQueryParams();
const embed = new Embed({
    url: params['url'],
    gdprTracking: params['gdpr-tracking'],
    gdprTargeting: params['gdpr-targeting'],
    gdprThirdParty: params['gdpr-third-party'],
    width: params['width'],
    height: params['height'],
    language: params['language'],
});
embed.start();
