/**
 * limit.js
 * 
 * require 
 *    prototype.js
 *    prototype_ext.js
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

HTMLInputElement.KeyLimit = Class.create();
HTMLInputElement.KeyLimit.DefaultOptions = {
    "activateSoon": true
};
HTMLInputElement.KeyLimit.Methods = {
    initialize: function(fields, predicate, options){
        this.options = Object.fill(options||{}, HTMLInputElement.KeyLimit.DefaultOptions); 
        this.fields = fields;
        this.predicate = predicate;
        if (this.options.activateSoon)
            this.activate();
    },
    
    activate: function(){
        var actions = [
		    {matchAll:true, method: this.keyDown.bind(this), event:"keydown", stopEvent:false}
		];
		this.keyHandler = new Event.KeyHandler(this.fields, actions);
    },
    
	keyDown: function(event) {
	   if (!this.predicate(event)){
	       if (this.options.warnMsg && window["Pane"]){
	           Pane.Balloon.warn(event, this.options.warnMsg);
	       }
	       Event.stop(event);
	   }
	}
}
Object.extend(HTMLInputElement.KeyLimit.prototype, HTMLInputElement.KeyLimit.Methods);


HTMLInputElement.CharConvertable = Class.create();
HTMLInputElement.CharConvertable.DefaultOptions = {
    "activateSoon": true
};
HTMLInputElement.CharConvertable.Methods = {
    initialize: function(fields, convertor, options){
        this.options = Object.fill(options||{}, HTMLInputElement.CharConvertable.DefaultOptions);
        this.fields = fields;
        this.convertor = convertor;
        if (this.options.activateSoon)
            this.activate();
    },
    
    activate: function(){
        var actions = [
		    {matchAll:true, method: this.keyDown.bind(this), event:"keydown", stopEvent:false}
		];
		this.keyHandler = new Event.KeyHandler(this.fields, actions);
    },
    
	keyDown: function(event) {
	    var charCode = Event.getCharCode(event);
	    var field = Event.element(event);
		if (charCode){
    		var c = String.fromCharCode(charCode);
    		try{
        		var cc = this.convertor(c,event);
        		HTMLInputElement.setSelectedText(field, cc);
        		Event.stop(event);
    		}catch(ex){
    		    if (ex==$continue) return;
    		    if (ex==$break){
    		        Event.stop(event);
    		        return;
    		    }
    		    throw ex;
    		}
		}
	}
}
Object.extend(HTMLInputElement.CharConvertable.prototype, HTMLInputElement.CharConvertable.Methods);


