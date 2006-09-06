/**
 * logger.js
 * 
 * require prototype.js only
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

/**
 * ログを出力するためのクラス
 */
Log = Class.create();
Log.Level = {
	DEBUG: "debug",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
	FETAL: "fetal"
}
Log.logs = [];
Log.add = function(log) {
	this.logs.push(log);
}
Log.remove = function(log) {
	for(var i = 0; i < this.logs.length; i++) {
		if (this.logs[i] == log)
			this.logs[i] =null;
	}
}
Log.windowRegistered = function( logWindow ) {
	for(var i = 0; i < this.logs.length; i++) {
		var logger = this.logs[i];
		if (!logger)
			continue;
		if (!logger.logWindow)
			this.logs[i].logWindow = logWindow;
		else if (logger.logWindow.buffering)
			this.logs[i].logWindow = logWindow;
	}
};
Log.prototype = {
	initialize: function(name) {
		this._name = name;
		Log.add(this);
		this.logWindow = LogWindow.getDefaultLogWindow();
	},
	
	_checkLogWindow: function() {
		if (this.logWindow) 
			return true;
		if (LogWindow.loadingWindow) {
			this.logWindow = LogBuffer.instance;
			return true;
		}
		return false;
	},
	
	debug: function( msg ) {
		if (!this._checkLogWindow()) 
			return;
		this.logWindow.write(msg, this._name, new Date());
	},
	
	debugObj: function( msg, obj ) {
		if (!this._checkLogWindow()) 
			return;
		if (!obj) {
			this.debug(msg + " null " );
			return;
		}
		if (obj.constructor == Array && obj.length < 1) {
			this.debug(msg + " 0 length array" );
			return;
		}
		var objects = (obj.constructor == Array) ? obj : [ obj ];
		for(var i = 0; i < objects.length; i++) {
			var indexer = (obj.constructor == Array) ? ("[" + i + "]") : "" ;
			var value = objects[i];
			if (!value) {
				this.debug(msg + indexer+ ": null");
				continue;
			}
			if (value.constructor == String || value.constructor == Number || value.constructor == Date) {
				this.debug(msg + indexer+ " (" + typeof(value) +") "+ value);
			} else {
				this.debug(msg + indexer);
				this.writeProperties("properties", value, this._getSortedProperties(value));
				this.writeProperties("methods", value, this._getSortedMethods(value));
			}
		}
	},
	
	_getSortedProperties: function( obj ) {
		var props = new Array();
		for (var key in obj){
			if (key == "extend")
				continue;
			var value;
			try {
				value = obj[key];
			} catch(e2) {
				value = null;
			}
			if (typeof(value) != "function")
				props.push(key);
		}
		props.sort();
		return props;
	},
	
	_getSortedMethods: function( obj ) {
		var props = new Array();
		for (var key in obj){
			if (key == "extend")
				continue;
			try {
				value = obj[key];
			} catch(e2) {
				continue;
			}
			if (typeof(value) == "function")
				props.push(key);
		}
		props.sort();
		return props;
	},
	
	writeProperties: function( tilte, obj, props ) {
		if (!props || props.length < 1)
			return;
		this.logWindow.write("------------- " +tilte+ " of [" +  typeof(obj) + "] -------------");
		for (var i = 0; i < props.length; i++){
			var key = props[i];
			var prop;
			try {
				prop = obj[key];
			} catch(e) {
				prop = "failed to get";
			}
			try {
				var typeOfProp =  typeof(prop);
				if (typeOfProp == "function")
					this.logWindow.write("["+ typeOfProp + "] " + key);
				else
					this.logWindow.write("["+ typeOfProp + "] " + key +":"+ prop);
			} catch(e) {
				this.logWindow.write("[unknown] " + key +":"+ prop);
				props.push(key);
			}
			
		}
	}
}
/**
 * LogWindowが表示される前のログのバッファ
 */
LogBuffer = Class.create();
LogBuffer.prototype = {
	initialize: function() {
		this.logs = null;
		this.buffering = true;
	},
	write: function( _msg, _name,  _date ){
		if (!this.logs)
			this.logs = new Array();
		this.logs.push( {
			msg:  _msg,
			name: _name,
			date: _date
		} );
	},
	
	flush: function( logWindow ) {
		if (!this.logs)
			return;
		for(var i = 0; i < this.logs.length; i++) {
			var alog = this.logs[i];
			logWindow.write( alog.msg, alog.name, alog.date );
		}
		this.clear();
	},
	clear: function( logWindow ) {
		if (this.logs) {
			this.logs.clear();
			this.logs = null;
		}
	}
};
LogBuffer.clear = function() {
	if (LogBuffer.instance) {
		LogBuffer.instance.clear();
		LogBuffer.instance = null;
	}
}
Event.observe(window, 'unload', function(event) {LogBuffer.clear();}, false);
LogBuffer.instance = new LogBuffer();
/**
 * ログを出力するウィンドウを表示するクラス
 */
LogWindow = Class.create();
LogWindow.loadingWindow = true; 
LogWindow.prototype = {
	initialize: function( windowName ) {
		this._windowName = windowName
		if (!LogWindow.windowMap)
			LogWindow.windowMap = {};
		LogWindow.windowMap[windowName] = this;
		Log.windowRegistered( this );
	},
	
	open: function() {
		var firstTime = true;
		if (this._window) 
			firstTime =  false;
		this._window = window.open('', this._windowName, "resizable=yes,scrollbars=yes,top=0,left=0");
		if (firstTime) {
			this._window.document.clear();
			this._window.document.write("<head><title>" + this._windowName + "</title></head>\n");
		}
		return this._window;
	},
	
	close: function() {
		this._window.close();
	},

	write: function( msg, name,  date ){
		var w = this._window;
		if (!w)
			w =  this.open();
		if (w.closed)
			w.open();
		var doc = w.document;
		doc.write( "<br/>" );
		if (date)
			doc.write( this.formatDate( date ) );
		if (name)
			doc.write( " [" + name + "] ");
		doc.write( this.escape( msg ) );
		doc.write( "\n" );
		w.scrollBy(0, 1000);
	},

	escape: function( msg ) {
		msg = this._escapeTag( msg );
		msg = this._escapeBR( msg );
		return msg;
	},

	_escapeTag: function( msg ) {
		msg = msg.replace(/&/gm,"&amp;");
		msg = msg.replace(/</gm,"&lt;");
		msg = msg.replace(/>/gm, "&gt;");
		msg = msg.replace(/"/gm,"&quot;");
		return msg;
	},
	
	_escapeBR: function( msg ) {
		msg = msg.replace(/\n/gm,"<br/>");
		msg = msg.replace(/\t/gm,"    ");
		return msg;
	},
	
	formatDate: function( d ){
		return d.getYear()+ "/"+
			(d.getMonth() + 1)+ "/"+
			d.getDate()+ " "+
			d.getHours() + ":" +
			d.getMinutes() + ":" +
			d.getSeconds() + ":" +
			d.getMilliseconds();
	}
}
LogWindow.windowMap = null;
LogWindow.find = function( windowName ) {
	if (!windowName)
		return null;
	if (LogWindow.windowMap) {
		for(var key in LogWindow.windowMap) {
			if (key == windowName) {
				var logWindow = LogWindow.windowMap[key];
				if (logWindow) 
					return logWindow;
			}
		}
	}
	return null;
}
LogWindow.open = function( windowName ) {
	if (!windowName)
		windowName = "gloggerWindow";
	var logWindow =  this.find( windowName );
	if (!logWindow) {
		logWindow = new LogWindow(windowName);
		logWindow.open();
	}
	if (LogBuffer.instance) {
		LogBuffer.instance.flush( logWindow );
		LogBuffer.clear();
	}
}
LogWindow.getDefaultLogWindow = function() {
	if (!LogWindow.windowMap)
		return null;
	for(var key in LogWindow.windowMap) {
		if (key == windowName) {
			var logWindow = LogWindow.windowMap[key];
			if (logWindow) {
				return logWindow;
			}
		}
	}
	return null;
};
LogWindow.windowLoad = function(event) {
	LogWindow.loadingWindow = false; 
};
Event.observe(window, 'load', LogWindow.windowLoad, false);

LogWindow.windowUnoad = function(event) {
	LogWindow.windowMap = null;
};
Event.observe(window, 'unload', LogWindow.windowUnoad, false);


// instancesglogger = new Log("glogger");
