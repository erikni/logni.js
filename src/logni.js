
/*
 * GNU General Public License v3.0
 *
 * Permissions of this strong copyleft license are conditioned on making 
 * available complete source code of licensed works and modifications, 
 * which include larger works using a licensed work, under the same license. 
 * Copyright and license notices must be preserved. Contributors provide 
 * an express grant of patent rights.
 *
 * see all: https://github.com/erikni/logni.js/blob/master/LICENSE
 */

/**
 * @fileoverview logni is javascript library for event logging 
 * and application states
 * 
 * <h3>Example:</h3>
 * <pre>
 * // initialization
 * logni.debugMode = true;
 * logni.mask("ALL");
 * logni.stderr(1);
 * logni.color(true);
 * logni.file("https://yourweb/log");

 * logni.env("local");
 * logni.release("0.0.1");
 * logni.name("testlog");
 *
 * // log message
 * logni.debug("log debug test");
 * logni.info("log info test" ,4);
 * logni.warn("log warning test" ,3);
 * logni.error("log error test");
 * </pre>
 *
 * @version 0.2.3
 * @author Erik Brozek - https://github.com/erikni
 * @since 2017
 * @static
 * Website: https://logni.net
 */


// version
const version = '0.2.3-3';


// nodejs compatible mode
const Console = console;

// nodejs 6 compatible for console.debug 
try {
	Console.debug(`[logni.js] version=${version}`);
}
catch(err) {
	Console.debug = function(msg) {
		Console.log(`DEBUG: ${msg}`);
	};
}


// nodejs cookies compatible
let cookies = `logni=${version}`;
try {
	cookies = document.cookie;
}
catch(err) {
	console.log(`[logni.js] cookie err="${err}"`);
}


// logni
const logni = new function() {
	// debugMode is disabled
	this.debugMode 	= false;

	// error stack default string
	this.__LOGniRelStr = "rel=0.0.0";
	this.__LOGniEnvStr = "env=local";
	this.__LOGniNameStr = "name=unknown";
	this.__LOGniFile = "";

	// colors: https://getbootstrap.com/docs/4.1/components/alerts/
	this.__LOGniColors = {
		primary:  "#004085", // blue light
		secondary:"#383d41", // seda
		success:  "#155724", // green light
		danger:   "#721c24", // ping light
		warning:  "#856404", // yellow light
		info:     "#0c5460", // blue-green light
		light:    "#818182", // svetle seda
		dark:     "#1b1e21", // tmave seda
	};

	// severity
	this.__LOGniMaskSeverity = {};
	this.__LOGniSeverityColors = {
		DEBUG: "light",
		INFO: "primary",
		WARN: "warning",
		ERROR: "danger" ,
		CRITICAL: "danger",
	};

	// init
	this.__init__  = function() {
		Console.debug(`[logni.js] debugMode=${this.debugMode}`);

		// severity (fullname)
		this.__logMaskSeverityFull 	= ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];
		this.__debug(`this.__logMaskSeverityFull=${this.__logMaskSeverityFull}`);

		// severity (sortname)
		this.__logMaskSeverityShort = [];
		let i=0;
		for (i = 0; i < this.__logMaskSeverityFull.length; i++) {
			let _s = this.__logMaskSeverityFull[i].substring(0,1);
			this.__logMaskSeverityShort[i] = _s;
			this.__debug('severity fullName='
				+ `${this.__logMaskSeverityFull[i]} -> shortName=${_s}`
			);

			this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = 5; 

		}
		this.__debug(`this.__logMaskSeverityShort=${this.__logMaskSeverityShort}`);
		this.__debug(`this.__LOGniMaskSeverity=${this.__LOGniMaskSeverity}`);
		this.__debug(this.__LOGniMaskSeverity, false);

		// default		
		this.mask("ALL");
		this.stderr(1);
		this.color(true);

		return 1;
	};


  	/**
  	 * Test cookie if exist
  	 * 
  	 * @param {string} cookieName,
  	 * @param {string} attrName,
  	 * @param {string} attrValue,
  	 * 
	 * @return {string} attrValue
  	 * @static
  	 */
	this.__cookieEnv = function(cookieName, attrName, attrValue) {
		let cookieValue = this.cookieGet(cookieName);
		if (cookieValue) {
			this.__debug(`set ${attrName}=${cookieValue}`);
			attrValue = cookieValue;
		}
		return attrValue;
	};


  	/**
  	 * Set mask
  	 * 
  	 * @param {string} LOGniMask,
  	 * 
	 * @return {number} return
  	 * @static
  	 */
	this.mask = function(LOGniMask) {
		if (LOGniMask === undefined) LOGniMask="ALL";

		// cookie mask
		LOGniMask = this.__cookieEnv('LOGNI_MASK', 'LOGniMask', LOGniMask);

		// debug mask
		this.__debug(`init logni.mask(${LOGniMask})`);
		this.LOGniMask = LOGniMask;

		// log mask = ALL | OFF
		const retMask = this.__setMask(this.LOGniMask);
		if (retMask == 0) return 0;

		// len is wrong
		const l = this.LOGniMask.length;
		if (l < 2 || l > 10) return 1;

		// set default LEVEL=0
		this.__setMask('OFF');

		// set severity
		let i=0;
		for (i = 0; i < l; i += 2) {
			let _l = this.LOGniMask.substring(i,i+1);
			let _no = parseInt(this.LOGniMask.substring(i+1,i+2), 10);
			this.__debug(`mask=${this.LOGniMask} ${i}:${i+1} severity=${_l} priority=${_no}`);

			if(typeof this.__LOGniMaskSeverity[_l] === "undefined") {
				this.__debug(`this.__LOGniMaskSeverity[${l}] is undefined`);
				return 0;
			} 
			this.__LOGniMaskSeverity[_l] = _no;
		}
		this.__debug(`set this.__LOGniMaskSeverity=${this.__LOGniMaskSeverity}`);
		this.__debug(this.__LOGniMaskSeverity, false);

		this.info(`[logni.js] init mask=${LOGniMask}`, 1);
		return 0;
	};


  	/**
  	 * Set mask for ALL | OFF
  	 * 
  	 * @param {string} LOGniMask,
  	 * 
	 * @return {number} return
  	 * @private
  	 */
	this.__setMask = function(LOGniMask) {
		let level;

		if (LOGniMask === "ALL") level=1;
		else if (LOGniMask === "OFF") level=5;
		else return 1;

		let i=0;
		for (i = 0; i < this.__logMaskSeverityShort.length; i++) {
			this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = level;
		}

		this.info(`[logni.js] init mask=${LOGniMask}`, 1);
		return 0;
	};


  	/**
  	 * Set stderr
  	 * 
  	 * @param {number} LOGniStderr,
  	 * @static
  	 */
	this.stderr = function(LOGniStderr) {
		if (LOGniStderr === undefined) LOGniStderr=0;

		// cookie stderr
		LOGniStderr = this.__cookieEnv('LOGNI_STDERR', 'LOGniStderr', LOGniStderr);

		// debug stderr
		this.__debug(`init logni.stderr(${LOGniStderr})`);

		this.LOGniStderr = LOGniStderr;
	};
	this.console = this.stderr;


  	/**
  	 * Set file/url
  	 * 
  	 * @param {string} LOGniFile,
  	 * @static
  	 */
	this.file = function(LOGniFile) {
		if (LOGniFile === undefined) LOGniFile="";

		// debug file/url
		this.__debug(`init logni.file(${LOGniFile})`);

		this.__LOGniFile = LOGniFile;
	};


  	/**
	 * Set enviroment (dev|develop / stage / test / live|prod / ...)
  	 * 
  	 * @param {string} LOGniEnv,
  	 * @static
  	 */
	this.enviroment = function(LOGniEnv) {
		if (LOGniEnv === undefined) LOGniEnv="live";

		// debug enviroment
		this.__debug(`init logni.enviroment(${LOGniEnv})`);

		this.__LOGniEnvStr = "env="+LOGniEnv;
		this.info(`[logni.js] init enviroment=${LOGniEnv}`, 1);
	};
	this.env = this.enviroment;


  	/**
  	 * Set application name
  	 * 
  	 * @param {string} LOGniName,
  	 * @static
  	 */
	this.name = function(LOGniName) {
		if (LOGniName === undefined) LOGniName="unknown";

		// debug name
		this.__debug(`init logni.name(${LOGniName})`);

		this.LOGniName = LOGniName;
		this.__LOGniNameStr = "name="+LOGniName;
		this.info(`[logni.js] init name=${LOGniName}`, 1);
	};


  	/**
  	 * Set release version
  	 * 
  	 * @param {string} LOGniRelease,
  	 * @static
  	 */
	this.release = function(LOGniRelease) {
		if (LOGniRelease === undefined) LOGniRelease="0.0.0";

		// debug release
		this.__debug(`init logni.release(${LOGniRelease})`);

		this.LOGniRelease = LOGniRelease;
		this.__LOGniRelStr = "rel="+LOGniRelease;
		this.info(`[logni.js] init release=${LOGniRelease}`, 1);
	};


  	/**
  	 * Set color for message logs
  	 * 
  	 * @param {bool} LOGniColor,
  	 * @static
  	 */
	this.color = function(LOGniColor) {
		if (LOGniColor === undefined) LOGniColor=true;

		// cookie color
		LOGniColor = this.__cookieEnv('LOGNI_COLOR', 'LOGniColor', LOGniColor);

		this.LOGniColor = LOGniColor;
		this.__debug(`init color=${LOGniColor}`);
	};


  	/**
  	 * Use log?
  	 * 
  	 * @param {string} LOGniMsgSeverity0,
  	 * @param {number} LOGniMsgNo, 
	 * @return {number} return
  	 * @private
  	 */
	this.__logUse = function(LOGniMsgSeverity0, LOGniMsgNo) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		// mask=ALL
		if (this.LOGniMask === "ALL") {
			this.__debug(`severity=${LOGniMsgSeverity0} msgNo=${LOGniMsgNo} `
				+ `>= mask=ALL -> msg log is VISIBLE`);
			return true;
		}

		if (typeof this.__LOGniMaskSeverity[LOGniMsgSeverity0] === "undefined") {
			this.__debug(`${this.__LOGniMaskSeverity.LOGniMsgSeverity0} `
				+ 'is undefined');
			return false;
		}

		// message hidden
		const _no = this.__LOGniMaskSeverity[LOGniMsgSeverity0];
		if (LOGniMsgNo < _no) {
			this.__debug(`severity=${LOGniMsgSeverity0} `
				+ `msgNo=${LOGniMsgNo} <  maskNo=${_no} -> msg log is HIDDEN`);
			return false;
		}

		// message visible
		this.__debug(`severity=${LOGniMsgSeverity0} `
			+ `msgNo=${LOGniMsgNo} >= maskNo=${_no} -> msg log is VISIBLE`);
		return true;
	};


  	/**
  	 * Error stack
  	 *
  	 * @param {string} LOGniError,
  	 * @param {number} LOGniErrorStackNo,
  	 *
	 * @return {string} LOGniErrorStacksLast
  	 * @private
  	 */
	this.__errorStack = function(LOGniError, LOGniErrorStackNo) {
		const LOGniErrorStacks = LOGniError.stack.toString().split('\n');
		const LOGniErrorStackLen = LOGniErrorStacks.length;

		const LOGniErrorStacksLasts = LOGniErrorStacks[LOGniErrorStackLen-LOGniErrorStackNo].split('/');
		const LOGniErrorStacksLastLen = LOGniErrorStacksLasts.length;

		// debug mode
		this.__debug(LOGniErrorStacksLasts, false);
		this.__debug(`errorStack len=${LOGniErrorStacksLastLen}`);

		let LOGniErrorStacksLast;
		if (LOGniErrorStacksLasts[0].indexOf('(') === -1) {
			LOGniErrorStacksLast = LOGniErrorStacksLasts[LOGniErrorStacksLastLen-1].split(')')[0].trim();
		} else {
			LOGniErrorStacksLast = LOGniErrorStacksLasts[0].split('(')[0].trim()+' '+
				LOGniErrorStacksLasts[LOGniErrorStacksLastLen-1].split(')')[0].trim();
		}

		return LOGniErrorStacksLast;
	};


  	/**
  	 * Http(s) request with credentials
  	 * 
  	 * @param {string} LOGniUrl,
  	 * @return {number} ,
  	 * @static
  	 */
	this.__request = function(LOGniUrl) {
		let __req = new XMLHttpRequest();
		__req.open("GET", LOGniUrl, true);
		__req.setRequestHeader("Content-type","application/json; charset=utf-8");
		__req.withCredentials = true;
		__req.send(null);

		// debug url	
		this.__debug(`url=${LOGniUrl}`);

		return 0;
	};


  	/**
  	 * Log message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {string} LOGniMsgSeverity,
  	 * @param {number} LOGniMsgNo,
  	 * @param {array} LOGniMsgData,
	 * @return {string} LOGniMsgText
  	 * @private
  	 */
	this.__msg = function(LOGniMsgMessage, LOGniMsgSeverity, LOGniMsgNo, LOGniMsgData) {
		if (LOGniMsgMessage === undefined) LOGniMsgMessage="";
		if (LOGniMsgSeverity === undefined) LOGniMsgSeverity="DEBUG";
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		// priority
		if (LOGniMsgNo < 1) LOGniMsgNo = 1;
		else if (LOGniMsgNo > 4) LOGniMsgNo = 4;

		const __logniTS   = Math.round(new Date().getTime()/1000);
		const __l0 = LOGniMsgSeverity.substring(0, 1);
		const __logniPrefix = __l0 + LOGniMsgNo;

		// log use (true|false)?
		if (this.__logUse(__l0, LOGniMsgNo) === false) return '';

		// stderr(1)
		let LOGniMsgText = '';
		if (this.LOGniStderr) {
			LOGniMsgText = this.__msgStderr(LOGniMsgMessage, __logniPrefix);
			if (typeof LOGniMsgData !== "undefined") Console.table(LOGniMsgData);
		}

		// log to server
		if (this.__LOGniFile !== "") {
			const __url=`${this.__LOGniFile}/log/${__logniPrefix}.json?n=${this.LOGniName}&`
				+ `t=${__logniTS}&m=${encodeURIComponent(LOGniMsgMessage)}`;
			this.__request(__url);
		}

		return LOGniMsgText;
	};


  	/**
  	 * Log message for stderr
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {string} LOGniPrefix,
	 * @return {string} LOGniMsgText
  	 * @private
  	 */
	this.__msgStderr = function(LOGniMsgMessage, LOGniPrefix) {
		const __logniTime = new Date().toISOString();
		let LOGniMsgExtVisible = true;
		let LOGniMsgText = '';

		// if environment dont set -> no visible
		if (this.__LOGniRelStr === "rel=0.0.0" && this.__LOGniNameStr === "name=unknown" &&
			this.__LOGniEnvStr === "env=local") LOGniMsgExtVisible = false;

		// error stack
		// const LOGniError = new Error();
		// const LOGniErrorStackLast2 = this.__errorStack(LOGniError, 2);
		// const LOGniErrorStackLast1 = this.__errorStack(LOGniError, 1);
		// const LOGniErrorStackExt = 'stack='+LOGniErrorStackLast2+', '+LOGniErrorStackLast1;
		const LOGniErrorStackExt = '';

		// log messsage with env params
		if (LOGniMsgExtVisible) {
			LOGniMsgText = `${__logniTime} ${LOGniPrefix}: ${LOGniMsgMessage} `
				+ `{${LOGniErrorStackExt}, ${this.__LOGniNameStr}, `
				+ `${this.__LOGniRelStr}, ${this.__LOGniEnvStr}}`;
		// log message without env params
		} else {
			LOGniMsgText = `${__logniTime} ${LOGniPrefix}: ${LOGniMsgMessage} `
				+ `{${LOGniErrorStackExt}}`;
		}

		return LOGniMsgText;
	};


  	/**
  	 * Debug-level messages
  	 * 
	 * Outputs a message to the console with the log level "debug".
         *
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.debug = function(LOGniMsgMessage, LOGniMsgNo, LOGniMsgData) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		const msg = this.__msg(LOGniMsgMessage, "DEBUG", LOGniMsgNo, LOGniMsgData);
		if (msg === "") return 0;

		let style = `background:white; color:black; font-size:10px;`;
		if (this.LOGniColor) style = `color: ${this.__LOGniColors[this.__LOGniSeverityColors.DEBUG]}`;

		Console.debug(`%c${msg}`, style);
		return 1;
	};
	this.dbg = this.debug;	


  	/**
  	 * Critical error message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.critical = function(LOGniMsgMessage, LOGniMsgNo, LOGniMsgData) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		const msg = this.__msg(LOGniMsgMessage, "CRITICAL", LOGniMsgNo, LOGniMsgData);
		if (msg === "") return 0;

		let style = `background:white; color:black; font-weight:bold; font-size:14px;`;
		if (this.LOGniColor) {
			style = `color:${this.__LOGniColors[this.__LOGniSeverityColors.CRITICAL]}`;
			Console.error(`%c${msg}`, style);
		} else {
			Console.log(`%c${msg}`, style);
		}
		return 1;
	};
	this.fatal = this.critical;


  	/**
  	 * Informational messages
         *
         * Informative logging of information. You may use string substitution 
         * and additional arguments with this method.
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.info = function(LOGniMsgMessage, LOGniMsgNo, LOGniMsgData) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		const msg = this.__msg(LOGniMsgMessage, "INFO", LOGniMsgNo, LOGniMsgData);
		if (msg === "") return 0;

		let style = `background:white; color:black;`;
		if (this.LOGniColor) style = `color:${this.__LOGniColors[this.__LOGniSeverityColors.INFO]}`;

		Console.info(`%c${msg}`, style);
		return 1;
	};
	this.informational = this.info;


  	/**
  	 * Warning message: warning conditions
  	 * 
  	 * Outputs a warning message. You may use string substitution 
         * and additional arguments with this method.
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.warn = function(LOGniMsgMessage, LOGniMsgNo, LOGniMsgData) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		const msg = this.__msg(LOGniMsgMessage, "WARN", LOGniMsgNo, LOGniMsgData);
		if (msg === "") return 0;

		let style = `background:white; color:black; font-style:italic;`;
		if (this.LOGniColor) {
			style = `color: ${this.__LOGniColors[this.__LOGniSeverityColors.WARN]}`;
			Console.warn(`%c${msg}`, style);
		} else {
			Console.log(`%c${msg}`, style);
		}
		return 1;
	};
	this.warning = this.warn;


  	/**
  	 * Error message: error conditions
         *
         * Outputs an error message. You may use string substitution 
         * and additional arguments with this method.
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.error = function(LOGniMsgMessage, LOGniMsgNo, LOGniMsgData) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		const msg = this.__msg(LOGniMsgMessage, "ERROR", LOGniMsgNo, LOGniMsgData);
		if (msg === "") return 0;

		let style = `background:white; color:black; font-weight:bold;`;
		if (this.LOGniColor) {
			style = `color: ${this.__LOGniColors[this.__LOGniSeverityColors.ERROR]}`;
			Console.error(`%c${msg}`, style);
		} else {
			Console.log(`%c${msg}`, style);
		}
		return 1;
	};
	this.err = this.error;	



  	/**
  	 * Emergency message: system is unusable
  	 * 
         * Alias for CRITICAL=4
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @static
  	 */
	this.emergency = function(LOGniMsgMessage) {
		return this.critical(LOGniMsgMessage, 4);
	};


  	/**
  	 * Notice message: normal but significant condition
  	 * 
	 * Alias for INFO=1
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @static
  	 */
	this.notice = function(LOGniMsgMessage) {
		return this.info(LOGniMsgMessage, 1);
	};


  	/**
  	 * Alert message: action must be taken immediately
  	 * 
	 * Alias for ERROR=3
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @static
  	 */
	this.alert = function(LOGniMsgMessage) {
		return this.error(LOGniMsgMessage, 3);
	};


  	/**
  	 * Log message
         *
         * For general output of logging information. You may use string 
         * substitution and additional arguments with this method.
  	 * 
  	 * Alias for INFO=1
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @static
  	 */
	this.log = function(LOGniMsgMessage) {
		return this.info(LOGniMsgMessage, 1);
	};


  	/**
  	 * Exception message
         *
         * This deprecated API should no longer be used, 
	 * but will probably still work
  	 * 
  	 * Alias for ERROR=4
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @static
  	 */
	this.exception = function(LOGniMsgMessage) {
		return this.error(LOGniMsgMessage, 4);
	};



  	/**
  	 * Create or update cookie
  	 * 
  	 * @param {string} name,
  	 * @param {string} value,
  	 * @param {number} dayNo,
  	 * @static
  	 */
	this.setCookie = function(name, value, dayNo) {
		let expires;
		if (dayNo) {
			let date = new Date();
			date.setTime(date.getTime()+(dayNo*86400*1000));
			expires = `; expires=${date.toGMTString()}`;
		} else {
			expires = '';
		}
		cookies = `${name}=${value}${expires}; path=/`;
		this.__debug(`cookieSet ${name}="${value}"${expires}`);
	
		return 0;
	};

  	/**
  	 * Read cookie
  	 * 
  	 * @param {string} name,
  	 * @static
  	 */
	this.cookieGet = function(name) {
		const cookieNameEQ = name + "=";
		const cookieDecoded = decodeURIComponent(cookies);
		const ca = cookieDecoded.split(';');
		for(let i=0;i < ca.length;i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1,c.length);
			}
			if (c.indexOf(cookieNameEQ) === 0) {
				const ret = c.substring(cookieNameEQ.length,c.length);
				this.__debug(`cookieGet ${name}="${ret}"`);
				return ret;
			}
		}
		this.__debug(`cookieGet ${name} not exist`);
		return;
	};

  	/**
  	 * Remove cookie
  	 * 
  	 * @param {string} name,
  	 * @static
  	 */
	this.cookieDel = function(name) {
		this.__debug(`cookieDel ${name}`);
		this.setCookie(name, '', -1);

		return 0;
	};



  	/**
  	 * Log for debug mode 
  	 * 
  	 * @param {string} msg,
  	 * @param {bool} prefix,
  	 * @static
  	 */
	this.__debug = function(msg, prefix) {
		if (prefix === undefined) prefix=true;
		if (this.debugMode) {
			if (prefix) {
				Console.debug(`%c[logni.js] ${msg}`, 'font-style: italic;');
			} else {
				Console.debug(msg);
			}
		}

		return 0;
	};


	// initialize
	this.__init__();

};

// package.json
if ("undefined" !== typeof module) {
	module.exports = logni;
}
