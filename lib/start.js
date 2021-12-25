
/**
 Starting Point.
 */
(function (abu) {

    'use strict';

	let started = false;
	browser.runtime.onInstalled.addListener(function (details) {
		if(typeof details != 'undefined' && details.reason == "install") {
			started = true;
			abu.initialize();
		}
	});

    abu.localStorage.init(function () {
		if(!started) abu.initialize();
    });

})(abu);