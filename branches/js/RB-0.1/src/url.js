/**
 * url.js
 * 
 * require prototype.js
 *
 * @copyright T.Akima
 * @license LGPL
 */

String.FilePath = Class.create();
String.FilePath.Methods = {
	initialize: function( path ) {
		if ( arguments.length == 1 ) {
			//バックスラッシュが使われることも考慮
			this.delimeter = (path.indexOf("\\") > -1) ? "\\" : "/"; 
			this.parts = path.split(this.delimeter);
		} else {
			this.parts = $A(arguments[0]);
			this.delimeter = arguments[1] || "/";
		}
	},
	moveUp: function() {
		this.parts.pop(); //最後のディレクトリ名を除く
	},
	_moveDown: function( subDir ) {
		this.parts.push( subDir );
	},
	moveTo: function( subDir ) {
		if (!subDir)
			return;
		var dirParts = subDir.split("/");
		for(var i = 0; i < dirParts.length; i++) {
			var part = dirParts[i];
			if (part == ".") {
				//do nothing
			} else if (part == "..") {
				this.moveUp();
			} else {
				this._moveDown( part );
			}
		}
	},
	clone: function(){return new String.FilePath(this.parts,this.delimeter); },
	toString: function(){return this.format();},
	format: function(){return this.parts.join( this.delimeter );},
	concat: function( path ) {
		var result = this.clone();
		result.moveTo( path );
		return result;
	}
};
Object.extend( String.FilePath.prototype, String.FilePath.Methods);

String.URL = Class.create();
Object.extend(String.URL.prototype, String.FilePath.Methods);
Object.extend(String.URL.prototype, {
	initialize: function(url) {
		if (arguments.length == 1) {
			var schemeIndex = url.indexOf( String.URL.SCHEME_DELIMETER );
			var baseUri = "";
			if (schemeIndex > -1) {
				this.scheme = url.substring( 0, schemeIndex );
				baseUri = url.substring( schemeIndex + String.URL.SCHEME_DELIMETER.length );
			} else {
				this.scheme = "";
				baseUri = url;
			}
			String.FilePath.Methods.initialize.apply(this, [baseUri]);
		} else {
			var args = $A(arguments);
			this.scheme = args.shift(); //arguments[0]
			String.FilePath.Methods.initialize.apply(this, args);
		}
	},
	
	clone: function() {
		return new String.URL(this.scheme,this.parts,this.delimeter);
	},
	
	format: function() {
		var result = "";
		if (this.scheme)
			result += (this.scheme + String.URL.SCHEME_DELIMETER);
		result += String.FilePath.Methods.format.apply(this, []);
		return result;
	},
	
	concat: function( path ) {
		if (!path)
			return this.clone();
		if (path.constructor == String.URL)
			return path;
		if (String.URL.isAbsoluteUrl(path) )
			return new String.URL(path);
		var result = this.clone();
		result.moveTo( path );
		return result;
	}
} );
Object.extend( String.URL, {
	SCHEME_DELIMETER: "://",
	isAbsoluteUrl: function( str ) {
		return (str.indexOf( String.URL.SCHEME_DELIMETER ) > -1);
	},
	toAbsoluteUrl: function(str, baseUrl) {
		if (String.URL.isAbsoluteUrl(str) )
			return new String.URL(str);
	    if (str.indexOf("/") == 0) {
	       baseUrl = new String.URL( document.URL );
	       for(; baseUrl.parts.length > 1;)  {
	           baseUrl.moveUp();
	       }
	       str = "." + str;
	    } else {
			if (!baseUrl)
				baseUrl = document.URL;
			if (baseUrl.constructor == String)
				baseUrl = new String.URL(baseUrl);
	    }
		return baseUrl.concat(str);
	},
	parse: function(str) {
		return String.URL.toAbsoluteUrl(str);
	}
} );
