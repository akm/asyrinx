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
    },
    extendProperties: function(destination, source) {
        for (var property in source) {
            var value = source[property];
            if (value && value.constructor == Function)
                continue;
            destination[property] = value;
        }
        return destination;
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
	clone: function() {
		return Array.apply(null, this);
		/*
		var result = new Array(this.length);
		for(var i = 0; i < this.length; i++)
			result[i] = this[i];
		return result;
		*/
	},
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
	   //DOM操作などでよく使いそうな不規則名詞を登録しておく
		{singular: "child", plural: "children"},
		{singular: "leaf", plural: "leaves"},
		{singular: "y", plural: "ies"},
		{singular: "fe", plural: "ves"},
		//{singular: "f", plural: "ves"},
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
	},
	abbreviate: function(size,mark){
	   mark = mark||"...";
	   if (this.length<=size)
	       return String(this);
	   if (size<1) return "";
	   var actualSize = size - mark.length;
	   if (actualSize<1) return mark;
	   return (this.length<=actualSize)?this:(this.substring(0,actualSize)+mark);
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

Object.Predicate = {
    acceptAll: function(){return true;},
    denyAll: function(){return false;},
    not: function(predicate) {
        return function(){return !(predicate.apply(null, arguments)) };
    },
    oneOf: function(value, returnIfContains){
        value = (value.contains)?value:[value];
        return function(){
            for(var i=0;i<argument.length;i++)
                if(value.contains(arguments[i]))
                    return returnIfContains;
            return !returnIfContains;
        };
    },
    include: function(value){return this.oneOf(value,true);},
    exclude: function(value){return this.oneOf(value,false);},
    
    _join: function(joinType, predicates) {
        var predicates = $A(predicates);
        var __match_value = (joinType == "or") ? true : false;
        return function() {
            for(var i=0;i<predicates.length;i++) {
                if ((predicates[i].apply(null,arguments)?true:false) == __match_value)
                    return __match_value;
            }
            return !__match_value;
        }
    },
    and: function(){return Object.Predicate._join("and",$(arguments));},
    or: function(){return Object.Predicate._join("or",$(arguments));}
};


if (!window["Node"]) Node = {};

Object.extend(Node, {
    ELEMENT_NODE:1,
    ATTRIBUTE_NODE:2,
    TEXT_NODE:3,
    CDATA_SECTION_NODE:4,
    ENTITY_REFERENCE_NODE:5,
    ENTITY_NODE:6,
    PROCESSING_INSTRUCTION_NODE:7,
    COMMENT_NODE:8,
    DOCUMENT_NODE:9,
    DOCUMENT_TYPE_NODE:10,
    DOCUMENT_FRAGMENT_NODE:11,
    NOTATION_NODE:12,
    
    NodeTypeNames:{
        1:"ELEMENT_NODE",
        2:"ATTRIBUTE_NODE",
        3:"TEXT_NODE",
        4:"CDATA_SECTION_NODE",
        5:"ENTITY_REFERENCE_NODE",
        6:"ENTITY_NODE",
        7:"PROCESSING_INSTRUCTION_NODE",
        8:"COMMENT_NODE",
        9:"DOCUMENT_NODE",
        10:"DOCUMENT_TYPE_NODE",
        11:"DOCUMENT_FRAGMENT_NODE",
        12:"NOTATION_NODE"
    },
    nodeTypeName: function(nodeType){return Node.NodeTypeNames[nodeType]},
    identify_str: function(element){
        if(!element)
            return "null element";
        return (element.nodeType==Node.ELEMENT_NODE)?
            (element.tagName + 
                ((element.id)?("["+element.id+"]"):"") + 
                ((element.className)?("(" + element.className + ")"):"")):
            (element.nodeType==Node.TEXT_NODE)?
                ("TEXT_NODE:"+element.data.strip().abbreviate(20)):
                Node.nodeTypeName(element.nodeType);
    }
})

Object.extend(Element, {
    identify_str: Node.identify_str
});

Element.Finder = {
    firstNode: function(node, iterate, predicate, options){
        if(!node) return null;
        predicate = predicate||Element.Predicate.exclude(node);
		for(var current=node;current!=null;current=iterate(current)){
			if(predicate(current)) 
		        return current;
		}
		return null;
    },
    allNodes: function(node, iterate, predicate, options){
		var result = [];
        if(!node)
            return result;
        predicate = predicate||Object.Predicate.acceptAll;
		for(var current=node;current!=null;current=iterate(current)){
			if(predicate(current))
		        result.push(current);
		}
		return result;
    },
    firstElement: function(node, iterate, predicate, options){
        predicate = predicate||Element.Predicate.exclude(node);
        return this.firstNode(node,iterate,
            Object.Predicate.and(Element.Predicate.nodeType(Node.ELEMENT_NODE),predicate),options);
    },
    allElements: function(node, iterate, predicate, options){
        predicate = predicate||Object.Predicate.acceptAll;
        return this.allNodes(node,iterate,
            Object.Predicate.and(Element.Predicate.nodeType(),predicate),options);
    }
};
Element.Finder.first = Element.Finder.firstElement;
Element.Finder.all = Element.Finder.allElements;

Element.Predicate = {
    oneOf: function(value, returnIfContains){
        return function(node){
            return (value == node)?returnIfContains:!returnIfContains;
        };
    },
    include: function(value){return this.oneOf(value,true);},
    exclude: function(value){return this.oneOf(value,false);},
        
    
    nodeType: function(nodeTypes){
        nodeTypes=(!nodeTypes)?[1]:(nodeTypes.contains)?nodeTypes:[nodeTypes];
        return function(node){return nodeTypes.contains(node.nodeType);};
    },
    
    tagName: function(tagName) {
        tagName = tagName.toUpperCase();
        return function(node){return (node.tagName)&&(node.tagName.toUpperCase()==tagName);};
    },
    tagNames: function(tagNames) {
        tagNames = (tagNames.constructor == Array) ? tagNames : [tagNames];
        tagNames = tagNames.collect(function(tagName){return tagName.toUpperCase();});
        return function(node){return (node.tagName)&&(tagNames.indexOf(node.tagName.toUpperCase())>-1);};
    },
    className: function(className) {
        return function(node){try{return Element.hasClassName(node,className);}catch(ex){return false;}};
    },
    hasChild: function(node){return(node.childNodes&&node.childNodes.length>0);},
    isElementNode: function(node){return node.nodeType==1;}
    
};


Element.Iteration = {
    parentNode: function(node){return node.parentNode;},
    firstChildNode: function(node){return node.firstChild;},
    lastChildNode: function(node){return node.lastChild;},
    nextSiblingNode: function(node){return node.nextSibling;},
    previousSiblingNode: function(node){return node.previousSibling;},
    
    firstChildElement: function(node){
        return (!node)?null:Element.Finder.firstElement(node.firstChild,Element.Iteration.nextSiblingNode,Object.Predicate.acceptAll);
    },
    lastChildElement: function(node){
        return (!node)?null:Element.Finder.firstElement(node.lastChild,Element.Iteration.previousSiblingNode,Object.Predicate.acceptAll);
    },
    nextSiblingElement: function(node){
        return (!node)?null:Element.Finder.firstElement(node.nextSibling,Element.Iteration.nextSiblingNode,Object.Predicate.acceptAll);
    },
    previousSiblingElement: function(node){
        return (!node)?null:Element.Finder.firstElement(node.previousSibling,Element.Iteration.previousSiblingNode,Object.Predicate.acceptAll);
    },
    
    nextNode: function(node) {
        if (node.firstChild)
            return node.firstChild;
        var ancestorWhoHasNextSibling = Element.Finder.first(node, 
            Element.Iteration.parentNode, Element.Iteration.nextSibling);
        return (ancestorWhoHasNextSibling) ? ancestorWhoHasNextSibling.nextSibling : null;
    },
    previousNode: function(node) {
        if (!node.previousSibling)
            return node.parentNode;
        return Element.Finder.first(
            node.previousSibling, 
            Element.Iteration.lastChild,
            Object.Predicate.not(Element.Iteration.lastChild));
    },
    
    shiftArray: function(array) {
        array = $A(array);
        return function(node){return array.shift();};
    },
    popArray: function(array) {
        array = $A(array);
        return function(node){return array.pop();};
    }
}
//別名
Element.Iteration.firstChild = Element.Iteration.firstChildElement;
Element.Iteration.lastChild = Element.Iteration.lastChildElement;
Element.Iteration.nextSibling = Element.Iteration.nextSiblingElement;
Element.Iteration.previousSibling = Element.Iteration.previousSiblingElement;

Element.Iteration.ancestor = Element.Iteration.parentNode;
Element.Iteration.prevSibling = Element.Iteration.previousSibling;
Element.Iteration.prevNode = Element.Iteration.previousNode;

//IterationはPredicateとしても使える・・・・でも、敢えてコピーするほどのものでもないか。
//Object.fill(Element.Predicate, Element.Iteration);


Object.extend(Element, {
    findNode: function(node, iteration, predicate){
		Element.Finder.first(node, iteration, predicate);
    },
    findDescendant: function(node, predicate) {
		return this.findNode(node, 
		    function(current){return current.firstChild || current.nextSibling;}, predicate);
    },
    findNextNode: function(node, predicate) {
		return this.findNode(node, Element.Iteration.nextNode, predicate);
    },
    findPreviousNode: function(node, predicate) {
		return this.findNode(node, Element.Iteration.previousNode, predicate);
    },
	findNextSibling: function(node, predicate) {
		return this.findNode(node, Element.Iteration.nextSibling, predicate);
	},
	findPreviousSibling: function(node, predicate) {
		return this.findNode(node, Element.Iteration.previousSibling, predicate);
	},
	
	findAncestorByTagName: function(node,tagName) {
	   return Element.Finder.first(node, 
	       Element.Iteration.ancestor, 
	       Element.Predicate.tagName(tagName));
	},
	findAncestorByClassName: function(node,className) {
	   return Element.Finder.first(node, 
	       Element.Iteration.ancestor, 
	       Element.Predicate.className(className));
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
		options = Object.fill( options || {}, {"delay":500} );
		var actual_observer = function(event) {
			var _event = Object.extend({}, event);
			if (options["before_setTimeout"])
				options["before_setTimeout"](event);
			setTimeout( function(){ observer(_event)}, options.delay);
			if (options["after_setTimeout"])
				options["after_setTimeout"](event);
		};
		Event.observe(element, name, actual_observer, useCapture);
	},
	
	getKeyCode: function(event) {
	   return event.keyCode || event.charCode || event.which;
	}
});

Event.KeyHandler = Class.create();
Event.KeyHandler.DefaultOptions = {
    activateSoon: true,
    events: ["keydown", "keyup"],
    handleOnMatch: true,
    acceptableInterval: 500
};
Event.KeyHandler.prototype = {
    initialize: function(handlingFields, actions, options) {
		this.handlingFields = (!handlingFields) ? [] : (handlingFields.constructor == Array) ? handlingFields : [ handlingFields ];
		this.handlingFields = this.handlingFields.collect( function(field){return $(field);} );
        this.actions = actions;
        this.options = Object.fill(options || {}, Event.KeyHandler.DefaultOptions);
        if (this.options.activateSoon)
            this.activate();
    },
    activate: function() {
        if (!this.handler)
            this.handler = this.handle.bindAsEventListener(this);
        for(var i = 0; i < this.handlingFields.length; i++) {
            var field = this.handlingFields[i];
            for(var j = 0; j < this.options.events.length; j++) {
                var eventName = this.options.events[j];
                Event.observe(field, eventName, this.handler, true);
            }
        }
    },
    deactivate: function() {
        if (!this.handler)
            return;
        for(var i = 0; i < this.handlingFields.length; i++) {
            var field = this.handlingFields[i];
            for(var i = 0; i < this.options.events.length; i++) {
                var eventName = this.options.events[i];
                Event.stopObserving(field, eventName, this.handler, true);
            }
        }
    },
    matchFunctionKey: function(action, actionKeyName, event, eventKeyName) {
        return !((action[actionKeyName] == false && event[eventKeyName]) || 
            (action[actionKeyName] == true && !event[eventKeyName]));
    },
    matchAction: function(action, event, keyCode) {
        return (keyCode == action.key) &&
               this.matchFunctionKey(action, "alt", event, "altKey") &&
               this.matchFunctionKey(action, "ctrl", event, "ctrlKey") &&
               this.matchFunctionKey(action, "shift", event, "shiftKey")
    },
    isHandlingAction: function(action, event, keyCode) {
        var result = (action.match && action.match(action, event, keyCode, this)) ||
            this.matchAction(action, event, keyCode);
        return (this.options.handleOnMatch) ? result : !result;
    },
    handle: function(event) {
        var keyCode = Event.getKeyCode(event);
        for(var i = 0; i < this.actions.length; i++) {
            var action = this.actions[i];
            if (this.isHandlingAction(action, event, keyCode)) {
                if (action.event.indexOf(event.type) > -1) {
                    action.method(event);
                }
                if (action.stopEvent == undefined || action.stopEvent == null || action.stopEvent == true)
                    Event.stop(event);
                break;
            }
        }
    }
}

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
    },
    
    scrollIfInvisible: function(element, scrollable) {
        this.scrollYIfInvisible(element, scrollable);
        this.scrollXIfInvisible(element, scrollable);
    },
    scrollXIfInvisible: function(element, scrollable) {
        scrollable = (scrollable) ? scrollable : (navigator.appVersion.indexOf("MSIE") < 0) ? window : document.documentElement;
        if (scrollable == window) {
            Element._scrollIfInvisible(element, scrollable, 
                "x", "offsetLeft", "offsetWidth", "scrollX", "innerWidth");
        } else {
            Element._scrollIfInvisible(element, scrollable, 
                "x", "offsetLeft", "offsetWidth", "scrollLeft", "clientWidth");
        }
    },
    scrollYIfInvisible: function(element, scrollable) {
        scrollable = (scrollable) ? scrollable : (navigator.appVersion.indexOf("MSIE") < 0) ? window : document.documentElement;
        if (scrollable == window) {
            Element._scrollIfInvisible(element, scrollable, 
                "y", "offsetTop", "offsetHeight", "scrollY", "innerHeight");
        } else  {
            Element._scrollIfInvisible(element, scrollable, 
                "y", "offsetTop", "offsetHeight", "scrollTop", "clientHeight");
        }
    },
    _scrollIfInvisible: function(element, scrollable, elementPos, elementOffsetPos, elementOffsetSize, scrollableProp, scrollableClientSize) {
        element = $(element);
        scrollable = $(scrollable) || window;
        var pos = element[elementPos] ? element[elementPos] : element[elementOffsetPos];
        if (scrollable == window) {
            var diff = null;
            if (scrollable[scrollableProp] < pos - scrollable[scrollableClientSize] + element[elementOffsetSize])
                diff = pos - scrollable[scrollableClientSize] + element[elementOffsetSize] - scrollable[scrollableProp];
            else if (scrollable[scrollableProp] > pos )
                diff = scrollable[scrollableProp] - pos;
            if (diff == null)
                return;
            if (elementPos == "x")
                scrollable.scrollBy(diff, 0)
            else
                scrollable.scrollBy(0, diff);
        } else {
            if (scrollable[scrollableProp] < pos - scrollable[scrollableClientSize] + element[elementOffsetSize]) {
                scrollable[scrollableProp] = pos - scrollable[scrollableClientSize] + element[elementOffsetSize];
            } else if (scrollable[scrollableProp] > pos ) {
                scrollable[scrollableProp] = pos;
            }
        }
    }
    
});


if (!window["HTMLInputElement"]) HTMLInputElement = {};

HTMLInputElement.PullDown = Class.create();
HTMLInputElement.PullDown.DefaultOptions = {
    hideTimeout: 500,
    hideSoonOnKeyEvent: true,
    hideOnPaneFocus: false
};
HTMLInputElement.PullDown.DefaultPaneStyle = {
	"cursor": "default",
	"border": "1px solid black",
	"backgroundColor": "white",
	"width": "500px",
	"max-height": "200px",
	"overflow": "scroll"
};
HTMLInputElement.PullDown.DefaultPaneOptions = {
};
HTMLInputElement.PullDown.Methods = {
    initialize: function(options) {
		this.options = Object.fill( options || {}, HTMLInputElement.PullDown.DefaultOptions );
		this.paneOptions = Object.fill( this.options["pane"] || {}, HTMLInputElement.PullDown.DefaultPaneOptions );
		this.paneStyle = Object.fill( this.paneOptions["style"] || {}, HTMLInputElement.PullDown.DefaultPaneStyle );
        this.visible = false;
    },
	createPane: function() {
		var result = document.createElement("DIV");
		result.style.position = "absolute";
		result.style.display = "none";
		if (this.paneOptions.style)
		  delete this.paneOptions.style;
		Object.extendProperties(result, this.paneOptions);
		Element.setStyle(result, this.paneStyle);
		document.body.appendChild(result);
		return result;
	},
    toggle: function(event) {
        if (this.visible)
            this.hide(event);
        else
            this.show(event);
    },
    show: function(event) {
        if (!this.pane) {
            this.pane = this.createPane();
            this.shim = new HTMLIFrameElement.Shim(this.pane);
            Event.observe(this.pane, "focus", this.paneFocus.bindAsEventListener(this), false);
            Event.observe(this.pane, "blur", this.paneBlur.bindAsEventListener(this), false);
        }
		this.updatePaneRect(event);
        Element.show(this.pane);
        this.shim.enableShim();
        this.visible = true;
        try{
            HTMLElement.scrollIfInvisible(this.pane);
        }catch(ex){
        }
    },
    paneFocus: function(event) {
        if (!this.options.hideOnPaneFocus)
            this.waitHiding = false;
    },
    paneBlur: function(event) {
        this.hide();
    },
    hide: function(event) {
        this.waitHiding = true;
        if (this.options.hideTimeout < 1) {
            this._hide(event);
        } else if (this.options.hideSoonOnKeyEvent && (event && event.type && event.type.indexOf("key") > -1)) {
            this._hide(event);
        } else {
            var _event = Object.extend({}, event);
            setTimeout(this._hide.bind(this, _event), this.options.hideTimeout);
        }
    },
    _hide: function(event) {
        if (!this.waitHiding)
            return;
        if (!this.pane)
            return;
        Element.hide(this.pane);
        this.shim.disableShim();
        this.visible = false;
        this.waitHiding = false;
    },
    updatePaneRect: function(event) {
        var field = Event.element(event);
		var fieldPosition = Position.positionedOffset(field);
        this.pane.style.top = (fieldPosition[1] + field.offsetHeight)  + "px";
		this.pane.style.left = (fieldPosition[0]) + "px";
    }
};
Object.extend(HTMLInputElement.PullDown.prototype, HTMLInputElement.PullDown.Methods);


if (!window["HTMLIFrameElement"]) HTMLIFrameElement = {};
HTMLIFrameElement.Shim = Class.create();
HTMLIFrameElement.Shim.DefaultOptions = {
	"scrolling": "no",
	"frameborder": "1"
};
HTMLIFrameElement.Shim.DefaultStyle = {
	"position": "absolute",
	"top": "0px",
	"left": "0px",
	"display": "none",
	"z-index": 10
};
HTMLIFrameElement.Shim.prototype = {
    initialize: function(pane, options, style) {
        this.pane = pane;
		if (navigator.appVersion.indexOf("MSIE") < 0)
		    return;
		if (navigator.appVersion.indexOf("MSIE 7") > -1)
		    return;
		this.frame = document.createElement("IFRAME");
		document.body.appendChild(this.frame);
		Object.extend(this.frame, Object.fill(options || {}, HTMLIFrameElement.Shim.DefaultOptions));
		Element.setStyle(this.frame, Object.fill(style || {}, HTMLIFrameElement.Shim.DefaultStyle));
		this.pane.style.zIndex = this.frame.style.zIndex + 1;
		Event.observe(this.pane, "move", this.paneMoved.bindAsEventListener(this), true);
		Event.observe(this.pane, "resize", this.paneResized.bindAsEventListener(this), true);
    },
	fit: function() {
	    if (!this.frame)
	       return;
		this.frame.style.width = this.pane.offsetWidth + "px";
		this.frame.style.height = this.pane.offsetHeight + "px";
		this.frame.style.top = this.pane.style.top;
		this.frame.style.left = this.pane.style.left;
		this.frame.style.zIndex = this.pane.style.zIndex - 1;
		this.frame.style.position = "absolute";
	},
	enableShim: function() {
		this.fit();
	    if (this.frame)
    		Element.show(this.frame);
	},
	disableShim: function() {
	    if (this.frame)
    		Element.hide(this.frame);
	},
	paneResized: function( e ) {
		this.fit();
	},
	paneMoved: function( e ) {
		this.fit();
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
