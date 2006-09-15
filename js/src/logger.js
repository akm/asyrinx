/**
 * logger.js
 * 
 * require prototype.js only
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

Logger = Class.create();
Object.extend(Logger, {
	formatDate: function(d){
	    if (!d)return "";
		return d.getFullYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+" "+
			d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()+":"+d.getMilliseconds();
	},
	includeAll:function(){return true;},
	includeFunction: function(key,value){return (value&&typeof(value)=="function");},
	excludeFunction: function(key,value){return ((value&&typeof(value)!="function")||(value==null||value==undefined));},
	sortedAttributes: function(obj,predicate){
		var attrs = new Array();
		for (var key in obj){
			try {
				var value = obj[key];
    			if (predicate(key,value))
    				attrs.push(key);
			} catch(ex) {continue;}
		}
		attrs.sort();
		return attrs;
	},
	
	uninspectClasses: [String,Number,Boolean,Date,RegExp,Array],
	knownClasses    : [ String , Number , Boolean , Date , RegExp , Array , Function ],
	knownClassNames : ["String","Number","Boolean","Date","RegExp","Array","Function"],
	
	repeatStr:function(s,count){
	   var result="";
	   for(var i=0;i<count;i++)result+=s;
	   return result;
	},
	
    identify_str: function(node){
        if(!node)
            return "null node";
        return (node.nodeType==1)? //Node.ELEMENT_NODE
            (node.tagName + 
                ((node.id)?("["+node.id+"]"):"") + 
                ((node.className)?("(" + node.className + ")"):"")):
            (node.nodeType==3)? //Node.TEXT_NODE
                ("TEXT_NODE:"+node.data.strip().truncate(20)):
                ("nodeType:"+node.nodeType);
    },
    
	inspectCaption: function(obj){
	   if (obj==undefined)return "undefined";
	   if (obj==null)return "null";
	   var idx = this.knownClasses.indexOf(obj.constructor);
	   var className = (idx>-1)?this.knownClassNames[idx]:(obj.nodeType)?this.identify_str(obj):null;
	   var typeName=typeof(obj);
	   return ("["+(className||typeName)+"]"+obj).truncate(100).gsub(/\n/,"\\n");
	},
	
	likeArray: function(obj){
	   if(!obj)return false;
	   return (!obj.nodeType)&&(obj.constructor!=String)&&(obj.length!=null)&&(obj.length!=undefined)&&(obj.length.constructor==Number);
	},
	
	DefaultLevel:1,
	DefaultMaxLevel:1,
	
	inspect_array: function(obj,predicate,level,max_level){
       var s="[\n";
       for(var i=0;i<obj.length;i++)
           s+=(spacing+i+":"+Logger.inspect(obj[i],Logger.excludeFunction,level,max_level)+"\n");
       s+="]";
       return this.inspectCaption(obj)+s;
	},
	
	inspect_hash: function(obj,predicate,level,max_level){
       var s="";
       var attrs = this.sortedAttributes(obj,predicate);
       attrs.each(function(attr){
           if (!s.endWith("\n"))
               s+="\n";
	           var value = Logger.inspect(obj[attr],Logger.excludeFunction,level+1,max_level);
  	           s+=(spacing+attr+":"+value+"\n");
       });
       return this.inspectCaption(obj) +"\n"+ s;
	},
	
	inspect: function(obj,predicate,level,max_level){
	   predicate=predicate||Logger.excludeFunction;
	   level=(level==undefined||level==null)?Logger.DefaultLevel:level;
	   max_level=(max_level==undefined||max_level==null)?Logger.DefaultMaxLevel:max_level;
	   if (obj==undefined)return "undefined";
	   if (obj==null)return "null";
       var spacing=this.repeatStr("  ",level);
	   if (level>=max_level){
	       return (this.likeArray(obj)) ? this.inspect_array(obj,predicate,level,max_level) : this.inspectCaption(obj);
	   } else if (level>0 && Logger.uninspectClasses.indexOf(obj.constructor)>-1){
	       return this.inspectCaption(obj);
	   } else if (obj.constructor==Function){
	       return "[function]";
	   } else if (this.likeArray(obj)) {
	       return this.inspect_array(obj,predicate,level,max_level);
	   } else {
	       return this.inspect_hash(obj,predicate,level+1,max_level);
	   }
	},
	isActiveOnLoad: function(){
	   return (document.cookie.indexOf("loggerActive=true") > -1);
	},
	setActiveOnLoad:function(value){
	   document.cookie = ("loggerActive="+(value?"true":"false"))+";Fri, 31-Dec-2030 23:59:59;";
	}
});
Logger.prototype = {
    initialize: function(element,logs){
        this.logs=logs||"";
        this.setElement($(element));
    },
    append:function(logs) {
        if (!this.appendingType){
        }else if (this.appendingType=="textNode"){
            this.element.appendChild(document.createTextNode(logs));
        }else if (this.appendingType=="value"){
            this.element.value=this.element.value+"\n"+logs;
        }else if (this.appendingType=="innerHTML"){
            this.element.innerHTML=this.element.innerHTML+"<br/>"+logs.escapeHTML(); //.gsub(/\n/,"<br/>");
        }else{
            this.logs=this.logs||"";
            this.logs=this.logs+"\n"+logs;
        }
    },
    setElement: function(element){
        var logs = (!this.appendingType)?this.logs:
            (this.appendingType=="value")?this.element.value:
            this.element.innerHTML.unescaptHTML();
        this.element=element;
        this.appendingType = (!this.element)?null:
            ((/div/i).test(this.element.tagName))?"textNode":
            ((/input|textarea/i).test(this.element.tagName))?"value":"innerHTML";
        this.append(logs);
    },
    formatMsg: function(level,msg,t){
        t=t||new Date();
        return Logger.formatDate(t)+"["+level+"] "+msg;
    },
    showWindow:function(windowName, focus){
        if (this.window)
            return;
        windowName=windowName||"loggerWindow";
        this.window = window.open('',windowName,"resizable=yes,scrollbars=yes,top=0,left=0");
        if (focus)
            this.window.focus();
        this.window.document.write("<html><head><title>Log Window</title></head><body></body></html>");
        //this.window.document.close();
        this.setElement(this.window.document.body||this.window.document.documentElement);
    },
    toLogStr: function(level,args){
        var s="";
        args=$A(args);
        var max_level = ((args.last())&&(args.last().constructor==Number))?args.pop():Logger.DefaultMaxLevel;
        if (args.length>0) 
            s = this.formatMsg(level,args[0]);
        for(var i=1;i<args.length;i++)
            s += ("\n inspect["+i+"] \n"+ Logger.inspect(args[i],null,null,max_level));
        return s;
    },
    log: function(level,args){
        this.append(this.toLogStr(level,args));
    },
    debug: function(){this.log("debug",arguments);},
    info: function(){this.log("info",arguments);},
    warn: function(){this.log("warn",arguments);},
    error: function(){this.log("error",arguments);},
    fatal: function(){this.log("fatal",arguments);}
};
var logger = new Logger(null,"");
if (window["top"] && top.tracer) {
    
    Object.extend(logger, {
        log: function(level,args){
            var s = this.toLogStr(level,args).gsub(/\n/,"___LF___").escapeHTML().gsub(/___LF___/,"<br/>").gsub(/ /,"&nbsp;");
            
            switch(level){
                case "fatal": top.tracer._trace(s,null,5); break;
                case "error": top.tracer._trace(s,null,4); break;
                case "warn": top.tracer.warn(s); break;
                case "info": top.tracer.inform(s); break;
                case "debug": 
                default:
                    top.tracer.debug(s); break;
            }
        }
    });
}else{
    if(Logger.isActiveOnLoad()) {
        logger.showWindow();
        logger.info("auto log window open by cookie. Logger.setActiveOnLoad(false) if you want it disable. ");
    }
}
