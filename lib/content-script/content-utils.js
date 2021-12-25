
/* global contentPage, HTMLDocument */

(function () {

    if (window !== window.top) {
        return;
    }

    if (!(document instanceof HTMLDocument)) {
        return;
    }

    /**
     * On extension startup contentPage is undefined
     */
    if (typeof contentPage === 'undefined') {
        return;
    }

	const getAlertHtml = (title, txt) => {
		return `<div class="abu-global-alert">
					<div class="abu-global-alert-col1">
						<div class="abu-global-alert-col1__title">
							<div class="abu-global-alert__correct"></div>
							${title}
						</div>
						<div class="abu-global-alert-col1__content">
							${txt}
						</div>
					</div>
					<div class="abu-global-alert-col2">
					</div>
				</div>`;
	}

    /**
     * Shows alert popup.
     * Popup content is added right to the page content.
     *
     * @param message Message text
     */
    const showAlertPopup = (message) => {
		
		const { text, title } = message;
		
		if (!title && !text) {
            return;
        }

        const messages = Array.isArray(text) ? text : [text];
		let fullTxt = '';
        for (let i = 0; i < messages.length; i++) {
            if (i > 0) {
                fullTxt += '<br>';
            }
            fullTxt += messages[i];
        }

        const alertPopup = document.createElement('div');
        alertPopup.innerHTML = getAlertHtml(title,fullTxt);

        const triesCount = 10;

        function appendPopup(count) {
            if (count >= triesCount) {
                return;
            }
            if (document.body) {
                document.body.appendChild(alertPopup);
                setTimeout(function () {
                    if (alertPopup && alertPopup.parentNode) {
                        alertPopup.parentNode.removeChild(alertPopup);
                    }
                }, 4000);
            } else {
                setTimeout(function () {
                    appendPopup(count + 1);
                }, 500);
            }
        }

        appendPopup(0);
    }

    /**
     * Reload page without cache
     */
    function noCacheReload() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', document.location.href);
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.setRequestHeader('Expires', '-1');
        xhr.setRequestHeader('Expires', 'no-cache');
        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = function () {
            document.location.reload(true);
        };
        xhr.send(null);
    }

    contentPage.onMessage.addListener(function (message) {
        if (message.type === 'show-alert-popup') {
            showAlertPopup(message);
        } else if (message.type === 'no-cache-reload') {
            noCacheReload();
        } else if (message.type === 'update-tab-url') {
            window.location = message.url;
        }
    });

})();
