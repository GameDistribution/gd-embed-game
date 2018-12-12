[![npm](https://img.shields.io/npm/v/npm.svg)](https://nodejs.org/)
[![GitHub version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/GameDistribution/gd-embed-gameGD-HTML5/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/GameDistribution/gd-embed-game/blob/master/LICENSE)


# GameDistribution.com Embed Game
This is the documentation of the "GameDistribution.com Embed Game" project.

Gamedistribution.com is the biggest broker of high quality, cross-platform games. We connect the best game developers to the biggest publishers.

## Implementation within web pages
...

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
The following GET parameters can be added.

| Event | Description |
| --- | --- |
| SDK_READY | When the SDK is ready. |
| SDK_ERROR | When the SDK has hit a critical error. |
| SDK_GAME_DATA_READY | When game data is returned. |
| SDK_GAME_START | When the game should start. |
| SDK_GAME_PAUSE | When the game should pause. |
| SDK_GDPR_TRACKING | When the publishers' client has requested to not track his/ her data. Hook into this event to find out if you can record client tracking data. |
| SDK_GDPR_TARGETING | When the publishers' client has requested to not get personalised advertisements. Hook into this event to find out if you can display personalised advertisements in case you use another ad solution. |
| SDK_GDPR_THIRD_PARTY | When the publishers' client has requested to not load third party services. Hook into this event to find out if you can third party services like Facebook, AddThis, and such alike. |
