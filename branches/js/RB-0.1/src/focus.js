/**
 * focus.js
 * 
 * require 
 *     prototype.js 
 *     prototype_ext.js 
 *
 * optional
 *     effects.js
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
Object.extend(HTMLElement.Focus.Highlight.DefaultOptions, 
    (window["Effect"] && Effect.Highlight) ?
        {   focusEffect: function(event){
                new Effect.Highlight(Event.element(event));
            },
            blurEffect: null } :
            
        {   focusEffect: function(event){
                var element = Event.element(event);
                element.style.backgroundColor = "#ffcccc";
            },
            blurEffect: function(event){
                var element = Event.element(event);
                element.style.backgroundColor = "";
            } }
);

Event.observe(window, "load", function(event){
    HTMLElement.Focus.Highlight.DefaultOptions.element =
        (/MSIE/.test(navigator.appVersion)) ? document.body : document.documentElement; 
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
        
        //2006/09/28現在、IE以外で一括でフォーカスをゲットする方法が分からないっす。
        if (!/MSIE/.test(navigator.appVersion)){
            if (window["logger"])
                logger.warn("IE以外のブラウザでは、HTMLElement.Focus.Highlightは無効です");
            return;
        }
        if (HTMLElement.Focus.Highlight.waitingList){
            HTMLElement.Focus.Highlight.waitingList.push(this);
            return;
        }
        if (!this.element)
            throw new Error("element not specified.");
        if (this.options.focusEffect){
            if (!this.focusedHandler)
                this.focusedHandler = this.focused.bindAsEventListener(this);
            Event.observe(this.element, this.options.focusEventName,
                this.focusedHandler, false);
        }
        if (this.options.blurEffect){
            if (!this.blurHandler)
                this.blurHandler = this.blured.bindAsEventListener(this); 
            Event.observe(this.element, this.options.blurEventName, 
                this.blurHandler, false);
        }
    },
    deactivate: function(){
        if (HTMLElement.Focus.Highlight.waitingList){
            HTMLElement.Focus.Highlight.waitingList.remove(this);
            return;
        }
        if (this.focusedHandler){
            Event.stopObserving(this.element, this.options.focusEventName,
                this.focusedHandler, false);
            this.focusedHandler = null;
        }
        if (this.blurHandler){
            Event.stopObserving(this.element, this.options.blurEventName, 
                this.blurHandler, false);
            this.blurHandler = null;
        }
    },
    focused: function(event){
        var element = Event.element(event);
        if (element==window || element==document || 
            element==document.body || element==document.documentElement)
            return;
        this.options.focusEffect(event);
    },
    blured: function(event){
        var element = Event.element(event);
        if (element==window || element==document || 
            element==document.body || element==document.documentElement)
            return;
        this.options.blurEffect(event);
    }
}
