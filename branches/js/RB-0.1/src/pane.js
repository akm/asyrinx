/**
 * pane.js
 * 
 * require 
 *     prototype.js 
 *     effects.js 
 *     prototype_ext.js
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

Pane = {};

Pane.Draggable = Class.create();
Pane.Draggable.prototype = {
	initialize: function(draggingPane, draggedPane) {
		this.draggingPane = $(draggingPane);
		this.draggingPane.style.cursor = "default";
		this.draggedPane = $(draggedPane);
		this.dragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
		this.shim = HTMLIFrameElement.Shim.create(draggedPane);
		Event.observe(this.draggingPane, 'mousedown', this.draggingPaneMouseDown.bindAsEventListener(this), true);
		Event.observe(this.draggedPane, 'mousedown', this.draggedPaneMouseDown.bindAsEventListener(this), true);
		Event.observe(document, 'mousemove', this.draggingPaneMouseMove.bindAsEventListener(this), true);
		Event.observe(document, 'mouseup', this.draggingPaneMouseUp.bindAsEventListener(this), true);
	},
	
	draggingPaneMouseMove: function(e) {
		if (!this.dragging)
			return;
		var curX = Event.pointerX(e);
		var curY = Event.pointerY(e);
		this.draggedPane.style.left = (curX-this.dragOffsetX)+"px";
		this.draggedPane.style.top  = (curY-this.dragOffsetY)+"px";
		Event.stop(e);
	},
	
	draggingPaneMouseDown: function(e) {
		var t = Event.element(e);
		if (t != this.draggingPane)
			return;
		this.dragging = true;
		var left = this.draggingPane.offsetLeft + this.draggedPane.offsetLeft;
		var top = this.draggingPane.offsetTop + this.draggedPane.offsetTop;
		var curX = Event.pointerX(e);
		var curY = Event.pointerY(e);
		this.dragOffsetX = curX - left
		this.dragOffsetY = curY - top;
		HTMLElement.bringToFront(this.draggedPane);
		this.shim.fit();
		Event.stop(e);
	},
	
	draggingPaneMouseUp: function(e) {
		this.dragging = false;
		this.dragOffsetX = 0;
		this.dragOffsetY = 0;
	},
	
	draggedPaneMouseDown: function(e) {
		var t = Event.element(e);
		if (t != this.draggedPane)
			return;
		HTMLElement.bringToFront(this.draggedPane);
		Event.stop(e);
	}
}

Pane.Closable = Class.create();
Pane.Closable.prototype = {
	initialize: function(openBtn, closeBtn, panelBodyIds) {
		this._openBtn = $(openBtn); 
		this._closeBtn = $(closeBtn);
		this.panelBodyIds = panelBodyIds;
		Event.observe(this._closeBtn, 'click', this.close.bindAsEventListener(this), true);
		Event.observe(this._openBtn, 'click', this.open.bindAsEventListener(this), true);
	},
	showOpenButton: function() {
		Element.hide(this._closeBtn);
		Element.show(this._openBtn);
	},
	showCloseButton: function() {
		Element.show(this._closeBtn);
		Element.hide(this._openBtn);
	},
	open: function() {
		this.showCloseButton();
		this.panelBodyIds.each(function(bodyId){ Element.show($(bodyId)); });
	},
	close: function() {
		this.showOpenButton();
		this.panelBodyIds.each(function(bodyId){ Element.hide($(bodyId)); });
	}
}

Pane.CheckingClosable = Class.create();
Pane.CheckingClosable.prototype = {
	initialize: function(checkable, panelBodyIds, reverse) {
		this.reverse =  reverse || false;
		this.checkable = $(checkable); 
		this.panelBodyIds = panelBodyIds;
		Event.observe(this.checkable, 'click', this.checkableOnClick.bindAsEventListener(this), false);
	},
	doOnClick: function() {
		var checkedValue = this.checkable.checked;
		if (this.reverse)
			checkedValue = ! checkedValue;
		if (checkedValue) {
			this.open();
		} else {
			this.close();
		}
	},
	open: function() {
		this.panelBodyIds.each(function(bodyId){ Element.show($(bodyId)); });
	},
	close: function() {
		this.panelBodyIds.each(function(bodyId){ Element.hide($(bodyId)); });
	},
	checkableOnClick: function(e) {
		this.doOnClick();
	},
	updateCheckable: function() {
		this.doOnClick();
	}
}

Pane.RadioClosable = Class.create();
Pane.RadioClosable.prototype = {
	initialize: function() {
		this._radioPaneMap = new Map();
		this._paneNameSet = [];
	},
	
	add: function(radioBtnId, mappedPaneNameArray) {
		var radioBtn = $(radioBtnId);
		if (! radioBtn){
			alert(radioBtnId + " was not found");
		}
		Event.observe(radioBtn, "click", this.radioBtnClick.bindAsEventListener(this), false);
		this._radioPaneMap.put(radioBtn, mappedPaneNameArray);
		//
		for (i = 0; i < mappedPaneNameArray.length; i++) {
			var panelName = mappedPaneNameArray[i];
			this._paneNameSet.push( panelName );
		}
	},
	
	radioBtnClick: function(event) {
		this.refresh();
	},
	
	refresh: function() {
		Pane.setPanelDisplay(this._paneNameSet.distinct(), "none");
		//
		var radios = this._radioPaneMap.keySet();
		for(var i = 0; i < radios.size(); i++){
			var radio = radios.get(i);
			if (radio.checked) {
				var paneNameArray = this._radioPaneMap.get( radio );
				Pane.setPanelDisplay(paneNameArray, "");
			}
		}
	}
};

Pane.SelectClosable = Class.create();
Pane.SelectClosable.prototype = {
	initialize: function(select){
		this.optionPaneMap = {};
		this.paneNames = [];
		this.select = $(select);
		Event.observe(this.select, 'change', this.doOnChange.bindAsEventListener(this), false);
	},
	
	_add: function(optionTag, mappedPaneNameArray) {
		if (! optionTag) {
			alert(optionId + " was not found");
		}
		this.optionPaneMap[optionTag.value] = mappedPaneNameArray;
		for (i = 0; i < mappedPaneNameArray.length; i++) {
			var panelName = mappedPaneNameArray[i];
			this.paneNames.push( panelName );
		}
	},
	
	add: function(optionId, mappedPaneNameArray) {
		var optionTag = $(optionId);
		this._add(optionTag, mappedPaneNameArray);
	},
	
	addByValue: function(optionValue, mappedPaneNameArray) {
		for(i = 0; i < this.select.options.length; i++ ) {
			var option = this.select.options[i];
			if (option.value == optionValue) {
				this._add(option, mappedPaneNameArray);
				return;
			}
		}
		alert("option not found for " + optionValue);
	},
	
	refresh: function() {
		this.paneNames.unique().each(function(paneId){ Element.hide($(paneId)); });
		//
		var selIndex = this.select.selectedIndex;
		var option = this.select.options[ selIndex ];
		var paneNameArray = this.optionPaneMap[option.value];
		paneNameArray.each(function(paneId){ Element.show($(paneId)); });
	},
	
	doOnChange: function( e ) {
		this.refresh();
	}
}

Pane.PositionKeeper = Class.create();
Pane.PositionKeeper.prototype = {
    initialize: function( target, delay, parent ) {
        this.target = $(target);
        this.delay = delay||500;
        this.parent = parent||document.documentElement||document.body;
        this.rememberPosition();
        Event.observe(window, "scroll", this.windowScrolled.bindAsEventListener(this), false);
    },
    rememberPosition: function() {
        this.parentScrollLeft = this.parent.scrollLeft;
        this.parentScrollTop = this.parent.scrollTop;
    },
    windowScrolled: function( event ) {
        this.when_scrolling = new Date();
        setTimeout(this.firePositionKeeping.bind(this, this.when_scrolling), this.delay);
    },
    firePositionKeeping: function( timestamp ) {
        if (timestamp != this.when_scrolling)
            return;
	    var pos = Position.positionedOffset(this.target)
	    var x = pos[0] + (this.parent.scrollLeft - this.parentScrollLeft);
	    var y = pos[1] + (this.parent.scrollTop - this.parentScrollTop);
        this.keepPosition(x, y);
        this.rememberPosition();
    },
    keepPosition: function(x, y) {
	   new Effect.Move( this.target, {x:x, y:y, mode:"absolute"});
    }
}

Pane.Tip = Class.create();
Pane.Tip.prototype = {
    initialize: function( pane, icon, events ) {
        this.pane = $(pane);
        this.icon = $(icon);
        this.keep_showing = false;
        events = events || ["mouseover", "mouseout", "click"]
        for(var i = 0; i < events.length; i++)
            Event.observe(this.icon, events[i], this.handleEvent.bindAsEventListener(this));
        Event.observe(this.pane, "click", this.paneClicked.bindAsEventListener(this));
        Element.hide( this.pane );
        this.pane.style.position = "absolute";
    },
    
    handleEvent: function(event) {
        this.toggleTips( event );
    },
    
    paneClicked: function(event) {
        if (!this.keep_showing)
            return;
        if (Event.element(event) == this.pane)
            this.hide( event );
        this.keep_showing = false;
    },
    
    toggleTips: function( event ) {
       if (event.type == "click")
          this.keep_showing = !this.keep_showing;
       var visible = (event.type == "mouseover") ? false : 
                        (event.type == "mouseout") ? true : 
                        Element.visible(this.pane);
       if ( visible ) {
           if (this.keep_showing)
             return;
           this.hide( event );
       } else {
           this.show( event );
       }
    },
    
    show: function(event) {
        var x = Event.pointerX(event);
        var y = Event.pointerY(event);
        Element.show(this.pane);
        this.pane.style.left = x + "px";
        this.pane.style.top = y + "px";
    },
    
    hide: function(event) {
        Element.hide(this.pane);
    }
}

Pane.RoundCorner = Class.create();
Pane.RoundCorner.DefaultOptions = {
	outerColor: "transparent",
	size: 8
}
Pane.RoundCorner.prototype = {
	initialize: function(element,options) {
		this.element = element;
		this.options = Object.fill(options||{}, Pane.RoundCorner.DefaultOptions);
		this.options.innerColor = this.options.innerColor || Element.getStyle(element, "background-color");
		this.size = this.options.size;
		this.addTopPart();
		this.addBottomPart();
	},
	
	addTopPart: function() {
		var d = document.createElement("b");
		d.style.display="block";
		this.element.parentNode.insertBefore(d, this.element);
		var border = {
		    width: Element.getStyle(this.element, "borderTopWidth")||"",
		    style: Element.getStyle(this.element, "borderTopStyle")||"",
		    color: Element.getStyle(this.element, "borderTopColor")||""
		}
		Element.setStyle(this.element, {"borderTopWidth": "0px"});
		var borderWidth = (border.width.toNumeric() || border.width) * 1 || 0;
		for(var i=this.size-1;i>-1;i--){
		    var x = this.createLine(i, (i>(this.size-borderWidth-1))?border:null);
		    d.appendChild(x);
		}
	},
	
	addBottomPart: function() {
		var d = document.createElement("b");
		d.style.display="block";
		if (this.element.nextSibling)
    		this.element.parentNode.insertBefore(d, this.element.nextSibling);
        else
    		this.element.parentNode.appendChild(d);
		var border = {
		    width: Element.getStyle(this.element, "borderBottomWidth")||"",
		    style: Element.getStyle(this.element, "borderBottomStyle")||"",
		    color: Element.getStyle(this.element, "borderBottomColor")||""
		}
		Element.setStyle(this.element, {"borderBottomWidth": "0px"});
		var borderWidth = (border.width.toNumeric() || border.width) * 1 || 0;
		for(var i=0;i<this.size;i++){
		    var x = this.createLine(i, (i>(this.size-borderWidth-1))?border:null);
		    d.appendChild(x);
		}
	},
	
	createLine: function(index, border){
	    var x = document.createElement("b");
		x.style.display="block";
	    x.style.backgroundColor = (border) ? border.color : this.options.innerColor;
	    x.style.overflow="hidden";
	    x.style.height="1px";
	    //index += 1;
	    var marginWidth = this.size - Math.sqrt(this.size*this.size - index*index);
	    x.style.margin = "0 " + Math.floor(marginWidth) + "px";
	    
	    x.style.borderRightWidth = this.calcBorderWidth(Element.getStyle(this.element, "borderRightWidth"), index);
	    x.style.borderRightStyle = Element.getStyle(this.element, "borderRightStyle");
	    x.style.borderRightColor = Element.getStyle(this.element, "borderRightColor");
	    x.style.borderLeftWidth = this.calcBorderWidth(Element.getStyle(this.element, "borderLeftWidth"), index);
	    x.style.borderLeftStyle = Element.getStyle(this.element, "borderLeftStyle");
	    x.style.borderLeftColor = Element.getStyle(this.element, "borderLeftColor");
	    return x;
	},
	calcBorderWidth: function(borderWidth, y){
	    if (!/\d/.test(borderWidth))
	        return borderWidth;
	    var bw = borderWidth.toNumeric() * 1;
	    var r = this.size;
        var r2 = (r-bw)*(r-bw) - y*y;
        if (r2<=0) r2 = -r2
        var x1 = Math.sqrt( r*r - y*y ) ;
	    return Math.abs(Math.round( Math.sqrt(r2) - x1)) + borderWidth.gsub(/\d/, "");
	}
}

