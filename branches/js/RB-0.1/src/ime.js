/**
 * ime.js
 * 
 * require 
 *    prototype.js
 *    prototype_ext.js
 *    string_jp.js
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

HTMLInputElement.RomajiComplete = Class.create();
HTMLInputElement.RomajiComplete.DefaultOptions = {
    "activateSoon": true,
    "kanaType": "katakana" //"hiragana"
};
HTMLInputElement.RomajiComplete.prototype = {
    initialize: function(handlingField, destField, options){
        this.options = Object.fill(options||{}, HTMLInputElement.RomajiComplete.DefaultOptions); 
        this.handlingField = handlingField;
        this.destField = destField;
        this.buffer = "";
        this.convertor = String.Japanese.Romaji.create(this.options["kanaType"]);
        this.convertor.convertLastN = false;
        if (this.options.activateSoon)
            this.activate();
    },
    
    activate: function(){
        var actions = [
		    {event:"keydown,keyup", key: Event.KEY_BACK_SPACE, alt:false, method: this.keyDownBackSpace.bind(this)},
		    {key: Event.KEY_DELETE, alt:false, method: this.keyUpDelete.bind(this)},
		    {key: Event.KEY_RETURN, method: this.keyUpReturn.bind(this)},
		    {matchAll:true, method: this.keyUp.bind(this)}
		];
		actions.each(function(action){
		    if (!action["event"]) action["event"] = "keyup";
		    if (!action["stopEvent"]) action["stopEvent"] = false;
		});
		this.keyHandler = new Event.KeyHandler(this.handlingField, actions);
    },
    
    
	clearKanaIfSourceEmpty: function() {
		var s = this.handlingField.value;
		var len = (s) ? s.length : -1;
		if (len < 1) {
			HTMLElement.setValue(this.destField, "");
			this.buffer = "";
		}
	},
	
    keyDownBackSpace: function(event){  
        if (event.type=="keydown") {
            if (this.buffer.length > 0){
                this.buffer = this.buffer.substring(0, this.buffer.length-1);
            }else{
                var destStr = HTMLElement.getValue(this.destField) || "";
                HTMLElement.setValue(this.destField, destStr.substring(0, destStr.length-1));
            }
        } else {
            this.clearKanaIfSourceEmpty();
        }
    },
    
    keyUpDelete: function(event){
        this.clearKanaIfSourceEmpty();
    },
    
    keyUpReturn: function(event){
        this.appendFromBuffer();
    },
    
    appendFromBuffer: function(additionalValue) {
        var destStr = HTMLElement.getValue(this.destField) || "";
        destStr += this.buffer;
        this.buffer = "";
        if (additionalValue)
            destStr += additionalValue;
        HTMLElement.setValue(this.destField, destStr);
    },
    
	keyUp: function(event) {
		var charCode = Event.getCharCode(event);
		if (!charCode)
		    return;
		var c = String.fromCharCode(charCode);
		if (String.Character.isAlphabet(charCode) || (c == "-")) {
		    this.buffer += c;
		    var conv = this.convertor.toKana(this.buffer);
		    if (conv != this.buffer) {
		        this.buffer = conv;
		        this.appendFromBuffer();
		    }
		} else {
		    this.appendFromBuffer(c);
		}
	}

}
