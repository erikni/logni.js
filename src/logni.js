var logni = new function() {

	this.debugMode 	= 0;

	// init
	this.__init__  = function() {
		
		this.__LOGniMaskLevel	= {};
		this.__LOGniMaskNo	= {}

		// colors: https://getbootstrap.com/docs/4.1/components/alerts/
		this.__LOGniColors = {
			primary:  '#004085', // svetle modra
			secondary:'#383d41', // seda
			success:  '#155724', // svetle zelena
			danger:   '#721c24', // svetle ruzova
			warning:  '#856404', // svetle zluta
			info:     '#0c5460', // svetle modro-zelena
			light:    '#818182', // svetle seda
			dark:     '#1b1e21', // tmave seda
		};

		this.__LOGniLevelColors = {
			DEBUG:	'light',
			INFO:	'primary',
			WARN:	'warning',
			ERROR:	'danger',
			FATAL:	'danger',
		}

		this.__logMaskNameFull 	= [ 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL' ];
		if ( this.debugMode == 1 ) {
			console.log( 'DEBUG: this.__logMaskNameFull='+ this.__logMaskNameFull );
		}

		this.__logMaskNameShort = [];
		for (i = 0; i < this.__logMaskNameFull.length; i++) {
			var _s = this.__logMaskNameFull[i].substring(0,1);
			this.__logMaskNameShort[i] = _s;
			if ( this.debugMode == 1 ) {
				console.log( 'DEBUG: level fullName="'+this.__logMaskNameFull[i]+'" -> shortName="'+_s+'"' );
			}

			this.__LOGniMaskLevel[this.__logMaskNameShort[i]] = 0; 
			this.__LOGniMaskNo[   this.__logMaskNameShort[i]] = 0; 

		}
		if ( this.debugMode == 1 ) {
			console.log( 'DEBUG: this.__logMaskNameShort='+ this.__logMaskNameShort );

			console.log( 'DEBUG: this.__LOGniMaskLevel='+ this.__LOGniMaskLevel );
			console.log( this.__LOGniMaskLevel );

			console.log( 'DEBUG: this.__LOGniMaskNo='+ this.__LOGniMaskNo );
			console.log( this.__LOGniMaskNo );
		}

		// default		
		this.mask( 'ALL' );
		this.stderr( 1 );

	}

	// set mask
	this.mask = function( LOGniMask='ALL' ) {
		if ( this.debugMode == 1 ) {
			console.log( 'DEBUG: init: logni.mask('+ LOGniMask +')');
		}
		this.LOGniMask = LOGniMask;

		if ( this.LOGniMask == 'ALL' ) {
			
			// set default LEVEL=1
			for (i = 0; i < this.__logMaskNameShort.length; i++) {
				this.__LOGniMaskLevel[ this.__logMaskNameShort[i] ] = 1;
			}
	
		} else {

			// len is wrong
			var l = this.LOGniMask.length;
			if ( l < 2 ) {
				return 0
			} else if ( l > 10 ) {
				return 0
			}

			// set default LEVEL=0
			for (i = 0; i < this.__logMaskNameShort.length; i++) {
				this.__LOGniMaskLevel[ this.__logMaskNameShort[i] ] = 0;
			}

			// set level
			for (i = 0; i < l; i += 2) {
				var _l = this.LOGniMask.substring(i,i+1);
				var _no= parseInt(this.LOGniMask.substring(i+1,i+2));
				if ( this.debugMode == 1 ) {
					if ( this.debugMode == 1 ) {
						console.log( 'DEBUG: mask="'+this.LOGniMask+'" '+i+':'+(i+1)+' level="'+_l+'" no="'+_no+'"' );
					}
				}

				if(typeof this.__LOGniMaskLevel[_l] === 'undefined') {
					if ( this.debugMode == 1 ) {
						console.log( 'DEBUG: this.__LOGniMaskLevel['+_l+'] is undefined' );
					}
					return 0
				} else {
					this.__LOGniMaskLevel[_l] = _no;
				}
			}
			if ( this.debugMode == 1 ) {
				console.log( 'DEBUG: set this.__LOGniMaskLevel='+ this.__LOGniMaskLevel );
				console.log( this.__LOGniMaskLevel );
			}
		}
		

	}

	// set stderr
	this.stderr = function( LOGniStderr=0 ) {
		if ( this.debugMode == 1 ) {
			console.log( 'DEBUG: init: logni.stderr('+ LOGniStderr +')');
		}
		this.LOGniStderr = LOGniStderr;
	}

	// log use?
	this.__logUse = function( LOGniMsgLevel0, LOGniMsgNo=1 ) {

		// mask=ALL
		if ( this.LOGniMask == 'ALL' ) {
			return 1;
		}

		if(typeof this.__LOGniMaskLevel[LOGniMsgLevel0] === 'undefined') {
			if ( this.debugMode == 1 ) {
				console.log( 'DEBUG: this.__LOGniMaskLevel['+LOGniMsgLevel0+'] is undefined' );
			}
			return 0;
		}

		// message hidden
		var _no = this.__LOGniMaskLevel[ LOGniMsgLevel0 ];
		if ( LOGniMsgNo < _no ) {
			if ( this.debugMode == 1 ) {
				console.log( 'DEBUG: HIDDEN level='+LOGniMsgLevel0+' msgNo='+LOGniMsgNo+' < maskNo='+_no+'' );
			}
			return 0;
		}

		// message visible
		if ( this.debugMode == 1 ) {
			console.log( 'DEBUG: VISIBLE level='+LOGniMsgLevel0+' msgNo='+LOGniMsgNo+' >= maskNo='+_no+'' );
		}
		return 1;

	}

	// log message
	this.__msg = function( LOGniMsgMessage='', LOGniMsgLevel, LOGniMsgNo=1 ) {

		// priority
		if (LOGniMsgNo < 1) {
 			LOGniMsgNo = 1
		} else if (LOGniMsgNo > 4 ) {
			LOGniMsgNo = 4 
		}

		var __logniTime = new Date().toISOString();
		var __l0 = LOGniMsgLevel.substring(0, 1);
		var __logniPrefix = __l0 + LOGniMsgNo;

		if (this.__logUse(__l0, LOGniMsgNo) == 0) { 
			return 0
		}

		if ( this.LOGniStderr == 1 ) {
			console.log('%c'+ __logniTime +' '+ __logniPrefix +': '+LOGniMsgMessage, 'color: '+this.__LOGniColors[this.__LOGniLevelColors[LOGniMsgLevel]] );
		}

		//t = console.trace().toString();
		//for(var i=0, len=t.length; i < len; i++) {
		//	console.log( t[i] );
		//}

		return 1

	}

	// log method
	this.debug = function( LOGniMsgMessage, LOGniMsgNo=1 ) {
		this.__msg( LOGniMsgMessage, 'DEBUG', LOGniMsgNo );
	}

	this.critical = function( LOGniMsgMessage, LOGniMsgNo=1 ) {
		this.__msg( LOGniMsgMessage, 'FATAL', LOGniMsgNo );
	}

	this.informational = function( LOGniMsgMessage, LOGniMsgNo=1 ) {
		this.__msg( LOGniMsgMessage, 'INFO', LOGniMsgNo );
	}

	this.warning = function( LOGniMsgMessage, LOGniMsgNo=1 ) {
		this.__msg( LOGniMsgMessage, 'WARN', LOGniMsgNo );
	}

	this.error = function( LOGniMsgMessage, LOGniMsgNo=1 ) {
		this.__msg( LOGniMsgMessage, 'ERROR', LOGniMsgNo );
	}

	// synonym
	this.warn = this.warning;
	this.info = this.informational;
	this.fatal= this.critical;
	this.dbg  = this.debug;	
	this.err  = this.error;	

	// alias
	this.emergency = function( LOGniMsgMessage ) {
		this.__msg( LOGniMsgMessage, 'FATAL', 4 );
	}

	this.notice = function( LOGniMsgMessage ) {
		this.__msg( LOGniMsgMessage, 'INFO', 1 );
	}

	// initialize
	this.__init__();
}
