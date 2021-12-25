
/* global abuContent */

(function (abu) {

    'use strict';

    window.i18n = abu.i18n;

    window.popupPage = {
        sendMessage: abu.runtimeImpl.sendMessage,
        onMessage: abu.runtimeImpl.onMessage,
        closePopup: function () {
            window.close();
        }
    };

})(abuContent);