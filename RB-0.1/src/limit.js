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
    initialize: function(field, predicate, options){
        this.options = Object.fill(options||{}, HTMLInputElement.KeyLimit.DefaultOptions); 
        this.field = field;
        this.predicate = predicate;
        if (this.options.activateSoon)
            this.activate();
    },
    
    activate: function(){
        var actions = [
		    {matchAll:true, method: this.keyDown.bind(this), event:"keydown", stopEvent:false}
		];
		this.keyHandler = new Event.KeyHandler(this.field, actions);
    },
    
	keyDown: function(event) {
	   if (!this.predicate(event))
	       Event.stop(event);
	}
}
Object.extend(HTMLInputElement.KeyLimit.prototype, HTMLInputElement.KeyLimit.Methods);


HTMLInputElement.CharConvertable = Class.create();
HTMLInputElement.CharConvertable.DefaultOptions = {
    "activateSoon": true
};
HTMLInputElement.CharConvertable.Methods = {
    initialize: function(field, convertor, options){
        this.options = Object.fill(options||{}, HTMLInputElement.CharConvertable.DefaultOptions);
        this.field = field;
        this.convertor = convertor;
        if (this.options.activateSoon)
            this.activate();
    },
    
    activate: function(){
        var actions = [
		    {matchAll:true, method: this.keyDown.bind(this), event:"keydown", stopEvent:false}
		];
		this.keyHandler = new Event.KeyHandler(this.field, actions);
    },
    
	keyDown: function(event) {
	    var charCode = Event.getCharCode(event);
		if (charCode){
    		var c = String.fromCharCode(charCode);
    		try{
        		var cc = this.convertor(c,event);
        		HTMLInputElement.setSelectedText(this.field, cc);
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


