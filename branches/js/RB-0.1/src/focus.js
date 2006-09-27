/**
 * focus.js
 * 
 * require 
 *     prototype.js 
 *     prototype_ext.js 
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */
 
if (window["HTMLElement"]) HTMLElement = {};

HTMLElement.Focus = {};

HTMLElement.Focus.Highlight = Class.create();
HTMLElement.Focus.Highlight.DefaultOptions = {
    activateSoon: true
};
HTMLElement.Focus.Highlight.waitingList = [];

Object.extend(HTMLElement.Focus.Highlight.DefaultOptions, 
    (/MSIE/.test(navigator.appVersion)) ?
        {   focusEventName: "focusin",
            blurEventName: "focusout" } :
            
        {   focusEventName: "focus",
            blurEventName: "blur" }
);
Event.observe(window, "load", function(event){
    HTMLElement.Focus.Highlight.DefaultOptions.element =
        (/MSIE/.test(navigator.appVersion)) ? document.body : document; 
    var waitingList = HTMLElement.Focus.Highlight.waitingList;
    HTMLElement.Focus.Highlight.waitingList = null;
    for(var i = 0; i < waitingList.length; i++) {
        var item = waitingList[i];
        item.element = item.element || HTMLElement.Focus.Highlight.DefaultOptions.element;
        item.activate();
    }
});


HTMLElement.Focus.Highlight.prototype = {
    initialize: function(element, options){
        this.options = Object.fill(options||{}, HTMLElement.Focus.Highlight.DefaultOptions);
        this.element = element || this.options.element;
        if (this.options.activateSoon)
            this.activate();
    },
    activate: function(){
        if (HTMLElement.Focus.Highlight.waitingList){
            HTMLElement.Focus.Highlight.waitingList.push(this);
            return;
        }
        if (!this.element)
            throw new Error("element not specified.");
        logger.debug("activate: this.options.focusEventName=" + this.options.focusEventName);
        Event.observe(this.element, this.options.focusEventName, this.focused.bindAsEventListener(this), false);
        //Event.observe(this.element, this.options.blurEventName, this.blured.bindAsEventListener(this), false);
    },
    focused: function(event){
        var element = Event.element(event);
        if (element==window || element==document || 
            element==document.body || element==document.documentElement)
            return;
        
        //logger.debug("focused", element);
        
        new Effect.Highlight(element, {startcolor: '#ff7777'});
    },
    blured: function(event){
    }
}
