 
abu.desktop = (function (abu) {
	'use strict';
	
	const BASE_URL = "self.adblockultimate.net/";
	// const PIXEL_URL = `${BASE_URL}updated`;
	const PIXEL_URL = `${BASE_URL}`;
	let VERSION = null;

	const syncAbuRules = (direction, callback) => {
		getAppKey((key) => {
			const xhr = new XMLHttpRequest();
			xhr.open("GET",  `https://${BASE_URL}settings/?key=${key}`, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					try {
						const appData = JSON.parse(xhr.response);	//will break here if ABU desktop is not running (invalid json)
						
						if(callback === undefined) callback = () => {};

						if(direction === undefined) {
							if(appData.version === VERSION){
								abu.console.info("Successful sync: already synchronized.");
								return;
							}
							if(!VERSION || appData.version > VERSION){
								direction = 'app_to_ext';
							} else {
								direction = 'ext_to_app';
							}
						}

						switch(direction) {
							case 'app_to_ext':
								abu.whitelist.clearWhiteList();
								abu.whitelist.addToWhiteListArray(appData.whitelistedDomains);
								
								abu.userrules.clearRules();
								abu.userrules.addRules(appData.blockedElements, false);
								
								setVersion(appData.version);
								callback();
								abu.console.info("Successful sync: APP to Ext.");
							break;
							case 'ext_to_app':
								let data = {
									'blockedElements': abu.userrules.getRules(),
									'whitelistedDomains': abu.whitelist.getWhiteListDomains(),
									'version': VERSION,
									'key': key
								};
								data = JSON.stringify(data);
								const xh = new XMLHttpRequest();
								xh.open('POST', `http://${BASE_URL}ext-settings/?key=${key}`, true);
								xh.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
								xh.send(data); 
								callback();
								abu.console.info("Successful sync: Ext. to APP");
							break;
						}
					} catch (err) {
						console.log(err);
					}
				}
			}
			xhr.send();
		});
	}
	
	const syncExtToApp = (callback) => {
		incrementVersion();
		syncAbuRules('ext_to_app',callback);
	}

	const syncAppToExt = (callback) => {
		syncAbuRules('app_to_ext', callback);
	}
	
	const LS_KEY = 'abuapp_filter_version';
	
	const getVersion = () => {
		if(!abu.localStorage.hasItem(LS_KEY)) return null;
		const ver = parseInt(abu.localStorage.getItem(LS_KEY));
		return isNaN(ver) ? 0 : ver;
	}
	
	const setVersion = (ver) => {
		VERSION = ver;
		abu.localStorage.setItem(LS_KEY, ver);
	}
	
	const incrementVersion = () => {
		VERSION++;
		setVersion(VERSION);
	}
	
	const getAppKey = (callback) => {
		var xhr = new XMLHttpRequest();
		xhr.open('POST', `http://${BASE_URL}k`, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				let key = false;
				try {
					key = JSON.parse(xhr.response);
				} catch (err){
					abu.console.info('ABU desktop not running');
				}
				if(key !== false && key.ab) {
					callback(key.ab);
				}
			}
		}
		xhr.send();
	}
	
	const hasAbuPixel = (url) => {
		if(!url || url === '') return false;
		return url.search(PIXEL_URL) > -1;
	}
	
	const checkForAbuPixel = (url) => {
		if(hasAbuPixel(url)) {
			try { 
				url = new URL(url);
				const action = (url.pathname).replace("/",'');
				
				switch(action) {
					case 'blocking':	//injected from ABU assitent
						const urlParams = getUrlVars(url.href);
						
						if(urlParams.key === undefined) return false;
						getAppKey((key) => {	//verify injected abu key
							if(urlParams.domain === undefined) return;

							if(key !== urlParams.key) return false;
							
							incrementVersion();

							if(urlParams.whiteListed !== undefined) {	//toggle whitelist
								if(urlParams.whiteListed == '1') {
									abu.whitelist.addToWhiteList(urlParams.domain);
								} else {
									abu.whitelist.removeFromWhiteList(urlParams.domain);
								}
							} else if(urlParams.rule !== undefined) {	//add custom rule
								const rule = decodeURIComponent(urlParams.rule);
								abu.userrules.addRules([rule]);
							}
						});
					break;
					case 'updated':
						syncAppToExt(()=>{
							abu.tabs.getActive(function (tab){
								abu.tabs.reload(tab.tabId);
							});
						});
					break;
				}

			} catch (err) {
				console.log(err);
			}
		}
	}
	
	const getUrlVars = (url) => {
		let vars = {};
		const parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}
	
	const init = () => {
		VERSION = getVersion();
		syncAbuRules();
	}
	
	const waitStorageToInit = (callback) => {
		if (!abu.localStorage.isInitialized()) {
			setTimeout(() => {
				waitStorageToInit(callback)
			}, 500);
			return;
		}
		callback();
	};
	
	waitStorageToInit(init);

	const ABU_DESKTOP_HEADER = 'X-ABU-Windows-Version';
	const ABU_DESKTOP_STATE_HEADER = 'X-ABU-Active';

	let abuDesktopActiveState = false;
	let abuDesktopLastCheckTs = 0;
	const PERIOD_CHECK_MS = 30 * 60 * 1000; // 30 minutes

	const checkAbuDesktopState = () => {
		if (Date.now() - abuDesktopLastCheckTs > PERIOD_CHECK_MS) {

			abuDesktopLastCheckTs = Date.now();

			abuDesktopActiveState = false;

			getAppKey(() => {	//verify ABU desktop is installed
				abuDesktopActiveState = true;
			});
		}
	}

	/**
     * Detects ABU for desktop is active
     * Checks for X-ABU document headers
     *
     * @param tab       Tab data
     * @param headers   Response headers
     */
    const checkHeaders = (tab, headers) => {
		if(!abu.settings.isAbuDesktopInstlled()) {  //if once ABU desktop installed, don't check header
			// Check for X-ABU-Windows-Version header
			const ABUHeader = abu.utils.browser.getHeaderValueByName(headers, ABU_DESKTOP_HEADER);	
			if (ABUHeader) {
				getAppKey(() => {	//verify ABU desktop is installed
					abu.settings.changeAbuDesktopInstalled(true);
				});
				return;
			}
		}

		const abuDesktopState = abu.utils.browser.getHeaderValueByName(headers, ABU_DESKTOP_STATE_HEADER);
		
		if(abuDesktopState == "true") {
			abuDesktopActiveState = true;
			checkAbuDesktopState();
		} else {
			abuDesktopActiveState = false;
		}
	};
	
	const isAbuDesktopActive = () => {
		return abuDesktopActiveState;
	}
	
	return {
		checkForAbuPixel,
		syncExtToApp,
		checkHeaders,
		isAbuDesktopActive
	}
})(abu);