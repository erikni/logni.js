
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
 * @fileoverview logni is avascript library for event logging 
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
 * @version 0.2.0
 * @author Erik Brozek - https://github.com/erikni
 * @since 2017
 * @static
 * Website: https://logni.net
 */


// version
const version = '0.2.0-5';


// nodejs compatible mode
const Console = console;

// nodejs 6 compatible for console.debug 
try {
	Console.debug(`[logni.js] version=${version}`);
}
catch(err) {
	Console.debug = (msg) => {
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
  	 * Set mask
  	 * 
  	 * @param {string} LOGniMask,
  	 * @static
  	 */
	this.mask = function(LOGniMask) {
		if (LOGniMask === undefined) LOGniMask="ALL";

		// cookie mask
		let cookieLOGniMask = this.cookieGet('LOGNI_MASK');
		if (cookieLOGniMask) {
			this.__debug(`set LOGniMask=${cookieLOGniMask}`);
			LOGniMask = cookieLOGniMask;
		}

		// debug mask
		this.__debug(`init: logni.mask(${LOGniMask})`);
		this.LOGniMask = LOGniMask;

		let i=0;
		if (this.LOGniMask === "ALL") {
			
			// set default LEVEL=1
			for (i = 0; i < this.__logMaskSeverityShort.length; i++) {
				this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = 1;
			}
	
		} else {

			// len is wrong
			const l = this.LOGniMask.length;
			if (l < 2) {
				return 0;
			} else if (l > 10) {
				return 0;
			}

			// set default LEVEL=0
			for (i = 0; i < this.__logMaskSeverityShort.length; i++) {
				this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = 5;
			}

			// set severity
			for (i = 0; i < l; i += 2) {
				let _l = this.LOGniMask.substring(i,i+1);
				let _no= parseInt(this.LOGniMask.substring(i+1,i+2), 10);
				this.__debug('mask='
					+ `${this.LOGniMask} ${i}:${i+1} `
					+ `severity=${_l} priority=${_no}`
				);

				if(typeof this.__LOGniMaskSeverity[_l] === "undefined") {
					this.__debug(`this.__LOGniMaskSeverity[${l}] `
						+ 'is undefined');
					return 0;
				} else {
					this.__LOGniMaskSeverity[_l] = _no;
				}
			}
			this.__debug('set this.__LOGniMaskSeverity='
				+ `${this.__LOGniMaskSeverity}`);
			this.__debug(this.__LOGniMaskSeverity, false);
		}
		

		this.info(`[logni.js] init mask=${LOGniMask}`, 1);
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
		let cookieLOGniStderr = this.cookieGet('LOGNI_STDERR');
		if (cookieLOGniStderr) {
			this.__debug(`set LOGniStderr=${cookieLOGniStderr}`);
			LOGniStderr = cookieLOGniStderr;
		}

		// debug stderr
		this.__debug(`init: logni.stderr(${LOGniStderr})`);

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
		this.__debug(`init: logni.file(${LOGniFile})`);

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
		this.__debug(`init: logni.enviroment(${LOGniEnv})`);

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
		this.__debug(`init: logni.name(${LOGniName})`);

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
		this.__debug(`init: logni.release(${LOGniRelease})`);

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
		let cookieLOGniColor = this.cookieGet('LOGNI_COLOR');
		if (cookieLOGniColor) {
			this.__debug(`set LOGniColor=${cookieLOGniColor}`);
			LOGniColor = cookieLOGniColor;
		}

		this.LOGniColor = LOGniColor;
		this.info(`[logni.js] init color=${LOGniColor}`, 1);
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
			this.__debug(`severity=${LOGniMsgSeverity0} msgNo=${LOGniMsgNo} >= mask=ALL -> msg log is VISIBLE`);
			return true;
		}

		if(typeof this.__LOGniMaskSeverity[LOGniMsgSeverity0] === "undefined") {
			this.__debug(`${this.__LOGniMaskSeverity.LOGniMsgSeverity0} `
				+ 'is undefined');
			return false;
		}

		// message hidden
		const _no = this.__LOGniMaskSeverity[LOGniMsgSeverity0];
		if (LOGniMsgNo < _no) {
			this.__debug(`severity=${LOGniMsgSeverity0} `
				+ `msgNo=${LOGniMsgNo} <  maskNo=${_no} -> msg log is HIDDEN`
			);
			return false;
		}

		// message visible
		this.__debug(`severity=${LOGniMsgSeverity0} `
			+ `msgNo=${LOGniMsgNo} >= maskNo=${_no} -> msg log is VISIBLE`
		);
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
  	 * Log message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {string} LOGniMsgSeverity,
  	 * @param {number} LOGniMsgNo,
  	 * @param {bool} LOGniMsgExt,
  	 * @param {array} LOGniMsgData,
	 * @return {number} return
  	 * @private
  	 */
	this.__msg = function(LOGniMsgMessage, LOGniMsgSeverity, LOGniMsgNo, LOGniMsgExt, LOGniMsgData) {
		if (LOGniMsgMessage === undefined) LOGniMsgMessage="";
		if (LOGniMsgSeverity === undefined) LOGniMsgSeverity="DEBUG";
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		// priority
		if (LOGniMsgNo < 1) {
 			LOGniMsgNo = 1;
		} else if (LOGniMsgNo > 4 ) {
			LOGniMsgNo = 4;
		}

		const __logniTime = new Date().toISOString();
		const __logniTS   = Math.round(new Date().getTime()/1000);
		const __l0 = LOGniMsgSeverity.substring(0, 1);
		const __logniPrefix = __l0 + LOGniMsgNo;
		let LOGniMsgText = '';

		if (this.__logUse(__l0, LOGniMsgNo) === false) { 
			return '';
		}


		// error stack
		const LOGniError = new Error();

		const LOGniErrorStackLast2 = this.__errorStack(LOGniError, 2);
		const LOGniErrorStackLast1 = this.__errorStack(LOGniError, 1);

		const LOGniErrorStackExt = 'stack='+LOGniErrorStackLast2+', '+LOGniErrorStackLast1;
		// const LOGniErrorStackExt = '';

		// debug for error stack
		this.__debug(LOGniError);

		// stderr(1)
		if (this.LOGniStderr) {

			let LOGniMsgExtVisible = false;
			if (LOGniMsgExt) {
				LOGniMsgExtVisible = true;
			}

			// if environment dont set -> no visible
			if (this.__LOGniRelStr === "rel=0.0.0" && 
				this.__LOGniNameStr === "name=unknown" &&
				this.__LOGniEnvStr === "env=local") {
				LOGniMsgExtVisible = false;
			}

			// log messsage with env params
			if (LOGniMsgExtVisible) {
				LOGniMsgText = `${__logniTime} ${__logniPrefix}: ${LOGniMsgMessage} `
					+ `{${LOGniErrorStackExt}, ${this.__LOGniNameStr}, `
					+ `${this.__LOGniRelStr}, ${this.__LOGniEnvStr}}`;
			// log message without env params
			} else {
				LOGniMsgText = `${__logniTime} ${__logniPrefix}: ${LOGniMsgMessage} `
					+ `{${LOGniErrorStackExt}}`;
			}

			// https://developer.mozilla.org/en-US/docs/Web/API/Console/table
			if (typeof LOGniMsgData !== "undefined") {
				Console.table(LOGniMsgData);
			}
		}

		// send message to log server
		if (this.__LOGniFile !== "") {
			const __url=`${this.__LOGniFile}/log/${__logniPrefix}.json?n=${this.LOGniName}&`
				+ `t=${__logniTS}&m=${encodeURIComponent(LOGniMsgMessage)}`;

			let __req = new XMLHttpRequest();
			__req.open("GET", __url, true);
			__req.setRequestHeader("Content-type","application/json; charset=utf-8");
			__req.withCredentials = true;
			__req.send(null);
	
			// debug url	
			this.__debug(`url=${__url}`);
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

		const LOGniMsgDbgText = this.__msg(LOGniMsgMessage, "DEBUG", LOGniMsgNo, true, LOGniMsgData);
		if (LOGniMsgDbgText === "") {
			return 0;
		}

		// color debug
		if (this.LOGniColor) {
			Console.debug(`%c${LOGniMsgDbgText}`,
				`color: ${this.__LOGniColors[this.__LOGniSeverityColors.DEBUG]}`);

		// black-white debug
		} else {
			Console.debug(LOGniMsgDbgText);
		}

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

		const LOGniMsgCriText = this.__msg(LOGniMsgMessage, "CRITICAL", LOGniMsgNo, true, LOGniMsgData);
		if (LOGniMsgCriText === "") {
			return 0;
		}

		if (this.LOGniColor) {
			Console.error(`%c${LOGniMsgCriText}`, 
				`color: ${this.__LOGniColors[this.__LOGniSeverityColors.CRITICAL]}`);
		} else {
			Console.error(LOGniMsgCriText);
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

		const LOGniMsgInfoText = this.__msg(LOGniMsgMessage, "INFO", LOGniMsgNo, true, LOGniMsgData);
		if (LOGniMsgInfoText === "") {
			return 0;
		}

		if (this.LOGniColor) {
			Console.info(`%c${LOGniMsgInfoText}`, 
				`color: ${this.__LOGniColors[this.__LOGniSeverityColors.INFO]}`);
		} else {
			Console.info(LOGniMsgInfoText);
		}
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

		const LOGniMsgWarnText = this.__msg(LOGniMsgMessage, "WARN", LOGniMsgNo, true, LOGniMsgData);
		if (LOGniMsgWarnText === "") {
			return 0;
		}

		if (this.LOGniColor) {
			Console.warn(`%c${LOGniMsgWarnText}`, 
				`color: ${this.__LOGniColors[this.__LOGniSeverityColors.WARN]}`);
		} else {
			Console.warn(LOGniMsgWarnText);
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

		const LOGniMsgErrText = this.__msg(LOGniMsgMessage, "ERROR", LOGniMsgNo, true, LOGniMsgData);
		if (LOGniMsgErrText === "") {
			return 0;
		}

		if (this.LOGniColor) {
			Console.error(`%c${LOGniMsgErrText}`, 
				`color: ${this.__LOGniColors[this.__LOGniSeverityColors.ERROR]}`);
		} else {
			Console.error(LOGniMsgErrText);
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
		this.__debug(`cookieSet ${name}="${ret}"${expires}`);
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
				Console.debug(`[logni.js] ${msg}`);
			} else {
				Console.debug(msg);
			}
		}
	};


	// initialize
	this.__init__();

};

// package.json
if ("undefined" !== typeof module) {
	module.exports = logni;
}
