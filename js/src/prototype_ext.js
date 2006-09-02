/**
 * prototype_ext.js
 * 
 * require prototype.js only
 *
 * @copyright T.Akima
 * @license LGPL
 */
document.getFirstElementByClassName = function(className, element) {
	var elements = document.getElementsByClassName(className, element);
	return (!elements || elements.length < 1) ? null : elements[0];
}

Object.extend(Array.prototype, {
    contains: function(value) {
        return (this.indexOf(value) > -1);
    },
    containsAllOf: function() {
        var args = $A(arguments).flatten();
        for(var i = 0; i < args.length; i++) {
            if (!this.contains(args[i]))
                return false;
        }
        return true;
    },
    containsOneOf: function() {
        var args = $A(arguments).flatten();
        for(var i = 0; i < args.length; i++) {
            if (this.contains(args[i]))
                return true;
        }
        return false;
    },
    intersect: function() {
        var result = [];
        for(var i = 0; i < this.length; i++) {
            var val = this[i];
            var passCount = 0;
            for(var j = 0; j < arguments.length; j++){
                if (arguments[j].contains(val))
                    passCount++;
                else
                    break;
            }
            if (passCount == arguments.length)
                result.push(val);
        }
        return result;
    }
});
Object.extend(String, {
	PluralizePatterns: [
		{singular: "y", plural: "ies"},
		{singular: "f", plural: "ves"},
		{singular: "fe", plural: "ves"},
		{singular: "ss", plural: "sses"},
		{singular: "s", plural: "ses"},
		{singular: "ch", plural: "ches"},
		{singular: "sh", plural: "shes"},
		{singular: "x", plural: "xes"},
		{singular: "o", plural: "oes"},
		{singular: null, plural: "s"}
	]
} );
Object.extend(String.prototype, {
	startWith: function( str ) {
		if (!str)
			return false;
		var idx = this.indexOf(str);
		return (idx < 0) ? false : (idx == 0);
	},
	
	endWith: function( str ) {
		if (!str)
			return false;
		var idx = this.lastIndexOf(str);
		return (idx < 0) ? false : (idx == (this.length - str.length));
	},
	
	replaceEndIf: function(patterns, key, replace) {
		for(var i = 0; i < patterns.length; i++) {
			var p = patterns[i];
			if (p[key]) {
				if (this.endWith(p[key]))
					return this.substring(0, this.length - p[key].length) + (p[replace] || "");
			} else {
				return this + p[replace];
			}
		}
		return this;
	},
	
	singularize: function() {
		return this.replaceEndIf(String.PluralizePatterns, "plural", "singular");
	},
	pluralize: function() {
		return this.replaceEndIf(String.PluralizePatterns, "singular", "plural");
	}
} );

Object.extend(Event, {
	observeDelay: function(element, name, observer, useCapture, options) {
		options = Object.extend( $H({"delay":500}), options || {} );
		var actual_observer = function(event) {
			var _event = Object.extend({}, event);
			if (options["before_setTimeout"])
				options["before_setTimeout"](event);
			setTimeout( function(){ observer(_event)}, options.delay);
			if (options["after_setTimeout"])
				options["after_setTimeout"](event);
		};
		Event.observe(element, name, actual_observer, useCapture);
	}
});
