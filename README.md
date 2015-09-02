Scorecard for Agricola ACBAS
============================
A scorecard for the board game Agricola: All Creatures Big and Small.  It's a very simple, basic replacement for the scorecard that comes with the game.

This is the source code used in an [Android app](https://play.google.com/store/apps/details?id=com.twotwotwotwo.agricola2p).

Try it now: [web version](http://22222.github.io/AgricolaAcbasAssistant/www/index.html)


Source Overview
---------------
There are three main directories in this project:

* src: all of the actual source code that is unique to this app
* cordova: the config file and resources for the Cordova build
* www: the output of the build process, to be used directly as a web page or as resources in the Cordova build

This project uses several other open source libraries, including:
* [Bootstrap](http://getbootstrap.com/)
* [Font Awesome](https://fortawesome.github.io/Font-Awesome/)
* [Knockout](http://knockoutjs.com/)

Build
-----
This project uses [Bower](http://bower.io) for its web-based dependencies and [Gulp](http://gulpjs.com/) to package everything up.  And then [Cordova](https://cordova.apache.org/) is used to create the Android app (and could be used for an iOS or Windows App too).

So the basic build steps are:

* Use [npm](https://www.npmjs.com) to update the gulp dependencies: `npm update`
* Update the bower dependencies: `bower update`
* Build everything with gulp: `gulp`

And then for the Android app, something like this:

* `gulp package-cordova`
* `cd cordova`
* `cordova platform add android`
* `cordova build android --release`

I'm sure all of those steps will change over time and this will be obsolete, but oh well.  That's how life goes.


