/**
 * table_sort.js
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
    activateSoon: true
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
    selectRow: function(event, row) {
        row.style.backgroundColor = this.options.backgroundColor;
        row.style.color = this.options.color;
        if (this.options['select'])
            this.options.select(event, row, this);
    },
    deselectRow: function(event, row) {
        row.style.backgroundColor = "";
        row.style.color = "";
        if (this.options['deselect'])
            this.options.deselect(event, row, this);
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
        var row = Element.getAncestorByTagName(Event.element(event), "TR");
        if (this.options.mode == "single") {
            if (this.row == row) {
                this.deselectRow(event, this.row);
                this.row = null;
            } else if (this.row == null) {
                this.selectRow(event, row);
                this.row = row;
            } else {
                this.deselectRow(event, this.row);
                this.selectRow(event, row);
                this.row = row;
            }
        } else {
            if (!this.rows)
                this.rows = [];
            if (this.rows.contains(row)) {
                this.deselectRow(event, row);
                this.rows.remove(row);
            } else {
                this.selectRow(event, row);
                this.rows.push(row);
            }
        }
    }
};
Object.extend(HTMLTableElement.ClickRowSelection.prototype, HTMLTableElement.RowSelection.Methods);

HTMLTableElement.MouseOverRowSelection = Class.create();
HTMLTableElement.MouseOverRowSelection.DefaultOptions = {
};
HTMLTableElement.MouseOverRowSelection.prototype = {
    initialize: function(table, options) {
        this.options = Object.fill(options || {}, HTMLTableElement.MouseOverRowSelection.DefaultOptions);
        HTMLTableElement.RowSelection.Methods.initialize.apply(this, [table, this.options]);
    },
    activate: function() {
        this.tableMouseOverHandler = this.tableMouseOverHandler || this.tableMouseOver.bindAsEventListener(this);
        this.tableMouseOutHandler = this.tableMouseOutHandler || this.tableMouseOut.bindAsEventListener(this);
        this.targets = this.getTargets();
        for(var i = 0; i < this.targets.length; i++) {
            Event.observe(this.targets[i], "mouseover", this.tableMouseOverHandler, false);
            Event.observe(this.targets[i], "mouseout", this.tableMouseOutHandler, false);
        }
    },
    deactivate: function() {
        if (!this.targets || !this.tableMouseOverHandler || !this.tableMouseOutHandler )
            return;
        for(var i = 0; i < this.targets.length; i++)
           Event.stopObserving(this.targets[i], "mouseover", this.tableMouseOverHandler, false);
           Event.stopObserving(this.targets[i], "mouseout", this.tableMouseOutHandler, false);
    },
    tableMouseOver: function(event) {
        var row = Element.getAncestorByTagName(Event.element(event), "TR");
        if (this.row == row) {
            this.deselectRow(event, this.row);
            this.row = null;
        } else if (this.row == null) {
            this.selectRow(event, row);
            this.row = row;
        } else {
            this.deselectRow(event, this.row);
            this.selectRow(event, row);
            this.row = row;
        }
    },
    tableMouseOut: function(event) {
        if (this.row) {
            this.deselectRow(event, this.row);
        }
        this.row = null;
    }    
};
Object.extend(HTMLTableElement.MouseOverRowSelection.prototype, HTMLTableElement.RowSelection.Methods);
