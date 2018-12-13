[![npm](https://img.shields.io/npm/v/npm.svg)](https://nodejs.org/)
[![GitHub version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/GameDistribution/gd-embed-gameGD-HTML5/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/GameDistribution/gd-embed-game/blob/master/LICENSE)


# GameDistribution.com Embed Game
This is the documentation of the "GameDistribution.com Embed Game" project.

GameDistribution.com is the biggest broker of high quality, cross-platform games. We connect the best game developers to the biggest publishers.

## Implementation within web pages
Copy/ paste the following snippet on the spot where you would like to display a game within your web page. Adjust the GET parameters of the `https://embed.gamedistribution.com/` iframe `src` URL to change the game itself. You can adjust various other parameter values to suit your or your clients' needs. All available parameters are described below.

The CSS snippet will help you set an aspect ratio, which remains responsive. The game will match this ratio, based on the given width and height of the game.

A demo page can be found here: <a href="https://embed.gamedistribution.com/demo.html" target="_blank">https://embed.gamedistribution.com/demo.html</a>. 
```
<style type="text/css">
    .gd__aspect-ratio-box {
        position: relative;
        overflow: hidden;
        height: 0;
        /*padding-top: 56.25%; !* 16:9 Aspect Ratio *!*/
        padding-top: 75%; /* 4:3 Aspect Ratio */
        /*padding-top: 66.66%; !* 3:2 Aspect Ratio *!*/
        /*padding-top: 62.5%; !* 8:5 Aspect Ratio *!*/
    }
    .gd__aspect-ratio-box iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 2px;
    }
</style>
<div class="gd__aspect-ratio-box">
    <iframe
        src="https://embed.gamedistribution.com/?url=https://html5.gamedistribution.com/a1c4858cc2db451bb97c8e926257b49a/&width=510&height=900&language=es&gdpr-tracking=1&gdpr-targeting=1"
        width="100%"
        height="100%"
        scrolling="none"
        frameborder="0"
        allowfullscreen>
    </iframe>
</div>
```

## Repository
The SDK is maintained on a public github repository.
<a href="https://github.com/gamedistribution/gd-embed-game" target="_blank">https://github.com/gamedistribution/gd-embed-game</a>

## Deployment
Deployment of the SDK to production environments is done through TeamCity.

## Installation for development
Install the following programs:
* [NodeJS LTS](https://nodejs.org/).
* [Grunt](http://gruntjs.com/).

Pull in the rest of the requirements using npm:
```
npm install
```

Setup a local node server, watch changes and update your browser view automatically:
```
grunt
```

Make a production build:
```
grunt build
```

## GET Parameters
The following GET parameters can be added. The first parameter should be prefixed with a `?` character and any additional ones with a `&` character.
As an example; `https://html5.gamedistribution.com/?url=https://html5.gamedistribution.com/a1c4858cc2db451bb97c8e926257b49a/&width=510&height=900&language=es&gdpr-tracking=1&gdpr-targeting=1`.

| Event | Description |
| --- | --- |
| url | The game URL. |
| width | The preferred height of the game. The game will remain responsive, but we use this to calculate the aspect ratio. |
| height | the preferred width of the game. The game will remain responsive, but we use this to calculate the aspect ratio. |
| language | Language code for the IE disclaimer. Example values; `en`, `nl`, `de` ... |
| gdpr-tracking | Set to `0` to disable tracking services or to `1` to keep them enabled. |
| gdpr-targeting | Set to `0` to disable advertisement targeting or to `1` to keep it enabled. Take note, setting this to a values of `0` can have great revenue impact. |
| gdpr-third-party | Set to `0` to disable third party services or to `1` to keep them enabled. |