var logni = new function() {
	this.LOGniStderr = 1;
	this.LOGniMask	 = 'ALL';
	

	this.mask = function( LOGniMask='ALL' ) {
		console.log( 'init: logni.mask('+ LOGniMask +')');
		this.LOGniMask = LOGniMask;
	}

	this.stderr = function( LOGniStderr=0 ) {
		console.log( 'init: logni.stderr('+ LOGniStderr +')');
		this.LOGniStderr = LOGniStderr;
	}

	this.__msg = function( LOGniMsgMessage='', LOGniMsgLevel, LOGniMsgNo=1 ) {

		// priority
		if (LOGniMsgNo < 1) {
 			LOGniMsgNo = 1
		} else if (LOGniMsgNo > 4 ) {
			LOGniMsgNo = 4 
		}

		// colors: https://getbootstrap.com/docs/4.1/components/alerts/
		var colors = {
			primary:  '#004085', // svetle modra
			secondary:'#383d41', // seda
			success:  '#155724', // svetle zelena
			danger:   '#721c24', // svetle ruzova
			warning:  '#856404', // svetle zluta
			info:     '#0c5460', // svetle modro-zelena
			light:    '#818182', // svetle seda
			dark:     '#1b1e21', // tmave seda
		};

		var levelColors = {
			DEBUG:	'light',
			INFO:	'primary',
			WARN:	'warning',
			ERROR:	'danger',
			FATAL:	'danger',
		}

		var __logniTime = new Date().toISOString();
		var __logniPrefix = LOGniMsgLevel.substring(0, 1) + LOGniMsgNo;

		if ( this.LOGniStderr == 1 ) {
			console.log('%c'+ __logniTime +' '+ __logniPrefix +': '+LOGniMsgMessage, 'color: '+colors[levelColors[LOGniMsgLevel]] );
		}

		//t = console.trace().toString();
		//for(var i=0, len=t.length; i < len; i++) {
		//	console.log( t[i] );
		//}

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

}
