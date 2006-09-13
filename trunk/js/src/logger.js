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
		return d.getYear()+"/"+(d.getMonth()+1)+"/"+d.getDate()+" "+
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
	
	repeatStr:function(s,count){
	   var result="";
	   for(var i=0;i<count;i++)result+=s;
	   return result;
	},
	
	DefaultMaxDepth:1,
	
	inspect: function(obj,predicate,level,max_depth){
	   predicate=predicate||Logger.excludeFunction;
	   level=(level==undefined)?1:level;
	   max_depth=(max_depth==undefined)?Logger.DefaultMaxDepth:max_depth;
	   if (obj==undefined)return "undefined";
	   if (obj==null)return "null";
	   var t=typeof(obj);
       var spacing=this.repeatStr("  ",level+1);
	   if (level>=max_depth){
	       return ("["+t+"]"+obj).truncate(100).gsub(/\n/,"\\n");
	   } else if (level>0 && Logger.uninspectClasses.indexOf(obj.constructor)>-1){
	       return (""+obj).truncate(100).gsub(/\n/,"\\n");
	   } else if (obj.constructor==Function){
	       return "[function]";
	   } else if (obj.constructor != String && obj.length && obj.length.constructor == Number) {
	       if (level==0)
	           max_depth++;
	       var s="[\n";
	       for(var i=0;i<obj.length;i++)
	           s+=(spacing+i+":"+Logger.inspect(obj[i],Logger.excludeFunction,level+1,max_depth)+"\n");
	       s+="]";
	       return "["+t+"]"+s;
	   } else {
	       var s="";
	       var attrs = this.sortedAttributes(obj,predicate);
	       attrs.each(function(attr){
	           if (!s.endWith("\n"))
	               s+="\n";
	           var value = Logger.inspect(obj[attr],Logger.excludeFunction,level+1,max_depth);
  	           s+=(spacing+attr+":"+value+"\n");
	       });
	       return "["+t+"]\n"+s;
	   }
	},
	isActiveOnLoad: function(){
	   return document.cookie.indexOf("loggerActive=true");
	},
	setActiveOnLoad:function(value){
	   document.cookie = ("loggerActive="+(value?"true":"false"));
	}
});
Logger.prototype = {
    initialize: function(element,logs){
        this.logs=logs||"";
        this.setElement($(element));
    },
    append:function(logs) {
        if (!this.appendingType){
        }else if (this.appendingType=="dom"){
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
            ((/body|div/i).test(this.element.tagName))?"textNode":
            ((/input|textarea/i).test(this.element.tagName))?"value":"innerHTML";
        this.append(logs);
    },
    formatMsg: function(level,msg,t){
        t=t||new Date();
        return Logger.formatDate(t)+"["+level+"] "+msg;
    },
    showWindow:function(windowName){
        if (this.window)
            return;
        windowName=windowName||"loggerWindow";
        this.window = window.open('',windowName,"resizable=yes,scrollbars=yes,top=0,left=0");
        this.setElement(this.window.document.documentElement||this.window.document.body);
    },
    toLogStr: function(level,args){
        var s="";
        if (args.length>0) 
            s = this.formatMsg(level,args[0]);
        for(var i=1;i<args.length;i++)
            s += ("\n arguments["+i+"] \n"+ Logger.inspect(args[i]));
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
if (top && top.tracer) {
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
    if(Logger.isActiveOnLoad())
        logger.showWindow();
}


