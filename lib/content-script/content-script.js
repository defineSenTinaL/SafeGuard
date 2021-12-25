
/* global abuContent */

(function (abu) {

    'use strict';

    window.i18n = abu.i18n;

    window.contentPage = {
        sendMessage: abu.runtimeImpl.sendMessage,
        onMessage: abu.runtimeImpl.onMessage
    };

})(abuContent);
