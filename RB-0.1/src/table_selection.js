/**
 * table_selection.js
 * 
 * require prototype.js only
 *
 * @copyright T.Akima
 * @license LGPL
 */

if (!window["HTMLTableElement"]) {
    HTMLTableElement = {};
}

HTMLTableElement.RowSelection = {};
HTMLTableElement.RowSelection.DefaultOptions = {
    color: "#FFFFFF",
    backgroundColor: "#93A070",
    listen: "tBodies",
    activateSoon: true,
    rotation: true
};
HTMLTableElement.RowSelection.Methods = {
    initialize: function(table, options) {
        this.table = $(table);
        this.options = Object.fill(options || {}, HTMLTableElement.RowSelection.DefaultOptions);
	    this.selectRow = this.options['selectRow'] || this.selectRow;
        this.deselectRow = this.options['deselectRow'] || this.deselectRow;
		if (this.options.activateSoon)
    		this.activate();
    },
    getTargets: function() {
        if (this.options.listen.constructor != Array)
            this.options.listen = [this.options.listen];
        var result = [];
        if (this.options.listen.length < 1) {
            result.push(this.table);
        } else {
            for(var i = 0; i < this.options.listen.length; i++) {
                var targetName = this.options.listen[i];
                var targets = this.table[targetName];
                targets = (targetName.endWith("s")) ? targets : [targets];
                for(var j = 0; j < targets.length; j++)
                    result.push(targets[j]);
            }
        }
        return result;
    },
    selectRow: function(row, event) {
        if (!row)
            return;
        row.style.backgroundColor = this.options.backgroundColor;
        row.style.color = this.options.color;
        if (this.options['select'])
            this.options.select(event, row, this);
    },
    deselectRow: function(row, event) {
        if (!row)
            return;
        row.style.backgroundColor = "";
        row.style.color = "";
        if (this.options['deselect'])
            this.options.deselect(event, row, this);
    },
    getFirstRow: function() {
        if (!this.targets)
            return null;
        for(var i = 0; i < this.targets.length; i++) {
            var target = this.targets[i];
            for(var j = 0; j < target.rows.length; j++) {
                return target.rows[j];
            }
        }
        return null;
    },
    getLastRow: function() {
        if (!this.targets)
            return null;
        for(var i = this.targets.length -1; i > -1; i--) {
            var target = this.targets[i];
            for(var j = target.rows.length -1; j > -1; j--) {
                return target.rows[j];
            }
        }
        return null;
    },
    
    moveTo: function(siblingName, methodName, event) {
        var current = this.row;
        var dest = ((current) ? current[siblingName] : this[methodName]()) || ((this.options.rotation) ? this[methodName]() : null);
        if (!dest)
            return;
        this.row = dest;
        this.selectRow(dest, event);
        this.deselectRow(current, event);
    },
    
    next: function(event) {
        this.moveTo("nextSibling", "getFirstRow");
    },
    
    prev: function(event) {
        this.moveTo("previousSibling", "getLastRow");
    }
};

HTMLTableElement.ClickRowSelection = Class.create();
HTMLTableElement.ClickRowSelection.DefaultOptions = {
    mode: "single" //single or multi
};
HTMLTableElement.ClickRowSelection.prototype = {
    initialize: function(table, options) {
        this.options = Object.fill(options || {}, HTMLTableElement.ClickRowSelection.DefaultOptions);
        HTMLTableElement.RowSelection.Methods.initialize.apply(this, [table, this.options]);
    },
    activate: function() {
        if (!this.tableClickHandler)
            this.tableClickHandler = this.tableClick.bindAsEventListener(this);
        this.targets = this.getTargets();
        for(var i = 0; i < this.targets.length; i++)
           Event.observe(this.targets[i], "click", this.tableClickHandler, false);
    },
    deactivate: function() {
        if (!this.tableClickHandler || !this.targets)
            return;
        for(var i = 0; i < this.targets.length; i++)
           Event.stopObserving(this.targets[i], "click", this.tableClickHandler, false);
    },
    tableClick: function(event) {
        var row = Element.findAncestorByTagName(Event.element(event), "TR");
        if (this.options.mode == "single") {
            if (this.row == row) {
                this.deselectRow(this.row, event);
                this.row = null;
            } else if (this.row == null) {
                this.selectRow(row, event);
                this.row = row;
            } else {
                this.deselectRow(this.row, event);
                this.selectRow(row, event);
                this.row = row;
            }
        } else {
            if (!this.rows)
                this.rows = [];
            if (this.rows.contains(row)) {
                this.deselectRow(row, event);
                this.rows.remove(row);
            } else {
                this.selectRow(row, event);
                this.rows.push(row);
            }
        }
    }
};
Object.extend(HTMLTableElement.ClickRowSelection.prototype, HTMLTableElement.RowSelection.Methods);

HTMLTableElement.MouseOverRowSelection = Class.create();
HTMLTableElement.MouseOverRowSelection.DefaultOptions = {
    "deselectOnMouseOut": false
};
HTMLTableElement.MouseOverRowSelection.prototype = {
    initialize: function(table, options) {
        this.options = Object.fill(options || {}, HTMLTableElement.MouseOverRowSelection.DefaultOptions);
        HTMLTableElement.RowSelection.Methods.initialize.apply(this, [table, this.options]);
    },
    activate: function() {
        this.tableMouseOverHandler = this.tableMouseOverHandler || this.tableMouseOver.bindAsEventListener(this);
        if (this.options["deselectOnMouseOut"])
            this.tableMouseOutHandler = this.tableMouseOutHandler || this.tableMouseOut.bindAsEventListener(this);
        this.targets = this.getTargets();
        for(var i = 0; i < this.targets.length; i++) {
            Event.observe(this.targets[i], "mouseover", this.tableMouseOverHandler, false);
            if (this.tableMouseOutHandler)
                Event.observe(this.targets[i], "mouseout", this.tableMouseOutHandler, false);
        }
    },
    deactivate: function() {
        if (!this.targets || !this.tableMouseOverHandler || !this.tableMouseOutHandler )
            return;
        for(var i = 0; i < this.targets.length; i++) {
            Event.stopObserving(this.targets[i], "mouseover", this.tableMouseOverHandler, false);
            if (this.tableMouseOutHandler)
                Event.stopObserving(this.targets[i], "mouseout", this.tableMouseOutHandler, false);
        }
    },
    tableMouseOver: function(event) {
        var row = Element.findAncestorByTagName(Event.element(event), "TR");
        if (this.row == row) {
            this.deselectRow(this.row, event);
            this.row = null;
        } else if (this.row == null) {
            this.selectRow(row, event);
            this.row = row;
        } else {
            this.deselectRow(this.row, event);
            this.selectRow(row, event);
            this.row = row;
        }
    },
    tableMouseOut: function(event) {
        if (this.row) {
            this.deselectRow(this.row, event);
        }
        this.row = null;
    }    
};
Object.extend(HTMLTableElement.MouseOverRowSelection.prototype, HTMLTableElement.RowSelection.Methods);
