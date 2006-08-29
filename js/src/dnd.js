/**
 * dnd.js
 * 
 * require prototype.js only
 *
 * @copyright T.Akima
 * @license LGPL
 */

DnD = {};
DnD.DOM = {
	getAncestorByTag: function( node, tagName ) {
		for(var current = node; current != null; current = current.parentNode) {
			if (current.tagName == tagName)
				return current;
		}
		return null;
	},
	
	getAncestorByClassName: function( node, className ) {
		for(var current = node; current != null; current = current.parentNode) {
			try{
				if (Element.hasClassName(current, className))
					return current;
			} catch(e) { 
			}
		}
		return null;
	}
}
DnD.Control = {
	getAbsolutePosition: function( element, container ) {
		var result = { x:0, y:0 };
		var target = element;
		while( target && target != container ) {
			result.x += target.offsetLeft;
			result.y += target.offsetTop;
			target = target.offsetParent;
		}
		return result;
	}	
}
DnD.SortableTable = Class.create();
DnD.SortableTable.DefaultOptions = {
    "dragRect": {
        "offsetLeft": -5,
        "offsetTop":  -5,
        "offsetWidth": 6,
        "offsetHeight": 6,
        "borderColor": "#F00",
        "borderStyle": "dotted",
        "borderWidth": "2px"
    },
    "listen_mousemove": (navigator.appName == "Microsoft Internet Explorer") ? true : false
}
DnD.SortableTable.prototype = {
	initialize: function(tables, options) {
		this.active = false;
		this.tables = (!tables) ? [] : (tables.constructor == Array) ? tables : [ tables ];
		this.tables = this.tables.collect( function(table){return $(table);} );
		this.options = Object.extend( $H(DnD.SortableTable.DefaultOptions), options || {} );
		this.clickHandler = this.click.bindAsEventListener(this);
		this.mousedownHandler = this.mousedown.bindAsEventListener(this);
		this.mousemoveHandler = this.mousemove.bindAsEventListener(this);
		this.mouseupHandler = this.mouseup.bindAsEventListener(this);
		this.activate();
	},
	
	activate: function() {
        for(var i = 0; i < this.tables.length; i++) {
    	   var t = this.tables[i];
    	   Event.observe( t, "click", this.clickHandler, false);
    	   Event.observe( t, "mousedown", this.mousedownHandler, false);
    	   Event.observe( t, "mouseup", this.mouseupHandler, true);
    	   if (this.options["listen_mousemove"])
    	       Event.observe( t, "mousemove", this.mousemoveHandler, true);
        }
        this.active = true;
	},
	
	deactivate: function() {
        for(var i = 0; i < this.tables.length; i++) {
            var t = this.tables[i];
            Event.stopObserving( t, "click", this.clickHandler, false);
            Event.stopObserving( t, "mousedown", this.mousedownHandler, false);
            Event.stopObserving( t, "mouseup", this.mouseupHandler, true);
            if (this.options["listen_mousemove"])
                Event.stopObserving( t, "mousemove", this.mousemoveHandler, true);
        }
        this.active = false;
	},
	
	toggle: function(activation) {
		activation = (activation != undefined) ? activation : !this.active; 
		if (activation)
			this.activate();
		else
			this.deactivate();
	},
	
	click: function(event) {
		this.hideDragRect();
		this.draggingRow = null;
	},
	
	mousedown: function(event) {
		var tr = this.getDraggingRow(event);
		if (tr) {
			this.beginDragging(tr);
			this.showDragRect(tr);
		}
	},
	
	mousemove: function(event) {
		if (!this.draggingRow)
			return;
		if (!Event.isLeftClick(event)) {
			this.mouseup(event);
			return;
		} 
		var tr = this.getAcceptingRow(event);
		if (tr) {
			this.showDragRect(tr);
		}
	},
	
	mouseup: function(event) {
		if (!this.draggingRow)
			return;
		var tr = this.getAcceptingRow(event);
		if (tr) {
			this.hideDragRect();
			this.moveDraggingRowTo(tr);
		}
	},
	
	getDraggingRow: function(event) {
		var t = Event.element(event);
		var tr = DnD.DOM.getAncestorByTag(t, "TR");
		return tr;
	},
	
	getAcceptingRow: function(event, dragginRow) {
		var t = Event.element(event);
		var tr = DnD.DOM.getAncestorByTag(t, "TR");
		return tr;
	},
	
	seqRowIndex: function(tr) {
	   if (!tr)
	       return null;
	   var result = 0;
	   var table = DnD.DOM.getAncestorByTag(tr, "TABLE");
	   var tableIndex = this.tables.indexOf(table);
	   for(var i = 0; i < tableIndex; i++) {
	       var t = this.tables[i];
	       for(var j = 0; j < t.tBodies.length; j++ ) {
	           result = result + t.tBodies[j].rows.length;
	       }
	   }
	   return result + tr.rowIndex;
	},
	
	moveDraggingRowTo: function(tr) {
		var draggingRow = this.endDragging();
		var drIndex = this.seqRowIndex(draggingRow);
		var trIndex = this.seqRowIndex(tr);
		if (drIndex == trIndex) {
			return;
		} else if (drIndex > trIndex) {
			tr.parentNode.insertBefore( draggingRow, tr);
		} else if (drIndex < trIndex) {
			if (tr.nextSibling != null)
				tr.parentNode.insertBefore( draggingRow, tr.nextSibling);
			else
				tr.parentNode.appendChild( draggingRow );
		}
		var f = this["afterMoveRow"];
		if (f)
			f.apply(this, [draggingRow])
	},
	
	beginDragging: function(tr) {
		this.draggingRow = tr;
		this.onselectstartBackup = document.body.onselectstart;
		document.body.onselectstart = function(){ return false; };
	},
	
	endDragging: function() {
		if (!this.draggingRow)
			return null;
		var result = this.draggingRow;
		this.draggingRow = null;
		document.body.onselectstart = this.onselectstartBackup;
		this.onselectstartBackup = null;
		return result;
	},
	
	showDragRect: function(tr) {
		this.dragRect = this.dragRect || this.createDragRect();
		this.dragRect.style.width = (tr.offsetWidth + this.options.dragRect.offsetWidth)+ "px";
		this.dragRect.style.height = (tr.offsetHeight + this.options.dragRect.offsetHeight)+ "px";
		var trPosition = DnD.Control.getAbsolutePosition(tr);
		this.dragRect.style.top = (trPosition.y + this.options.dragRect.offsetTop)  + "px";
		this.dragRect.style.left = (trPosition.x + this.options.dragRect.offsetLeft) + "px";
		this.dragRect.style.display = "";
	},
	
	hideDragRect: function() {
		this.dragRect.style.display = "none";
	},
	
	createDragRect: function() {
		var rect = document.createElement("DIV");
		rect.style.position = "absolute";
		rect.style.backgroundColor = "transparent";
		rect.style.borderWidth = this.options.dragRect.borderWidth;
		rect.style.borderStyle = this.options.dragRect.borderStyle;
		rect.style.borderColor = this.options.dragRect.borderColor;
		document.body.appendChild(rect);
		return rect;
	}
	
}
