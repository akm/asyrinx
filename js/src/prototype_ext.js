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

if (window.getSelection) {
    document.getSelection = document.getSelection || function(){ return window.getSelection().toString() };
    window.clearSelection = window.clearSelection || function(){ 
        var selection = window.getSelection(); 
        selection.removeAllRanges();
    };
} else if (document.selection) {
    document.getSelection = document.getSelection || function(){ return document.selection.createRange().text; };
    window.getSelection = window.getSelection || function(){ return document.selection; };
    window.clearSelection = window.clearSelection || function(){ document.selection.clear(); };
} else {
    document.getSelection = document.getSelection || Prototype.emptyFunction;
    window.getSelection = window.getSelection || Prototype.emptyFunction;
    window.clearSelection = window.clearSelection || Prototype.emptyFunction;
}

if (!document.setSelection) {
    if (document.selection) {
        document.setSelection = function(value) {
            document.selection.createRange().text = value;
        }
    } else if (window.setSelection) {
        document.setSelection = function() {
            return window.setSelection.apply(window, arguments);
        }
    } else {
        document.setSelection = function(event, value) {
            var length = event.textLength;
            var start = event.selectionStart;
            var end = event.selectionEnd;
            if (end == 1 || end == 2) end = length;
            e.value = event.value.substring(0, start) + v + event.value.substr(end, length);
        }
    }
    
    
}


Object.extend(Object, {
    fill: function(target, properties) {
        for(var prop in properties) {
            if (!target[prop])
                target[prop] = properties[prop];
        }
        return target;
    }
});


EnumerableExt = {
  to_object: function(iterator) {
    var result = {};
    this.each(function(value, index) {
      var keyAndValue = iterator(value, index);
      if (keyAndValue) {
          var key = null, value = null;
          if (keyAndValue.constructor == Array) {
            key = keyAndValue[0], value = keyAndValue[1]; 
          } else {
            key = keyAndValue["key"], value = keyAndValue["value"]; 
          }
          result[key] = value;
      }
    });
    return result;
  }
}

Object.extend(Enumerable, EnumerableExt);

Object.extend(Array.prototype, EnumerableExt);
Object.extend(Array.prototype, {
	remove: function( value ) {
		var idx = this.indexOf( value );
		if (idx > -1)
			this.splice(idx, 1);
		return idx;
	},
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
	},
	
	toNumeric: function() {
		return this.replace(/[^\d\.\-]/g,"");
	}
} );

Object.extend( Number.prototype, {
	//toCommaStr
	commify: function() {
		var parts = this.toString().split(".");
		var intPart = parts[0];
		var s = "";
		var c = 0;
		for(var i = intPart.length -1; i > -1; i--) {
			s = intPart.charAt(i) + s;
			c++;
			if (c > 2) {
				if (i > ((this < 0)? 1 : 0))
					s = "," + s;
				c = 0;
			}
		}
		parts[0] = s;
		return parts.join(".");
	}
} );

Object.extend(Element, {
	getAncestorByTagName: function( node, tagName ) {
		for(var current = node; current != null; current = current.parentNode) {
			if (current.tagName == tagName)
				return current;
		}
		return null;
	},
	
	getAncestorByClassName: function( node, className ) {
		for(var current = node; current != null; current = current.parentNode) {
			try{
				if (Element.hasClassName(current, className))
					return current;
			} catch(e) { 
			}
		}
		return null;
	}
});


Object.extend(Event, {
	KEY_CANCEL		:   3,
	KEY_HELP		:   6,
	KEY_BACK_SPACE	:   8,
	KEY_TAB			:   9,
	KEY_CLEAR		:  12,
	KEY_RETURN		:  13,
	KEY_ENTER		:  14,
	KEY_SHIFT		:  16,
	KEY_CONTROL		:  17,
	KEY_ALT			:  18,
	KEY_PAUSE		:  19,
	KEY_CAPS_LOCK	:  20,
	KEY_ESC        	:  27,
	KEY_SPACE		:  32,
	KEY_PAGE_UP		:  33,
	KEY_PAGE_DOWN	:  34,
	KEY_END			:  35,
	KEY_HOME		:  36,
	KEY_LEFT		:  37,
	KEY_UP			:  38,
	KEY_RIGHT		:  39,
	KEY_DOWN		:  40,
	KEY_PRINTSCREEN	:  44,
	KEY_INSERT		:  45,
	KEY_DELETE		:  46,
	KEY_NUM_0		:  48,
	KEY_NUM_1		:  49,
	KEY_NUM_2		:  50,
	KEY_NUM_3		:  51,
	KEY_NUM_4		:  52,
	KEY_NUM_5		:  53,
	KEY_NUM_6		:  54,
	KEY_NUM_7		:  55,
	KEY_NUM_8		:  56,
	KEY_NUM_9		:  57,
	KEY_COLON		:  59,
	//KEY_EQUALS	    :  60,
	KEY_SEMICOLON	:  61,
	KEY_A			:  65,
	KEY_B			:  66,
	KEY_C			:  67,
	KEY_D			:  68,
	KEY_E			:  69,
	KEY_F			:  70,
	KEY_G			:  71,
	KEY_H			:  72,
	KEY_I			:  73,
	KEY_J			:  74,
	KEY_K			:  75,
	KEY_L			:  76,
	KEY_M			:  77,
	KEY_N			:  78,
	KEY_O			:  79,
	KEY_P			:  80,
	KEY_Q			:  81,
	KEY_R			:  82,
	KEY_S			:  83,
	KEY_T			:  84,
	KEY_U			:  85,
	KEY_V			:  86,
	KEY_W			:  87,
	KEY_X			:  88,
	KEY_Y			:  89,
	KEY_Z			:  90,
	KEY_CONTEXT_MENU:  93,
	KEY_NUMPAD0		:  96,
	KEY_NUMPAD1		:  97,
	KEY_NUMPAD2		:  98,
	KEY_NUMPAD3		:  99,
	KEY_NUMPAD4		: 100,
	KEY_NUMPAD5		: 101,
	KEY_NUMPAD6		: 102,
	KEY_NUMPAD7		: 103,
	KEY_NUMPAD8		: 104,
	KEY_NUMPAD9		: 105,
	KEY_MULTIPLY	: 106,
	KEY_ADD			: 107,
	KEY_SEPARATOR	: 108,
	KEY_SUBTRACT	: 109,
	KEY_DECIMAL		: 110,
	KEY_DIVIDE		: 111,
	KEY_F1			: 112,
	KEY_F2			: 113,
	KEY_F3			: 114,
	KEY_F4			: 115,
	KEY_F5			: 116,
	KEY_F6			: 117,
	KEY_F7			: 118,
	KEY_F8			: 119,
	KEY_F9			: 120,
	KEY_F10			: 121,
	KEY_F11			: 122,
	KEY_F12			: 123,
	KEY_F13			: 124,
	KEY_F14			: 125,
	KEY_F15			: 126,
	KEY_F16			: 127,
	KEY_F17			: 128,
	KEY_F18			: 129,
	KEY_F19			: 130,
	KEY_F20			: 131,
	KEY_F21			: 132,
	KEY_F22			: 133,
	KEY_F23			: 134,
	KEY_F24			: 135,
	KEY_NUM_LOCK	: 144,
	KEY_SCROLL_LOCK	: 145,
	KEY_COLON2		: 186,
	KEY_SEMICOLON2	: 187,
	KEY_COMMA		: 188,
	KEY_HYPHEN		: 189,
	KEY_PERIOD		: 190,
	KEY_SLASH		: 191,
	KEY_BACK_QUOTE	: 192,
	KEY_OPEN_BRACKET: 219,
	KEY_BACK_SLASH1	: 220,
	KEY_CLOSE_BRACKET: 221,
	KEY_QUOTE		: 222,
	KEY_META		: 224,
	KEY_BACK_SLASH2	: 226,
	KEY_IME_ON		: 243,
	KEY_IME_OFF 	: 244
});
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

Object.extend(Form.Element, {
    setValue: function(element, value) {
        element = $(element);
        var method = element.tagName.toLowerCase();
        Form.Element.Deserializers[method](element, value);
    },
    getSelectOptions: function(select) {
        result = [];
		for(var i = 0; i < select.options.length; i++) {
			var option = select.options[i];
			result.push({
		      "value": option.value,
		      "text": (option.innerText || option.textContent || "").strip()
			});
		}
		return result;
    }
});
Form.Element.Deserializers = {
	input: function(element, value) {
		switch (element.type.toLowerCase()) {
			case 'submit':
			case 'hidden':
			case 'password':
			case 'text':
				return Form.Element.Deserializers.textarea(element, value);
			case 'checkbox':
			case 'radio':
				return Form.Element.Deserializers.inputSelector(element, value);
		}
		return false;
	},
	inputSelector: function(element, value) {
        if (!value)
		  element.checked = false;
		element.checked = (element.value == value);
	},
	textarea: function(element, value) {
		element.value = value;
	},
	select: function(element, value) {
		Form.Element.Deserializers[element.type == 'select-one' ?
			'selectOne' : 'selectMany'](element, value);
	},
	selectOne: function(element, value) {
		for(var i = 0; i < element.options.length; i++) {
			var option = element.options[i];
			if (option.value == value)
				option.selected = true;
		}
	},
	selectMany: function(element, value) {
		for(var i = 0; i < element.options.length; i++) {
			var option = element.options[i];
			if (value.contains(option.value))
				option.selected = true;
		}
	}
}

if (!HTMLElement) HTMLElement = {};

Object.extend(HTMLElement, {
    getValue: function(element) {
        if (!element || !element.tagName)
            throw new Error("no element to getValue");
        if (/input|textarea|select/.test(element.tagName.toLowerCase())) {
            return Form.Element.getValue(element);
        } else {
            element = $(element);
            return element.innerText || element.textContent || null;
        }
    },
    setValue: function(element, value) {
        if (!element || !element.tagName)
            throw new Error("no element to setValue");
        if (/input|textarea|select/.test(element.tagName.toLowerCase())) {
            return Form.Element.setValue(element, value);
        } else {
            element.innerHTML = value;
        }
    }
});

HTMLElement.KeyHandler = Class.create();
HTMLElement.KeyHandler.DefaultOptions = {
    activateSoon: true
}
HTMLElement.KeyHandler.prototype = {
    initialize: function(handlingFields, actions, options) {
		this.handlingFields = (!handlingFields) ? [] : (handlingFields.constructor == Array) ? handlingFields : [ handlingFields ];
		this.handlingFields = this.handlingFields.collect( function(field){return $(field);} );
        this.actions = actions;
        this.options = Object.fill(options || {}, HTMLElement.KeyHandler.DefaultOptions);
        if (this.options.activateSoon)
            this.activate();
    },
    activate: function() {
        this.keyDownHandler = this.keyDown.bindAsEventListener(this);
        for(var i = 0; i < this.handlingFields.length; i++)
            Event.observe(this.handlingFields[i], "keydown", this.keyDownHandler, true);
    },
    deactivate: function() {
        if (!this.keyDownHandler)
            return;
        for(var i = 0; i < this.handlingFields.length; i++)
            Event.stopObserving(this.handlingFields[i], "keydown", this.keyDownHandler, true);
    },
    keyDown: function(event) {
        var keyCode = event.keyCode || event.charCode || event.which;
        for(var i = 0; i < this.actions.length; i++) {
            var action = this.actions[i];
            if (keyCode == action.key) {
                action.method(event);
                if (action.stopEvent)
                    Event.stop(event);
                break;
            }
        }
    }
}



Rotation = Class.create();
Rotation.Methods = {
    initialize: function(values) {
        this.index = 0;
        this.values = values;
    },
    first: function() {
        this.index = 0;
        return this.value();
    },
    value: function(index) {
        index = (index == null || index == undefined) ? this.index : index;
        return this.values[index];
    },
    testNext: function() {
        var index = this.nextIndex();
        var result = this.value(index);
        return result;
    },
    next: function() {
        this.index = this.nextIndex();
        return this.value();
    },
    nextIndex: function() {
        var result = this.index + 1;
        return (result < this.values.length) ? (result) : 0;
    },
    succ: function() {
        return this.next();
    }
};
Object.extend(Rotation.prototype, Rotation.Methods); 

EvenOdd = Class.create();
Object.extend(EvenOdd.prototype, Rotation.Methods);
Object.extend(EvenOdd.prototype, {
    initialize: function(firstValue, secondValue) {
        Rotation.Methods.initialize.apply(this, [
            [firstValue || "even", secondValue || "odd"]
        ]);
        this.reverse = this.testNext;
    },
    applyClassName: function(elements) {
        this.first();
        for(var i = 0; i < elements.length; i++) {
            var element = elements[i];
			if (!Element.hasClassName(element, this.value())) {
		        Element.removeClassName(element, this.reverse());
		        Element.addClassName(element, this.value());
			}
			this.succ();
        }
    }
} );
