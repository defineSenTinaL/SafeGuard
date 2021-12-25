
/**
 * Extension initialize logic. Called from start.js
 */
abu.initialize = function (initCallback) {
	initCallback = initCallback || function() {}

    function onLocalStorageLoaded() {
        abu.console.info('Starting ABU... Version: {0}. Id: {1}', abu.app.getVersion(), abu.app.getId());

        // Initialize popup button
        abu.browserAction.setPopup({
            popup: abu.getURL('pages/popup.html')
        });

        abu.whitelist.init();
        abu.ui.init();

        /**
         * Start application
         */
        abu.filters.start({
            onInstall: function (callback) {
                // Process installation
                // Retrieve filters and install them
                abu.filters.offerFilters(function (filterIds) {
                    abu.filters.addAndEnableFilters(filterIds, callback);
                });
            },
            onUpdate: function (runInfo, callback) {
                if (abu.utils.browser.isGreaterVersion("3.000", runInfo.prevVersion) ) {
                    abu.filters.offerFilters(function (filterIds) {
                        abu.filters.addAndEnableFilters(filterIds, callback);
                    });
                }
            }
        }, function () {
			
			initCallback();
        });
    }

    abu.localStorage.init(onLocalStorageLoaded);
};