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

Function.prototype.bindWithArgsAsEventListener = function(object) {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
        var _args = args.clone();
        _args.unshift(event || window.event);
        return __method.apply(object, _args);
    }
};

//see http://nanto.asablo.jp/blog/2005/10/24/118564
//by nanto_vi
Function.prototype.applyNew = function(args){
    var constructor = function(){};
    constructor.prototype = this.prototype;
    var instance = new constructor();
    var result = this.apply(instance, args);
    return (result instanceof Object)?result:instance;
};



Object.extend(Object, {
    fill: function(target, properties) {
        for(var prop in properties) {
            if (target[prop] == undefined)
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
    },
    delegate: function(client, clientMethodName, server, serverMethodName) {
        serverMethodName = serverMethodName||clientMethodName;
        client[clientMethodName] = server[serverMethodName].bind(server);
    },
    
    alias: function(object, aliasMethodName, methodName) {
        object[aliasMethodName] = object[methodName];
    }
});

Object.Aspect = {
    _around: function(target, methodName, aspect){
        var method = target[methodName];
        target[methodName] = function() {
            var invocation = {
                "target":this, 
                "method":method,
                "methodName":methodName,
                "arguments":arguments,
                "proceed": function(){
                    return method.apply(target, this.arguments);
                }
            };
            return aspect.apply(null, [invocation]);
        };
    },
    _before: function(target, methodName, aspect){
        var method = target[methodName];
        target[methodName] = function() {
            var invocation = {
                "target":this, 
                "method":method,
                "methodName":methodName,
                "arguments":arguments,
                "cancelled": false
            };
            aspect.apply(null, [invocation]);
            return (invocation["cancelled"]) ?
                invocation["result"] : method.apply(target, arguments);
        };
    },
    _after: function(target, methodName, aspect){
        var method = target[methodName];
        target[methodName] = function() {
            var invocation = {
                "target":this, 
                "method":method,
                "methodName":methodName,
                "arguments":arguments
            };
            invocation["result"] = method.apply(target, arguments);
            return aspect.apply(null, [invocation]);
        };
    },
    
    _apply: function(func, target, methodNames, aspect){
        methodNames = methodNames||this.getMethodNames(target);
        methodNames = (methodNames.each)?methodNames:[methodNames];
        methodNames.each(function(methodName){
            func(target, methodName, aspect);
        });
    },
    
    getMethodNames: function(target){
        var result = [];
        for(var attr in target) {
            try{
                var value = target[attr];
                if (value.constructor == Function)
                    result.push(attr);
            }catch(ex){
            }
        }
        return result;
    },
    
    around: function(target, methodNames, aspect){
        this._apply(this._around, target, methodNames, aspect);
    },
    before: function(target, methodNames, aspect){
        this._apply(this._before, target, methodNames, aspect);
    },
    after: function(target, methodNames, aspect){
        this._apply(this._after, target, methodNames, aspect);
    }
}
Object.Aspect.Logger = Class.create();
Object.Aspect.Logger.prototype = {
    initialize: function(target, methodNames, logger){
        this.logger = window["logger"] || {
            debug: function(msg){ alert(msg) },
            warn: function(msg){ alert("[warn]" + msg) }
        };
        Object.Aspect.around(target, methodNames, this.invokeMethod);
    },
    invokeMethod: function(invocation){
        var s = invocation.methodName+"("+ $A(invocation.arguments).join(",") +")";
        try{
            var result = invocation.proceed();
            this.logger.debug("[debug]" + s + " ==> " + result);
            return result;
        }catch(ex){
            this.logger.debug("[warn]" + s + " >>>> " + ex);
            throw ex;
        }
    }
};


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
  },
  sum: function(iterator) {
    var result = 0;
    this.each(function(value, index) {
      value = (iterator||Prototype.K)(value,index);
      result += value;
    });
    return result;
  }
}

Object.extend(Enumerable, EnumerableExt);

Object.extend(Array.prototype, EnumerableExt);
Object.extend(Array.prototype, {
	clone: function() {
		return Array.apply(null, this);
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
    },
	unique: function() {
		return this.inject([], 
			function(dest, value, index) {
				if (!dest.include(value))
					dest.push( value );
				return dest;
			} );
	},
	pushAll: function(enumerable){
	   var _dest = this;
	   enumerable.each(function(item){_dest.push(item);});
	   return this;
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
	},
	capitalize: function() {
	   return (this.length<1)?"":(this.charAt(0).toUpperCase()+this.substring(1));
	},
	uncapitalize: function() {
	   return (this.length<1)?"":(this.charAt(0).toLowerCase()+this.substring(1));
	}
} );


if (!String.Character) String.Character = {};
Object.extend(String.Character, {
    toCharCode: function(obj){
        if (!obj) return null;
        if (obj.constructor == Number) return obj;
        var s = String(obj);
        if (s.length < 1) return null;
        return s.charCodeAt(0);
    },
    
	isNumeric: function(charCode) {
	    charCode = String.Character.toCharCode(charCode);
	    if (!charCode) return false;
	    return (48 <=charCode && charCode <= 57);
	},

	isUpperAlphabet: function(charCode) {
	    charCode = String.Character.toCharCode(charCode);
	    if (!charCode) return false;
		return (65 <=charCode && charCode <= 90);
	},

	isLowerAlphabet: function(charCode) {
	    charCode = String.Character.toCharCode(charCode);
	    if (!charCode) return false;
		return (97 <=charCode && charCode <= 122);
	},

	isAlphabet: function(charCode) {
	    charCode = String.Character.toCharCode(charCode);
	    if (!charCode) return false;
		return String.Character.isUpperAlphabet(charCode) || String.Character.isLowerAlphabet(charCode);
	}
});

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
    oneOf: function(args, returnIfContains){
        value = (args.length>0&&args[0].contains)?args[0]:$A(args);
        return function(){
            for(var i=0;i<arguments.length;i++)
                if(value.contains(arguments[i]))
                    return returnIfContains;
            return !returnIfContains;
        };
    },
    include: function(value){return this.oneOf(arguments,true);},
    exclude: function(value){return this.oneOf(arguments,false);},
    
    _join: function(joinType, predicates) {
        var predicates = $A(predicates);
        for(var i=0;i<predicates.length;i++){
            if (!predicates[i])throw new Error("undefined or null predicate. "+i+"/"+predicates.length);
        }
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
    nodeTypeName: function(nodeType){
        if(!nodeType)return null;
        nodeType=(nodeType.nodeType)?nodeType.nodeType:nodeType;
        return Node.NodeTypeNames[nodeType]
     },
    identify_str: function(node){
        if(!node)
            return "null node";
        return (node.nodeType==Node.ELEMENT_NODE)?
            (node.tagName + 
                ((node.id)?("["+node.id+"]"):"") + 
                ((node.className)?("(" + node.className + ")"):"")):
            (node.nodeType==Node.TEXT_NODE)?
                ("TEXT_NODE:"+node.data.strip().truncate(20)):
                Node.nodeTypeName(node.nodeType);
    },
    blankTextNodeIgnored: function(){
        var div = document.createElement("DIV");
        div.innerHTML = "<div>  \n  </div>";
        var child=div.firstChild;
        return (child && child.firstChild &&  child.firstChild.nodeType==Node.TEXT_NODE)?false:true;
    }
});

Node.Predicate={};
Object.extend(Node.Predicate,Object.Predicate);
Object.extend(Node.Predicate,{
    oneOf: function(args,returnIfContains){
        value = ((args.length>0)&&(args[0].constructor==Array))?args[0]:$A(args);
        return function(node){
            if(value.contains(node))
                return returnIfContains;
            return !returnIfContains;
        };
    },
    nodeType: function(nodeTypes){
        nodeTypes=(!nodeTypes)?[Node.ELEMENT_NODE]:(nodeTypes.contains)?nodeTypes:[nodeTypes];
        return function(node){return nodeTypes.contains(node.nodeType);};
    },
    isElementNode: function(node){return node.nodeType==Node.ELEMENT_NODE;},
    
    childOf: function(ancestor){return function(node){return Element.childOf(node,ancestor);};},

    Native:{
        hasChild: function(node){return(node["childNodes"]&&node.childNodes.length>0);}
    },
    Common:{
        hasChild: function(node){
            var childNodes=node["childNodes"];
            if(!childNodes)
                return false;
            for(var i=0;i<childNodes.length;i++)
                if (Node.Predicate.denyBlankText(childNodes[i]))
                    return true;
            return false;
        }
    },
    
    denyBlankText: function(node){
        if (!node)return true;
        if (node.nodeType!=Node.TEXT_NODE)return true;
        if (!node.data)return false;
        var s=node.data.strip().gsub(/\n/,"");
        return (s!="");
    },
    
    filterCommon: function(node){
        if (!node)return true;
        if (!Node.Predicate.denyBlankText(node))return false;
        if (node.nodeType!=Node.TEXT_NODE)return true;
        return node.parentNode.tagName!="SCRIPT";
    }
});
Object.extend(Node.Predicate, 
    (Node.blankTextNodeIgnored()) ? Node.Predicate.Native : Node.Predicate.Common);


Node.Walk = {};
Object.extend(Node.Walk, {
    log: function(walk){
        if(Node.Walk.loggerIndex==undefined)Node.Walk.loggerIndex=0;
        var loggerIndex = Node.Walk.loggerIndex++;
        return function(node){
            var result = walk(node);
            if(window["logger"])
                logger.debug("walk["+loggerIndex+"] "+
                    "from{"+Node.identify_str(node)+
                    "} to {"+Node.identify_str(result)+"}");
            return result;
        };
    },
    predicated: function(walk,predicate){
        return function(node){
            var result=walk(node);
            return predicate(result)?result:null;
        };
    },
    
    until: function(walk,predicate){
        var match=false;
        return function(node){
            if(match)return null;
            var result=walk(node);
            if (predicate(result))
                match=true;
            return result;
        };
    },
    
    skipTo: function(walk,predicate,includeNode){
        return function(node){
            return Node.Finder.firstNode(node,walk,predicate,includeNode);
        };
    },
    
    parentNode: function(node){return node.parentNode;},
    
    empty: function(){return null;},
    
    Native:{
        firstChildNode: function(node){return node.firstChild;},
        lastChildNode: function(node){return node.lastChild;},
        nextSiblingNode: function(node){return node.nextSibling;},
        previousSiblingNode: function(node){return node.previousSibling;},
        childNodes: function(node,desc){
            if(!node || !node.childNodes)return Node.Walk.empty;
            return (desc)?Node.Walk.popArray(node.childNodes):Node.Walk.shiftArray(node.childNodes);
        }
    },
    
    Common:{
        firstChildNode: function(node){
            if (!node)return null;
            return Node.Finder.firstNode(node.firstChild, 
                Node.Walk.Native.nextSiblingNode, Node.Predicate.filterCommon,true);
        },
        lastChildNode: function(node){
            if (!node)return null;
            return Node.Finder.firstNode(node.lastChild, 
                Node.Walk.Native.previousSiblingNode, Node.Predicate.filterCommon,true);
        },
        nextSiblingNode: function(node){
            return Node.Finder.firstNode(node, 
                Node.Walk.Native.nextSiblingNode, Node.Predicate.filterCommon,false);
        },
        previousSiblingNode: function(node){
            return Node.Finder.firstNode(node, 
                Node.Walk.Native.previousSiblingNode, Node.Predicate.filterCommon,false);
        },
        childNodes: function(node, desc){
            var firstChild = Node.Walk.firstChildNode(node);
            if(!firstChild)return Node.Walk.empty;
            var children = Node.Finder.all(firstChild,Node.Walk.nextSiblingNode,Node.Predicate.acceptAll,true);
            return (desc)?Node.Walk.popArray(children):Node.Walk.shiftArray(children);
        }
    },
    
    nextNode: function(node) {
        var firstChild = Node.Walk.firstChildNode(node);
        if (firstChild)
            return firstChild;
        var ancestorWhoHasNextSibling = Node.Finder.firstNode(node, 
            Node.Walk.parentNode, Node.Walk.nextSiblingNode,true);
        return (ancestorWhoHasNextSibling) ? Node.Walk.nextSiblingNode(ancestorWhoHasNextSibling) : null;
    },
    previousNode: function(node) {
        var previousSibling = Node.Walk.previousSiblingNode(node);
        if (!previousSibling)
            return node.parentNode;
        return Node.Finder.firstNode(
            previousSibling, 
            Node.Walk.lastChild,
            Object.Predicate.not(Node.Walk.lastChild),true);
    },
    shiftArray: function(array) {
        if (!array) return Node.Walk.empty;
        array = $A(array);
        return function(node){return array.shift();};
    },
    popArray: function(array) {
        if (!array) return Node.Walk.empty;
        array = $A(array);
        return function(node){return array.pop();};
    }
});
Node.Walk.ancestor = Node.Walk.parentNode;
Object.extend(Node.Walk, 
    (Node.blankTextNodeIgnored()) ? Node.Walk.Native : Node.Walk.Common);
Node.Walk.firstChild = Node.Walk.firstChildNode;
Node.Walk.lastChild = Node.Walk.lastChildNode;
Node.Walk.nextSibling = Node.Walk.nextSiblingNode;
Node.Walk.previousSibling = Node.Walk.previousSiblingNode;

Node.Walk.prevSibling = Node.Walk.previousSibling;
Node.Walk.prevNode = Node.Walk.previousNode;

Node.Finder = {
    //logger: (window["logger"])?logger:null,
    
    process: function(iterator, node, walk, predicate, includeNode){
		//if (Node.Finder.logger)
		//    Node.Finder.logger.debug("Node.Finder.process - node: "+ Node.identify_str(node));
        if(!node)return;
        predicate = predicate||Object.Predicate.acceptAll;
		for(var current=(includeNode)?node:walk(node);current;current=walk(current)){
    	    var predResult = predicate(current);
			//if (Node.Finder.logger)
			//    Node.Finder.logger.debug("Node.Finder.process - current: "+ 
			//        Node.identify_str(current) +" ==> " + predResult);
    	    var ir=iterator(current, predResult);
	        if(ir){
    	        if (ir.command=="return") return ir.result;
    	        if (ir.command=="break") break;
	        }
		}
    },

    firstNode: function(node, walk, predicate, includeNode){
        return this.process(function(current, predResult){
            if (predResult)
                return {command:"return", "result":current};
        }, node, walk, predicate, includeNode) || null;
    },
    allNodes: function(node, walk, predicate, includeNode){
		var result = [];
		this.process(function(current, predResult){
            if (predResult)
                result.push(current);
        }, node, walk, predicate, includeNode);
		return result;
    },
    lastNode: function(node, walk, predicate, includeNode){
		var result = null;
		this.process(function(current, predResult){
            if (predResult)
                result = current;
        }, node, walk, predicate, includeNode);
		return result;
    },
    
    firstElement: function(node, walk, predicate, includeNode){
        predicate = predicate||Object.Predicate.acceptAll;
        return this.firstNode(node,walk,
            Object.Predicate.and(Node.Predicate.isElementNode,predicate),includeNode);
    },
    allElements: function(node, walk, predicate, includeNode){
        predicate = predicate||Object.Predicate.acceptAll;
        return this.allNodes(node,walk,
            Object.Predicate.and(Node.Predicate.isElementNode,predicate),includeNode);
    },
    lastElement: function(node, walk, predicate, includeNode){
        predicate = predicate||Object.Predicate.acceptAll;
        return this.lastNode(node,walk,
            Object.Predicate.and(Node.Predicate.isElementNode,predicate),includeNode);
    }
};
//Node.Finder.first = Node.Finder.firstElement;
//Node.Finder.all = Node.Finder.allElements;
Node.Finder.first = Node.Finder.firstNode;
Node.Finder.all = Node.Finder.allNodes;
Node.Finder.last = Node.Finder.lastNode;

Element.Predicate = {};
Object.extend(Element.Predicate,Node.Predicate);
Object.extend(Element.Predicate,{
    tagName: function(tagName) {
        tagName = tagName.toUpperCase();
        return function(node){return (node.tagName)&&(node.tagName.toUpperCase()==tagName);};
    },
    tagNames: function(tagNames) {
        tagNames = (tagNames.contains)?tagNames:[tagNames];
        tagNames = tagNames.collect(function(tagName){return tagName.toUpperCase();});
        return function(node){return (node.tagName)&&(tagNames.contains(node.tagName.toUpperCase()));};
    },
    className: function(className) {
        return function(node){try{return Element.hasClassName(node,className);}catch(ex){return false;}};
    }
});

Element.Walk = {};
Object.extend(Element.Walk,Node.Walk);
Object.extend(Element.Walk,{
    firstChildElement: function(node){
        return (!node)?null:Node.Finder.firstNode(node.firstChild,
            Element.Walk.nextSiblingNode,
            Element.Predicate.isElementNode,true);
    },
    lastChildElement: function(node){
        return (!node)?null:Node.Finder.firstNode(node.lastChild,
            Element.Walk.previousSiblingNode,
            Element.Predicate.isElementNode,true);
    },
    nextSiblingElement: function(node){
        return (!node)?null:Node.Finder.firstNode(node.nextSibling,
            Element.Walk.nextSiblingNode,
            Element.Predicate.isElementNode,true);
    },
    previousSiblingElement: function(node){
        return (!node)?null:Node.Finder.firstNode(node.previousSibling,
            Element.Walk.previousSiblingNode,
            Element.Predicate.isElementNode,true);
    },
    nextElement: function(node) {
        var firstChildElement = Element.Walk.firstChild(node);
        if (firstChildElement)
            return firstChildElement;
        var ancestorWhoHasNextSibling = Node.Finder.firstNode(node, 
            Node.Walk.parentNode, Element.Walk.nextSiblingElement,true);
        return (ancestorWhoHasNextSibling) ? Element.Walk.nextSiblingElement(ancestorWhoHasNextSibling): null;
    },
    previousElement: function(node) {
        var previousSibling = Element.Walk.previousSibling(node);
        if (!previousSibling)
            return node.parentNode;
        return Node.Finder.firstNode(
            previousSibling, 
            Element.Walk.lastChild,
            Object.Predicate.not(Element.Walk.lastChild),true);
    }
});
Element.Walk.ancestor = Element.Walk.parentNode;
Element.Walk.firstChild = Element.Walk.firstChildElement;
Element.Walk.lastChild = Element.Walk.lastChildElement;
Element.Walk.nextSibling = Element.Walk.nextSiblingElement;
Element.Walk.previousSibling = Element.Walk.previousSiblingElement;
Element.Walk.next = Element.Walk.nextElement;
Element.Walk.previous = Element.Walk.previousElement;
Element.Walk.prevElement = Element.Walk.previousElement;

Element.Walk.prevSibling = Element.Walk.previousSibling;
Element.Walk.prevNode = Element.Walk.previousNode;
Element.Walk.prev = Element.Walk.previousElement;

//WalkはPredicateとしても使える・・・・でも、敢えてコピーするほどのものでもないか。
//Object.fill(Element.Predicate, Element.Walk);


Object.extend(Element, {
    findNode: function(node, walk, predicate){
		Node.Finder.first(node, walk, predicate);
    },
    findDescendant: function(node, predicate) {
		return this.findNode(node, 
		    function(current){return current.firstChild || current.nextSibling;}, predicate);
    },
    findNextNode: function(node, predicate) {
		return this.findNode(node, Element.Walk.nextNode, predicate);
    },
    findPreviousNode: function(node, predicate) {
		return this.findNode(node, Element.Walk.previousNode, predicate);
    },
	findNextSibling: function(node, predicate) {
		return this.findNode(node, Element.Walk.nextSibling, predicate);
	},
	findPreviousSibling: function(node, predicate) {
		return this.findNode(node, Element.Walk.previousSibling, predicate);
	},
	
	findAncestorByTagName: function(node,tagName) {
	   return Node.Finder.first(node, 
	       Element.Walk.ancestor, 
	       Element.Predicate.tagName(tagName));
	},
	findAncestorByClassName: function(node,className) {
	   return Node.Finder.first(node, 
	       Element.Walk.ancestor, 
	       Element.Predicate.className(className));
	}
	
});

if (!Element.Style) Element.Style = {};
Object.extend(Element.Style, {
	toStyleObject: function( styleString ) {
		if (!styleString)
			return null;
		var result = {};
		var entries = styleString.split( ";" );
		for(var i = 0; i < entries.length; i++) {
			var items = entries[i].split( ":", 2 );
			if (items.length < 1)
				continue;
			var key = items[0].strip().camelize();
			if (!key)
				continue;
			var value = items.length < 2 ? null : items[1];
			result[key] = value;
		}
		return result;
	}
});

Element.Builder = Class.create();
Element.Builder.DefaultIgnoreProperties = [
    "tagName", "afterBuild", "body"
];
Element.Builder.prototype = {
	initialize: function( bodyPropertyName,  baseDocument ) {
		this.bodyPropertyName = bodyPropertyName || "body";
		this.baseDocument = baseDocument || document;
		this.ignoreProperties = ["tagName", "afterBuild", this.bodyPropertyName];
		if (Object.prototype.extend) {
			this.ignoreProperties.push( "extend");
		}
	},
	execute: function(obj,parentNode) {
		return this.dispatchBuild(obj,parentNode);
	},
	dispatchBuild: function(obj,parentNode) {
		if (obj.constructor == Array) {
			return this.buildNodes(obj,parentNode);
		} else if (obj.tagName) {
			return this.buildNode(obj,parentNode);
		} else if (obj.constructor == String) {
			return this.buildText(obj,parentNode);
		} else {
			return this.buildText(String(obj),parentNode);
		}
	},
	buildText: function(string,parentNode) {
		var result = this.baseDocument.createTextNode(string);
		if (parentNode) parentNode.appendChild(result);
		return result;
	},
	buildNode: function(obj,parentNode) {
		var result = this.baseDocument.createElement(obj.tagName);
		this.applyAttributes(result, obj, this.ignoreProperties);
		if (parentNode) 
		    parentNode.appendChild(result);
		var body = obj[this.bodyPropertyName];
		if ((body != null) && (body != undefined))
			this.dispatchBuild(body,result);
		if ((obj.afterBuild) && (obj.afterBuild.constructor == Function))
			obj.afterBuild(result, this, obj);
		return result;
	},
	buildNodes: function(arrayObj,parentNode){
		var result = new Array();
		for(var i = 0; i < arrayObj.length; i++) {
			if (arrayObj[i]){
			    var node = this.dispatchBuild(arrayObj[i],parentNode);
				result.push(node);
			}
		}
		return result;
	},
	applyAttributes: function(node, attributeObj, ignoreProperties){
		if (!attributeObj)
			return;
	    ignoreProperties = ignoreProperties||this.ignoreProperties;
		for(var prop in attributeObj) {
			if (ignoreProperties && this._array_contains(ignoreProperties, prop))
				continue;
			//IEのstyleは特別扱い
			if ((prop == "style") && (navigator.appVersion.indexOf("MSIE") > -1)) {
				var style = attributeObj[prop];
				var styleObj = Element.Style.toStyleObject( style );
				for(var styleItemName in styleObj) {
					if (styleItemName == "extend")
						continue;
					var styleItemValue = styleObj[styleItemName].strip();
					try {
						node.style[styleItemName] = styleItemValue;
					} catch(e) {
					}
				}
				continue;
			} else if (prop == "className" || prop == "class") {
				node.className = attributeObj[prop];
			} else {
				var value = attributeObj[prop];
				if (node.tagName.toUpperCase() == "LABEL") {
					// labelタグのfor属性は、javascriptからアクセスする場合には名前が違う。for(fx) / htmlFor(ie)
					if ((prop == "for") &&  (navigator.appVersion.indexOf("MSIE") > -1))
						prop = "htmlFor";
					if ((prop == "htmlFor") &&  (navigator.appVersion.indexOf("MSIE") < 0))
						prop = "for";
				}
				node.setAttribute(prop, value);
			}
		}
	},
	_array_contains: function( arrayObj, obj ) {
		for(var i = 0; i < arrayObj.length; i++) {
			if (arrayObj[i] == obj)
				return true;
		}
		return false;
	}
};
Object.extend(Element, {
    build: function(elementObj,parentNode){
        if (!Element.Builder.instance)
            Element.Builder.instance = new Element.Builder();
        return Element.Builder.instance.execute(elementObj,parentNode);
    },
    
    applyAttributes: function(node, attributeObj, ignoreProperties){
        ignoreProperties = ignoreProperties || Element.Builder.DefaultIgnoreProperties;
        if (!Element.Builder.instance)
            Element.Builder.instance = new Element.Builder();
        return Element.Builder.instance.applyAttributes(node, attributeObj, ignoreProperties);
    }
});


(function(){
    var keys = [
        //1. KEY_XXXX (which will convert toUpperCase)
        //2. keyCode
        //3. charCode
        //4. charCode with shift
        ["cancel",			3, null, null	],
        ["help",			6, null, null	],
        ["back_space",		8, null, null	],
        ["tab",				9, null, null	],
        ["clear",			12, null, null	],
        ["return",			13, null, null	],
        ["enter",			14, null, null	],
        ["shift",			16, null, null	],
        ["ctrl",			17, null, null	],
        ["alt",				18, null, null	],
        ["pause",			19, null, null	],
        ["caps_lock",		20, null, null	],
        ["esc", 			27, null, null	],
        ["space",			32, 32, 32	],
        ["page_up",			33, null, null	],
        ["page_down",		34, null, null	],
        ["end",				35, null, null	],
        ["home",			36, null, null	],
        ["left",			37, null, null	],
        ["up",				38, null, null	],
        ["right",			39, null, null	],
        ["down",			40, null, null	],
        ["print_screen",	44, null, null	],
        ["insert",			45, null, null	],
        ["delete",			46, null, null	],
        ["num_0",			48, 48, null	],
        ["num_1",			49, 49, 33	],
        ["num_2",			50, 50, 34	],
        ["num_3",			51, 51, 35	],
        ["num_4",			52, 52, 36	],
        ["num_5",			53, 53, 37	],
        ["num_6",			54, 54, 38	],
        ["num_7",			55, 55, 39	],
        ["num_8",			56, 56, 40	],
        ["num_9",			57, 57, 41	],
        ["colon",			59, 58, 42	],
        //["equals",		60, '=', '-'  ],
        ["semicolon",		61, 59, 43	],
        ["a",				65, 97, 65	],
        ["b",				66, 98, 66	],
        ["c",				67, 99, 67	],
        ["d",				68, 100, 68	],
        ["e",				69, 101, 69	],
        ["f",				70, 102, 70	],
        ["g",				71, 103, 71	],
        ["h",				72, 104, 72	],
        ["i",				73, 105, 73	],
        ["j",				74, 106, 74	],
        ["k",				75, 107, 75	],
        ["l",				76, 108, 76	],
        ["m",				77, 109, 77	],
        ["n",				78, 110, 78	],
        ["o",				79, 111, 79	],
        ["p",				80, 112, 80	],
        ["q",				81, 113, 81	],
        ["r",				82, 114, 82	],
        ["s",				83, 115, 83	],
        ["t",				84, 116, 84	],
        ["u",				85, 117, 85	],
        ["v",				86, 118, 86	],
        ["w",				87, 119, 87	],
        ["x",				88, 120, 88	],
        ["y",				89, 121, 89	],
        ["z",				90, 122, 90	],
        ["context_menu",	93, null, null	],
        ["numpad0",			96, 48, 48	],
        ["numpad1",			97, 49, 49	],
        ["numpad2",			98, 50, 50	],
        ["numpad3",			99, 51, 51	],
        ["numpad4",			100, 52, 52	],
        ["numpad5",			101, 53, 53	],
        ["numpad6",			102, 54, 54	],
        ["numpad7",			103, 55, 55	],
        ["numpad8",			104, 56, 56	],
        ["numpad9",			105, 57, 57	],
        ["multiply",		106, 42, 42	],
        ["add",				107, 43, 43	],
        ["separator",		108, 44, 44	],
        ["subtract",		109, 45, 45	],
        ["decimal",			110, 46, 46	],
        ["divide",			111, 47, 47	],
        ["f1",				112, null, null	],
        ["f2",				113, null, null	],
        ["f3",				114, null, null	],
        ["f4",				115, null, null	],
        ["f5",				116, null, null	],
        ["f6",				117, null, null	],
        ["f7",				118, null, null	],
        ["f8",				119, null, null	],
        ["f9",				120, null, null	],
        ["f10",				121, null, null	],
        ["f11",				122, null, null	],
        ["f12",				123, null, null	],
        ["f13",				124, null, null	],
        ["f14",				125, null, null	],
        ["f15",				126, null, null	],
        ["f16",				127, null, null	],
        ["f17",				128, null, null	],
        ["f18",				129, null, null	],
        ["f19",				130, null, null	],
        ["f20",				131, null, null	],
        ["f21",				132, null, null	],
        ["f22",				133, null, null	],
        ["f23",				134, null, null	],
        ["f24",				135, null, null	],
        ["num_lock",		144, null, null	],
        ["scroll_lock",		145, null, null	],
        ["colon2",			186, 58, 42	],
        ["semicolon2",		187, 59, 43	],
        ["comma",			188, 44, 60	],
        ["hyphen",			189, 45, 61	],
        ["period",			190, 46, 62	],
        ["slash",			191, 47, 63	],
        ["back_quote",		192, 64, 96	],
        ["open_bracket",	219, 91, 123	],
        ["back_slash1",		220, 92, 124	],
        ["close_bracket",	221, 93, 125	],
        ["quote",			222, 94, 126	],
        ["meta",			224, null, null	],
        ["back_slash2",		226, 92, 95	],
        ["ime_on",			243, null, null	],
        ["ime_off ",		244, null, null	]
    ];
    var keyNames = {}, charCodes = {}, charCodesShift = {};
    var regExpUnderScore = /_/g;
    for(var i=0;i<keys.length;i++){
        var keyDef = keys[i];
        var baseName = keyDef[0]; 
        var keyCode = keyDef[1];
        Event["KEY_"+baseName.toUpperCase()] = keyCode;
        keyNames[keyCode] = baseName.replace(regExpUnderScore, "-").camelize();
        charCodes[keyCode] = keyDef[2];
        charCodesShift[keyCode] = keyDef[3];
    }
    Event.keyNames = keyNames;
    Event.charCodes = charCodes;
    Event.charCodesShift = charCodesShift;
})();



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
	},
	getKeyName: function(keyCode){
	   return Event.keyNames[keyCode] || String.fromCharCode(keyCode) || keyCode;
	},
	
	getCharCode: function(event){
	   var keyCode = this.getKeyCode(event);
	   return (event.shiftKey) ? Event.charCodesShift[keyCode] : Event.charCodes[keyCode];
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
        this.active = false;
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
        this.active = true;
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
        this.active = false;
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
        var result = (action.matchAll) ? true :
            (action.match) ? action.match(action, event, keyCode, this):
            this.matchAction(action, event, keyCode);
        return (this.options.handleOnMatch) ? result : !result;
    },
    handle: function(event) {
        var keyCode = Event.getKeyCode(event);
        //logger.debug(event.type + " alt:" + event.altKey + " ctrl:" + event.ctrlKey + " shift:" + event.shiftKey + " keyCode:" + keyCode);
        for(var i = 0; i < this.actions.length; i++) {
            var action = this.actions[i];
            if (this.isHandlingAction(action, event, keyCode)) {
                if (action.event.indexOf(event.type) > -1) {
                    try{
                        action.method(event);
                    }catch(ex){
                        if (ex==$continue) continue;
                        if (ex==$break) break;
                        throw ex;
                    }
                }
                if (action.stopEvent==undefined||action.stopEvent==null||action.stopEvent) {
                    Event.stop(event);
                    return;
                }
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


Math.Rectangle = Class.create();
Math.toRect = function(obj) {
 	if (arguments.length == 1) {
     	if (obj.nodeType){
     	    return new Math.Rectangle(
     	        obj.offsetLeft || obj.style.left.toNumeric()*1,
     	        obj.offsetTop || obj.style.top.toNumeric()*1, 
     	        obj.offsetWidth || obj.style.width.toNumeric()*1,
     	        obj.offsetHeight || obj.style.height.toNumeric()*1);
     	}else{
     	    return new Math.Rectangle(obj.left, obj.top, obj.width, obj.height);
     	}
 	} else {
 	    return Math.Rectangle.applyNew(arguments)
 	}
}
Object.extend(Math.Rectangle, {
	containsPosition: function(left,top,width,height,x,y) {
		return (left<x && x<left+width && top<y && y<top+height);
	}
});
Math.Rectangle.prototype = {
 	initialize: function(left, top, width, height) {
 		this.left = left||0; 
 		this.top = top||0; 
 		this.width = width||0; 
 		this.height = height||0;
 	},
 	getLeft: function(){return this.left;},
 	getTop: function(){return this.top;},
 	getRight: function(){return this.left+this.width;},
 	getBottom: function(){return this.top+this.height;},
 	
    containsPosition: function(position) {
 		return Math.Rectangle.containsPosition(
 			this.left, this.top, this.width, this.height, position.x, position.y);
 	},
 	
	isIntersectedWith: function(rect) {
		if (!rect)
			throw new Error("rect is not specified");
		return !( (this.getRight() < rect.left)||
		      (this.left > rect.left + rect.width)||
		      (this.getBottom() < rect.top)||
		      (this.top > rect.top + rect.height) );
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
	},
    scrollXIfInvisible: function(element, scrollable) {
        scrollable = (scrollable) ? scrollable : (navigator.appVersion.indexOf("MSIE") < 0) ? window : document.documentElement;
        if (scrollable == window) {
            HTMLElement._scrollIfInvisible(element, scrollable, 
                "x", "offsetLeft", "offsetWidth", "scrollX", "innerWidth");
        } else {
            HTMLElement._scrollIfInvisible(element, scrollable, 
                "x", "offsetLeft", "offsetWidth", "scrollLeft", "clientWidth");
        }
    },
    scrollYIfInvisible: function(element, scrollable) {
        scrollable = (scrollable) ? scrollable : (navigator.appVersion.indexOf("MSIE") < 0) ? window : document.documentElement;
        if (scrollable == window) {
            HTMLElement._scrollIfInvisible(element, scrollable, 
                "y", "offsetTop", "offsetHeight", "scrollY", "innerHeight");
        } else  {
            HTMLElement._scrollIfInvisible(element, scrollable, 
                "y", "offsetTop", "offsetHeight", "scrollTop", "clientHeight");
        }
    },
    scrollIfInvisible: function(element, scrollable) {
        HTMLElement.scrollYIfInvisible(element, scrollable);
        HTMLElement.scrollXIfInvisible(element, scrollable);
    },
	getIntersectedElements: function(baseElement, tagName){
	    tagName = tagName||"DIV";
	    var elements = document.getElementsByTagName(tagName);
	    var baseRect = Math.toRect(baseElement);
	    var result = [];
	    for(var i=0;i<elements.length;i++){
	        var element = elements[i];
	        if (element==elements || element.style.position!="absolute")
	            continue;
	        if (baseRect.isIntersectedWith(Math.toRect(element)))
	            result.push(element);
	    }
	    return result;
	},
	bringToFront: function(target){
	    var intersected = this.getIntersectedElements(target);
	    if (intersected.length < 1)
	        return;
	    var maxZIndex = intersected.collect(function(element){
	        return (element.style.zIndex)?element.style.zIndex*1:0}).max();
	    target.style.zIndex = maxZIndex + 1;
	},
	centering: function(target) {
		target = $(target);
		var documentBody = document.documentElement || document.body;
		var clientW = documentBody.clientWidth;
		var clientH = documentBody.clientHeight;
		var scrollL = documentBody.scrollLeft;
		var scrollT = documentBody.scrollTop;
		target.style.left = ((clientW-target.offsetWidth)/2+scrollL)+"px";
		target.style.top = ((clientH-target.offsetHeight)/2+scrollT)+"px";
	}
});


if (!window["HTMLInputElement"]) HTMLInputElement = {};

if (navigator.appVersion.indexOf("MSIE") > -1) {
    Object.extend(HTMLInputElement, {
        setSelectedText: function(field, value, keepSelection){
    		var range = field.document.selection.createRange();
    		var rangeLength = range.text.length;
            range.text = value;
    		range.select();
        }
    });
}else{
    Object.extend(HTMLInputElement, {
        setSelectedText: function(field, value, keepSelection){
            var str = field.value;
			if (str.length < 1){
                field.value = value;
			}else{
    			var head = str.substring(0, field.selectionStart);
    			var tail = str.substring(field.selectionEnd, str.length);
                field.value = head + value + tail;
                var idx = head.length + value.length;
                field.setSelectionRange(idx, idx);
			}
        }
    });
}

HTMLInputElement.PullDown = Class.create();
HTMLInputElement.PullDown.DefaultOptions = {
    hideTimeout: 500,
    hideSoonOnKeyEvent: true,
    hideOnPaneClick: true
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
    getPaneHolder: function(){
        return this;
    },
	createPane: function(paneHolder) {
		var result = document.createElement("DIV");
		document.body.appendChild(result);
		result.style.position = "absolute";
		result.style.display = "none";
		if (this.paneOptions.style)
		    delete this.paneOptions.style;
		Object.extendProperties(result, this.paneOptions);
		Element.setStyle(result, this.paneStyle);
		return result;
	},
    toggle: function(event) {
        if (this.visible)
            this.hide(event);
        else
            this.show(event);
    },
    show: function(event) {
        var paneHolder = this.getPaneHolder();
        if (!paneHolder.pane) {
            paneHolder.pane = this.createPane(paneHolder);
            paneHolder.shim = HTMLIFrameElement.Shim.create(paneHolder.pane);
            Event.observe(paneHolder.pane, "click", this.paneClick.bindAsEventListener(this), false);
            //Event.observe(paneHolder.pane, "focus", this.paneClick.bindAsEventListener(this), false);
            //Event.observe(paneHolder.pane, "blur", this.paneBlur.bindAsEventListener(this), false);
        }
		this.updatePaneRect(event);
        Element.show(paneHolder.pane);
        paneHolder.shim.enableShim();
        this.visible = true;
        try{
            HTMLElement.scrollIfInvisible(paneHolder.pane);
        }catch(ex){
        }
    },
    paneClick: function(event) {
        if (!this.options.hideOnPaneClick)
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
        var paneHolder = this.getPaneHolder();
        if (!paneHolder.pane)
            return;
        Element.hide(paneHolder.pane);
        paneHolder.shim.disableShim();
        this.visible = false;
        this.waitHiding = false;
    },
    updatePaneRect: function(event) {
        var field = Event.element(event);
		var fieldPosition = Position.positionedOffset(field);
        var paneHolder = this.getPaneHolder();
        paneHolder.pane.style.top = (fieldPosition[1] + field.offsetHeight)  + "px";
		paneHolder.pane.style.left = (fieldPosition[0]) + "px";
    }
};
Object.extend(HTMLInputElement.PullDown.prototype, HTMLInputElement.PullDown.Methods);


if (!window["HTMLIFrameElement"]) HTMLIFrameElement = {};
HTMLIFrameElement.Shim = Class.create();
HTMLIFrameElement.Shim.DefaultOptions = {
	"frameBorder": "no",
	//"frameSpacing": 0,
	"scrolling": "no"
};
HTMLIFrameElement.Shim.DefaultStyle = {
	"position": "absolute",
	//"background-color": "transparent",
	"border-style": "none",
	"border-collapse": "collapse",
	"top": "0px",
	"left": "0px",
	"display": "none",
	"z-index": 10
};
Object.extend(HTMLIFrameElement.Shim, {
    create: function(pane) {
        var result = HTMLIFrameElement.Shim.needShim() ?
            new HTMLIFrameElement.Shim(pane) : HTMLIFrameElement.Shim.NULL; 
		result.enableShim();
		return result;
    },
    needShim: function() {
		var result =
		  (navigator.appVersion.indexOf("MSIE") > -1) &&
		  (navigator.appVersion.indexOf("MSIE 7") < 0);
		return result
    }
});
HTMLIFrameElement.Shim.NULL = {
	fit: function() {},
	enableShim: function() {},
	disableShim: function() {}
};
HTMLIFrameElement.Shim.prototype = {
    initialize: function(pane, options, style) {
        this.pane = $(pane);
		this.frame = document.createElement("IFRAME");
		document.body.appendChild(this.frame);
		
		this.options = Object.fill(options || {}, HTMLIFrameElement.Shim.DefaultOptions);
		Element.applyAttributes(this.frame, this.options);
		
		Element.setStyle(this.frame, Object.fill(style || {}, HTMLIFrameElement.Shim.DefaultStyle));
		this.pane.style.zIndex = this.frame.style.zIndex + 1;
		Event.observe(this.pane, "move", this.fit.bindAsEventListener(this), true);
		Event.observe(this.pane, "resize", this.fit.bindAsEventListener(this), true);
		this.fit();
    },
	fit: function() {
	    if (!this.frame)
	       return;
		this.frame.style.width = this.pane.offsetWidth + "px";
		this.frame.style.height = this.pane.offsetHeight + "px";
		this.frame.style.top = this.pane.style.top;
		this.frame.style.left = this.pane.style.left;
		this.frame.style.zIndex = this.pane.style.zIndex - 1;
		this.frame.frameBorder="no";
		
	},
	enableShim: function() {
		this.fit();
	    if (this.frame)
    		Element.show(this.frame);
	},
	disableShim: function() {
	    if (this.frame)
    		Element.hide(this.frame);
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
