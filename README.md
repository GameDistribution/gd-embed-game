[![npm](https://img.shields.io/npm/v/npm.svg)](https://nodejs.org/)
[![GitHub version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/GameDistribution/gd-embed-gameGD-HTML5/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/GameDistribution/gd-embed-game/blob/master/LICENSE)


# GameDistribution.com Embed Game
This is the documentation of the "GameDistribution.com Embed Game" project.

Gamedistribution.com is the biggest broker of high quality, cross-platform games. We connect the best game developers to the biggest publishers.

## Implementation within web pages
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
        src="https://html5.gamedistribution.com/embed/?url=https://html5.gamedistribution.com/a1c4858cc2db451bb97c8e926257b49a/&width=510&height=900&language=es"
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
As an example; `https://html5.gamedistribution.com/embed/?url=https://html5.gamedistribution.com/a1c4858cc2db451bb97c8e926257b49a/&width=510&height=900&language=es`.

| Event | Description |
| --- | --- |
| url | The game URL. |
| width | The preferred height of the game. The game will remain responsive, but we use this to calculate the aspect ratio. |
| height | the preferred width of the game. The game will remain responsive, but we use this to calculate the aspect ratio. |
| language | Language code for the IE disclaimer. Example values; 'en', 'nl', 'de' ... |