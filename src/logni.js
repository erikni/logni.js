
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
 * @version 0.1.5
 * @author Erik Brozek - https://github.com/erikni
 * @since 2017
 * @static
 * Website: https://logni.net
 */


// nodejs compatible mode
var Console = console;


var logni = new function() {

	// debugMode is disabled
	this.debugMode 	= false;

	// init
	this.__init__  = function() {
		
		this.__LOGniMaskSeverity = {};

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

		this.__LOGniSeverityColors = {
			DEBUG: "light",
			INFO: "primary",
			WARN: "warning",
			ERROR: "danger" ,
			CRITICAL: "danger",
		};

		// severity (fullname)
		this.__logMaskSeverityFull 	= ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"];
		if (this.debugMode) {
			Console.log("DEBUG: this.__logMaskSeverityFull="+ this.__logMaskSeverityFull);
		}

		// severity (sortname)
		this.__logMaskSeverityShort = [];
		var i=0;
		for (i = 0; i < this.__logMaskSeverityFull.length; i++) {
			var _s = this.__logMaskSeverityFull[i].substring(0,1);
			this.__logMaskSeverityShort[i] = _s;
			if (this.debugMode) {
				Console.log("DEBUG: level fullName="+ 
					this.__logMaskSeverityFull[i]+" -> shortName="+_s 
				);
			}

			this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = 5; 

		}
		if (this.debugMode) {
			Console.log("DEBUG: this.__logMaskSeverityShort="+ this.__logMaskSeverityShort);

			Console.log("DEBUG: this.__LOGniMaskSeverity="+ this.__LOGniMaskSeverity);
			Console.log(this.__LOGniMaskSeverity);
		}

		// default		
		this.mask("ALL");
		this.stderr(1);

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

		// debug mask
		if (this.debugMode) {
			Console.log("DEBUG: init: logni.mask("+ LOGniMask +")");
		}
		this.LOGniMask = LOGniMask;

		var i=0;
		if (this.LOGniMask == "ALL") {
			
			// set default LEVEL=1
			for (i = 0; i < this.__logMaskSeverityShort.length; i++) {
				this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = 1;
			}
	
		} else {

			// len is wrong
			var l = this.LOGniMask.length;
			if (l < 2) {
				return 0;
			} else if (l > 10) {
				return 0;
			}

			// set default LEVEL=0
			for (i = 0; i < this.__logMaskSeverityShort.length; i++) {
				this.__LOGniMaskSeverity[this.__logMaskSeverityShort[i]] = 5;
			}

			// set level
			for (i = 0; i < l; i += 2) {
				var _l = this.LOGniMask.substring(i,i+1);
				var _no= parseInt(this.LOGniMask.substring(i+1,i+2), 10);
				if (this.debugMode) {
					if (this.debugMode) {
						Console.log("DEBUG: mask="+
							this.LOGniMask+" "+i+":"+(i+1)+
							" level="+_l+" no="+_no
						);
					}
				}

				if(typeof this.__LOGniMaskSeverity[_l] === "undefined") {
					if (this.debugMode) {
						Console.log("DEBUG: this.__LOGniMaskSeverity["+_l+"] is undefined");
					}
					return 0;
				} else {
					this.__LOGniMaskSeverity[_l] = _no;
				}
			}
			if (this.debugMode) {
				Console.log("DEBUG: set this.__LOGniMaskSeverity="+ this.__LOGniMaskSeverity);
				Console.log(this.__LOGniMaskSeverity);
			}
		}
		

		this.__msg("Init mask="+LOGniMask, "INFO", 1, false);
	};


  	/**
  	 * Set stderr
  	 * 
  	 * @param {number} LOGniStderr,
  	 * @static
  	 */
	this.stderr = function(LOGniStderr) {
		if (LOGniStderr === undefined) LOGniStderr=0;

		// debug stderr
		if (this.debugMode) {
			Console.log("DEBUG: init: logni.stderr("+ LOGniStderr +")");
		}
		this.LOGniStderr = LOGniStderr;
	};


  	/**
  	 * Set file/url
  	 * 
  	 * @param {string} LOGniFile,
  	 * @static
  	 */
	this.file = function(LOGniFile) {
		if (LOGniFile === undefined) LOGniFile="";

		// debug file/url
		if (this.debugMode) {
			Console.log("DEBUG: init: logni.file("+ LOGniFile +")");
		}
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
		if (this.debugMode) {
			Console.log("DEBUG: init: logni.enviroment("+ LOGniEnv +")");
		}
		this.__LOGniEnvStr = "env="+LOGniEnv;
		this.__msg("Init enviroment="+LOGniEnv, "INFO", 1, false);
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
		if (this.debugMode) {
			Console.log("DEBUG: init: logni.name("+ LOGniName +")");
		}
		this.LOGniName = LOGniName;
		this.__LOGniNameStr = "name="+LOGniName;
		this.__msg("Init name="+LOGniName, "INFO", 1, false);
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
		if (this.debugMode) {
			Console.log("DEBUG: init: logni.release("+ LOGniRelease +")");
		}
		this.LOGniRelease = LOGniRelease;
		this.__LOGniRelStr = "rel="+LOGniRelease;
		this.__msg("Init release="+LOGniRelease, "INFO", 1, false);
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
		if (this.LOGniMask == "ALL") {
			return true;
		}

		if(typeof this.__LOGniMaskSeverity[LOGniMsgSeverity0] === "undefined") {
			if (this.debugMode) {
				Console.log("DEBUG: this.__LOGniMaskSeverity["+
					LOGniMsgSeverity0+"] is undefined"
				);
			}
			return false;
		}

		// message hidden
		var _no = this.__LOGniMaskSeverity[LOGniMsgSeverity0];
		if (LOGniMsgNo < _no) {
			if (this.debugMode) {
				Console.log("DEBUG: HIDDEN level="+
					LOGniMsgSeverity0+" msgNo="+LOGniMsgNo+" < maskNo="+_no
				);
			}
			return false;
		}

		// message visible
		if (this.debugMode) {
			Console.log("DEBUG: VISIBLE level="+
				LOGniMsgSeverity0+" msgNo="+LOGniMsgNo+" >= maskNo="+_no
			);
		}
		return true;

	};


  	/**
  	 * Log message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {string} LOGniMsgSeverity,
  	 * @param {number} LOGniMsgNo,
  	 * @param {boolean} LOGniMsgExt,
	 * @return {number} return
  	 * @private
  	 */
	this.__msg = function(LOGniMsgMessage, LOGniMsgSeverity, LOGniMsgNo, LOGniMsgExt) {
		if (LOGniMsgMessage === undefined) LOGniMsgMessage="";
		if (LOGniMsgSeverity === undefined) LOGniMsgSeverity="DEBUG";
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;

		// priority
		if (LOGniMsgNo < 1) {
 			LOGniMsgNo = 1;
		} else if (LOGniMsgNo > 4 ) {
			LOGniMsgNo = 4;
		}

		var __logniTime = new Date().toISOString();
		var __logniTS   = Math.round(new Date().getTime()/1000);
		var __l0 = LOGniMsgSeverity.substring(0, 1);
		var __logniPrefix = __l0 + LOGniMsgNo;

		if (this.__logUse(__l0, LOGniMsgNo) == false) { 
			return 0;
		}

		// stderr(1)
		if (this.LOGniStderr) {

			var LOGniMsgExtVisible = false;
			if (LOGniMsgExt) {
				LOGniMsgExtVisible = true;
			}

			// if environment dont set -> no visible
			if (this.__LOGniRelStr === "rel=0.0.0" && this.__LOGniNameStr === "name=unknown" && this.__LOGniEnvStr === "env=local") {
				LOGniMsgExtVisible = false;
			}

			// log messsage with env params
			if (LOGniMsgExtVisible) {
				Console.log("%c"+ __logniTime +" "+ __logniPrefix +": "+LOGniMsgMessage +
					" {"+this.__LOGniNameStr+", "+this.__LOGniRelStr+", "+this.__LOGniEnvStr+"}", 
					"color: "+this.__LOGniColors[this.__LOGniSeverityColors[LOGniMsgSeverity]] 
				);
			// log message without env params
			} else {
				Console.log("%c"+ __logniTime +" "+ __logniPrefix +": "+LOGniMsgMessage, 
					"color: "+this.__LOGniColors[this.__LOGniSeverityColors[LOGniMsgSeverity]] 
				);
			}
		}

		// send message to log server
		if (this.__LOGniFile !== "") {
			var __url=this.__LOGniFile+"/log/"+ __logniPrefix +".json?n="+this.LOGniName+"&t="+
				__logniTS+"&m="+encodeURIComponent(LOGniMsgMessage);

			var __req = new XMLHttpRequest();
			__req.open("GET", __url, true);
			__req.setRequestHeader("Content-type","application/json; charset=utf-8");
			__req.withCredentials = true;
			__req.send(null);
	
			// debug url	
			if (this.debugMode) {
				Console.log("URL:"+__url);
			}
		}

		//t = Console.trace().toString();
		//for(var i=0, len=t.length; i < len; i++) {
		//	Console.log(t[i]);
		//}

		return 1;
	};


  	/**
  	 * Debug message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.debug = function(LOGniMsgMessage, LOGniMsgNo) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;
		this.__msg(LOGniMsgMessage, "DEBUG", LOGniMsgNo, true);
	};


  	/**
  	 * Critical error message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.critical = function(LOGniMsgMessage, LOGniMsgNo) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;
		this.__msg(LOGniMsgMessage, "CRITICAL", LOGniMsgNo, true);
	};


  	/**
  	 * Info message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.informational = function(LOGniMsgMessage, LOGniMsgNo) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;
		this.__msg(LOGniMsgMessage, "INFO", LOGniMsgNo, true);
	};


  	/**
  	 * Warning message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.warning = function(LOGniMsgMessage, LOGniMsgNo) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;
		this.__msg(LOGniMsgMessage, "WARN", LOGniMsgNo, true);
	};


  	/**
  	 * Error message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.error = function(LOGniMsgMessage, LOGniMsgNo) {
		if (LOGniMsgNo === undefined) LOGniMsgNo=1;
		this.__msg(LOGniMsgMessage, "ERROR", LOGniMsgNo, true);
	};


	// synonym log mesage
	this.warn = this.warning;
	this.info = this.informational;
	this.fatal = this.critical;
	this.dbg = this.debug;	
	this.err = this.error;	


  	/**
  	 * Emergency message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.emergency = function(LOGniMsgMessage) {
		this.__msg(LOGniMsgMessage, "CRITICAL", 4, true);
	};


  	/**
  	 * Notice message
  	 * 
  	 * @param {string} LOGniMsgMessage,
  	 * @param {number} LOGniMsgNo,
  	 * @static
  	 */
	this.notice = function(LOGniMsgMessage) {
		this.__msg(LOGniMsgMessage, "INFO", 1, true);
	};

	// initialize
	this.__init__();
};

// package.json
if ("undefined" !== typeof module) {
	module.exports = logni;
}
