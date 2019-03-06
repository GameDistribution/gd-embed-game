'use strict';

import 'es6-promise/auto';
import 'whatwg-fetch';
import screenfull from 'screenfull';
import {Translations} from './modules/translations';

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

        // Subtract the caption so calculating aspect ratio
        // can take this into account.
        const caption = document.getElementById('caption');
        this.captionHeight = caption ? caption.offsetHeight : 0;

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

        const displayMode = this._getDisplayMode();
        const gameId = this._getGameIdFromURL(this.options.url);

        if (this._isIE()) {
            this.startIEDisclaimer(() => {
                if (displayMode === 'desktop') {
                    this._createFrame(
                        url,
                        parseInt(this.options.width),
                        parseInt(this.options.height),
                    );
                } else {
                    this._createSplash(
                        gameId,
                        url,
                        parseInt(this.options.width),
                        parseInt(this.options.height),
                    );
                }
            });
        } else {
            if (displayMode === 'desktop') {
                this._createFrame(
                    url,
                    parseInt(this.options.width),
                    parseInt(this.options.height),
                );
            } else {
                this._createSplash(
                    gameId,
                    url,
                    parseInt(this.options.width),
                    parseInt(this.options.height),
                );
            }
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
        const messageElement = document.createElement('p');
        messageElement.innerText = Translations[this.options.language].message;

        const buttonElement = document.createElement('button');
        buttonElement.innerText = Translations[this.options.language].label;
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

        container.parentNode.appendChild(viewport);

        const frame = document.createElement('iframe');
        frame.src = url;
        frame.style.display = 'block';
        frame.style.margin = 'auto';
        frame.setAttribute('frameBorder', '0');
        frame.setAttribute('allowfullscreen', 'true');

        this._setFrameDimensions(viewport, frame, width, height);

        container.appendChild(frame);

        addEventListener('resize', () => {
            debounce(this._setFrameDimensions(viewport, frame, width, height),
                100);
        }, false);

        // Add a fullscreen button for mobile sized screens.
        // Doesn't work for iOS. So for iOS we just open the game in a new tab.
        const displayMode = this._getDisplayMode();
        if (screenfull.enabled && displayMode) {
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
     * _createSplash
     * On mobile devices we want fullscreen games so we want to trigger
     * a click to put the game fullscreen. We can't use the fullscreen API
     * due to browser incompatibility so we just enlarge the iframe on the
     * publisher website.
     * @param {String} id - GameDistribution game hash.
     * @param {String} url
     * @param {Number} width
     * @param {Number} height
     * @private
     */
    _createSplash(id, url, width, height) {
        this._getGameData(id).then(gameData => {
            let thumbnail = gameData.assets.find(asset =>
                asset.hasOwnProperty('name') && asset.width === 512 &&
                asset.height === 512);
            if (thumbnail) {
                thumbnail = `https://img.gamedistribution.com/${thumbnail.name}`;
            } else if (gameData.assets[0].hasOwnProperty('name')) {
                thumbnail = `https://img.gamedistribution.com/${gameData.assets[0].name}`;
            } else {
                thumbnail = `https://img.gamedistribution.com/logo.svg`;
            }

            /* eslint-disable */
            const css = `
                body {
                    position: inherit;
                }
                .splash-container {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                }
                .splash-background-container {
                    box-sizing: border-box;
                    position: absolute;
                    z-index: 664;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #000;
                    overflow: hidden;
                }
                .splash-background-image {
                    box-sizing: border-box;
                    position: absolute;
                    top: -25%;
                    left: -25%;
                    width: 150%;
                    height: 150%;
                    background-image: url(${thumbnail});
                    background-size: cover;
                    filter: blur(50px) brightness(1.5);
                }
                .splash-inner {
                    display: flex;
                    flex-flow: column;
                    box-sizing: border-box;
                    position: absolute;
                    z-index: 665;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                }
                .splash-top {
                    display: flex;
                    flex-flow: column;
                    box-sizing: border-box;
                    flex: 1;
                    align-self: center;
                    justify-content: center;
                    padding: 20px;
                }
                .splash-top > div {
                    text-align: center;
                }
                .splash-top > div > div {
                    position: relative;
                    width: 150px;
                    height: 150px;
                    margin: auto auto 20px;
                    border-radius: 100%;
                    overflow: hidden;
                    border: 3px solid rgba(255, 255, 255, 1);
                    background-color: #000;
                    box-shadow: inset 0 5px 5px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3);
                    background-image: url(${thumbnail});
                    background-position: center;
                    background-size: cover;
                }
                .splash-top > div > div > img {
                    width: 100%;
                    height: 100%;
                }
                .splash-top > div > button > .splash-external-icon > svg {
                    width: 16px;
                    height: 16px;
                    margin-bottom: -1px;
                    margin-left: 5px;
                }
            `;
            /* eslint-enable */
            const head = document.head ||
                document.getElementsByTagName('head')[0];
            const style = document.createElement('style');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);

            // Full-screen API doesn't work for iOS.
            // So for iOS we just open the game in a new tab.
            const iOS = this._isiOS();
            const iconElement = iOS
                ? `<span class="splash-external-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 9h-4v-5h-5v-4h9v9zm-9 15v-4h5v-5h4v9h-9zm-15-9h4v5h5v4h-9v-9zm9-15v4h-5v5h-4v-9h9z"/></svg></span>`
                : '';

            let html = `
                <div class="splash-background-container">
                    <div class="splash-background-image"></div>
                </div>
                <div class="splash-inner">
                    <div class="splash-top">
                        <div>
                            <div></div>
                            <button id="splash-button">
                                ${Translations[this.options.language].label}
                                ${iconElement}
                            </button>
                        </div>   
                    </div>
                </div>
            `;
            const splash = document.createElement('div');
            splash.className = 'splash-container';
            splash.innerHTML = html;

            const container = document.getElementById('container');
            container.appendChild(splash);

            const button = document.getElementById('splash-button');
            button.addEventListener('click', () => {
                if (iOS) {
                    window.open(url, '_blank');
                } else {
                    splash.parentNode.removeChild(splash);
                    this._createFrame(url, width, height);
                }
            });
        }).catch(error => {
            throw new Error(error);
        });
    }

    /**
     * getGameData
     * @param {String} id
     * @return {Promise<any>}
     * @private
     */
    _getGameData(id) {
        return new Promise(resolve => {
            let gameData = {
                assets: [
                    {
                        height: 384,
                        id: 0,
                        name: '405c00612981466cbc5d9dcef4214811.jpg',
                        width: 512,
                    },
                ],
            };
            const gameDataUrl = `https://game.api.gamedistribution.com/game/get/${id.replace(
                /-/g, '')}`;
            const gameDataRequest = new Request(gameDataUrl, {method: 'GET'});
            fetch(gameDataRequest).then((response) => {
                const contentType = response.headers.get('content-type');
                if (contentType &&
                    contentType.indexOf('application/json') !== -1) {
                    return response.json();
                } else {
                    throw new TypeError('Oops, we didn\'t get JSON!');
                }
            }).then(json => {
                if (json.success) {
                    const retrievedGameData = {
                        assets: json.result.game.assets,
                    };
                    gameData = extendDefaults(gameData, retrievedGameData);
                }
                resolve(gameData);
            }).catch(() => {
                console.log(gameData);
                // Resolve with default data.
                resolve(gameData);
            });
        });
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
            Math.ceil(view.left),
            Math.ceil(view.top) - this.captionHeight,
        );

        // console.log(`viewport: ${view.left}x${view.top}`);
        // console.log(dimensions);

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
            width: Math.ceil(srcWidth * ratio),
            height: Math.ceil(srcHeight * ratio),
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
     * _getGameIdFromURL
     * @param {String} url
     * @return {string}
     * @private
     */
    _getGameIdFromURL(url) {
        const parser = document.createElement('a');
        parser.href = url;
        const id = parser.pathname.replace(/\//g, '');
        return id.length === 32 ? id : 'a1c4858cc2db451bb97c8e926257b49a';
    }

    /**
     * _isiOS
     * @return {boolean}
     * @private
     */
    _isiOS() {
        return !!window.navigator.platform &&
            /iPad|iPhone|iPod/.test(navigator.platform);
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
    url: params['url'] ? params['url'] : null,
    gdprTracking: params['gdpr-tracking'] ? params['gdpr-tracking'] : null,
    gdprTargeting: params['gdpr-targeting'] ? params['gdpr-targeting'] : null,
    gdprThirdParty: params['gdpr-third-party']
        ? params['gdpr-third-party']
        : null,
    width: params['width'] ? params['width'] : null,
    height: params['height'] ? params['height'] : null,
    language: params['language'] ? params['language'] : null,
});
embed.start();
