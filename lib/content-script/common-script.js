
(function (abu, self) {

    'use strict';

    /**
     * https://bugs.chromium.org/p/project-zero/issues/detail?id=1225&desc=6
     * Page script can inject global variables into the DOM, so content script isolation doesn't work as expected
     * So we have to make additional check before accessing a global variable.
     */
    function isDefined(property) {
        return Object.prototype.hasOwnProperty.call(self, property);
    }

    var browserApi = isDefined('browser') ? self.browser : self.chrome;

    abu.i18n = browserApi.i18n;

    abu.runtimeImpl = (function () {

        var onMessage = (function () {
            if (browserApi.runtime && browserApi.runtime.onMessage) {
                // Chromium, Edge, Firefox WebExtensions
                return browserApi.runtime.onMessage;
            }
            // Old Chromium
            return browserApi.extension.onMessage || browserApi.extension.onRequest;
        })();

        var sendMessage = (function () {
            if (browserApi.runtime && browserApi.runtime.sendMessage) {
                // Chromium, Edge, Firefox WebExtensions
                return browserApi.runtime.sendMessage;
            }
            // Old Chromium
            return browserApi.extension.sendMessage || browserApi.extension.sendRequest;
        })();

        return {
            onMessage: onMessage,
            sendMessage: sendMessage
        };

    })();

})(typeof abuContent !== 'undefined' ? abuContent : abu, this); 
