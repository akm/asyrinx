/**
 * table_sort.js
 * 
 * require 
 *     prototype.js 
 *     prototype_ext.js
 *
 * @copyright T.Akima
 * @license LGPL
 */

ACFields = Class.create();
ACFields.Mapping = {
    Types: {
        "String": {
           noneNullValue: "",
           to_typed_value: function(value, mapping) { return value; },
           to_string: function(value, mapping) { return value; }
        },
        "Number": {
           noneNullValue: 0,
           to_typed_value: function(value, mapping) { return (value) ? value.toNumeric() * 1 : null; },
           to_string: function(value, mapping) { return (value) ? value.toString() : null; }
        },
        "Currency": {
           noneNullValue: 0,
           to_typed_value: function(value, mapping) { return (value) ? value.toNumeric() * 1 : null; },
           to_string: function(value, mapping) { return (value) ? value.commify() : null; }
        },
        "Boolean": {
            noneNullValue: false,
            to_typed_value: function(value, mapping) { return (value) ? true : false; },
            to_string: function(value, mapping) {
                if (value == null || value == undefined)
                    return null;
                var optionKey = (value) ? "TrueString" : "FalseString";
                return mapping.options[optionKey]; 
            }
        },
        "Date": {
           noneNullValue: new Date(),
           to_typed_value: function(value, mapping) { return new Date(value); },
           to_string: function(value, mapping) { return (value) ? value.toString() : null; }
        }
    },
    to_value: function(mapping, field){
        field = field || mapping.getField();
        var value = HTMLElement.getValue(field);
        var mappingType = ACFields.Mapping.Types[mapping.type];
        if (!mappingType)
            return new Error("no type for mapping.type: " + mapping.type);
        if (value == undefined || value == null) {
            value = (mapping.nullable) ? null : mappingType.noneNullValue;
        } else {
            value = mappingType.to_typed_value(value, mapping);
        }
        return value;
    },
    to_string: function(mapping, value){
        var mappingType = ACFields.Mapping.Types[mapping.type];
        if (!mappingType)
            return new Error("no type for mapping.type: " + mapping.type);
        return mappingType.to_string(value, mapping);
    }
};
ACFields.Mapping.DefaultIgnoreKeyRanges = [
    $R(0, Event.KEY_BACK_SPACE, true),
    $R(Event.KEY_BACK_SPACE + 1, Event.KEY_SPACE, true),
    $R(Event.KEY_SPACE+1, Event.KEY_DELETE, false),
    $R(Event.KEY_F1, Event.KEY_SCROLL_LOCK, false),
    $R(Event.KEY_IME_ON, Event.KEY_IME_OFF, false)
];
ACFields.Mapping.DefaultOptions = {
    TrueString: "○",
    FalseString: "×",
    ignoreTriggerKeyRanges: ACFields.Mapping.DefaultIgnoreKeyRanges
};
ACFields.Mapping.InstanceMethods = {
    initializeOptions: function(options) {
        if (!this.options)
            this.options = {};
        if (options)
            Object.fill(this.options, options);
        Object.fill(this.options, ACFields.Mapping.DefaultOptions);
    },

    getField: function() {
        if (!this.field)
            return null;
        if (this.field.ownerDocument) {
            return this.field;
        } else if (this.field.constructor == String) {
            var field_id = this.field;
            var field = $(field_id);
            if (!field)
                throw new Error("field[id:" + field_id + "] not found");
            this.field = field;
            return this.field;
        } else if (this.field["className"]) {
            var baseElement = $(arguments[0]);
            var fieldClassName = this.field["className"];
            if (!baseElement)
                throw new Error("no baseElement specified for className[" + fieldClassName + "]");
            var field = document.getFirstElementByClassName(fieldClassName);
            if (!field)
                throw new Error("field[className:" + fieldClassName + "] not found");
            this.field = field;
            return this.field;
        } else {
            return null;
        }
    },
    getValueFromField: function() {
        var field = this.getField();
        if (!field)
            return null;
        return ACFields.Mapping.to_value(this);
    },
    setValueToField: function(value) {
        var field = this.getField();
        if (!field)
            return;
        HTMLElement.setValue(field, ACFields.Mapping.to_string(this, value));
    },
    clearField: function() {
        var field = this.getField();
        if (!field)
            return;
        HTMLElement.setValue(field, this.defaultValue || "");
    },
    observeField: function(acFields, options) {
        this.acFields = acFields;
        this.options = Object.extend(this.options || {}, options);
        var field = this.getField();
        if (!field) 
            return;
        this.focusHandler = this.fieldOnFocus.bindAsEventListener(this);
        Event.observe(this.getField(), "focus", this.focusHandler, false);
    },
    fieldOnFocus: function(event) {
        this.activateListeners();
    },
    activateListeners: function() {
        var field = this.getField();
        if (!field) 
            return;
        this.fieldKeyupHandler = this.fieldKeyup.bindAsEventListener(this);
        var field = this.getField();
        Event.observe(field, "keyup", this.fieldKeyupHandler, false);
    },
    deactivateListeners: function() {
        if (!this.fieldKeyupHandler)
            return;
        Event.stopObserving(this.field, "keyup", this.fieldKeyupHandler, false);
    },
    fieldKeyup: function(event) {
        if (!this.isQueryTrigger(event))
            return;
        this.acFields.searching = false;
        setTimeout(this.acFields.search.bind(this.acFields, this), this.options["keyup_delay"]);
    },
    isQueryTrigger: function(event) {
        if (!this.options.ignoreTriggerKeyRanges)
            return true;
        var keyCode = event.keyCode || event.charCode || event.which;
        for(var i = 0; i < this.options.ignoreTriggerKeyRanges.length; i++) {
            var ignoreKeyRange = this.options.ignoreTriggerKeyRanges[i];
            if (ignoreKeyRange.include(keyCode))
                return false;
        }
        return true;
    }
};
ACFields.DefaultOptions = {
    "keyup_delay": 500,
    "ignoreTriggerKeyRanges": ACFields.Mapping.DefaultOptions.ignoreTriggerKeyRanges
};
ACFields.prototype = {
    initialize: function(mappings, options) {
		this.searching = false;
		this.options = Object.fill( options || {}, ACFields.DefaultOptions );
        this.mappings = mappings;
        this.initializeMapping();
        this.observeFieldFocus();
    },
    initializeMapping: function() {
        var commonOptions = {"ignoreTriggerKeyRanges": this.options.ignoreTriggerKeyRanges };
        for(var i = 0; i < this.mappings.length; i++) {
            var mapping = this.mappings[i];
            Object.fill(mapping, ACFields.Mapping.InstanceMethods);
            mapping.initializeOptions(commonOptions);
        }
    },
    observeFieldFocus: function() {
        for(var i = 0; i < this.mappings.length; i++) {
            this.mappings[i].observeField(this, this.options);
        }
    },
    search: function(sender) {
        this.searching = true;
        if (this.mappings.indexOf(sender) < 0) {
            sender = this.mappings.select( function(m){ return sender == m.getField();} );
        }
        var parameters = this.getParameters();
        if (!this.parameterModified(parameters))
            return;
        if (!this.searching)
            return;
        this.query(parameters, sender);
    },
    parameterModified: function(params) {
        try {
            if (!this.lastParams)
                return true;
            for(var prop in params) {
                if (params[prop] != this.lastParams[prop]) {
                    return true;
                }
            }
            return false;
        } finally {
            this.lastParams = params;
        }
    },
    getParameters: function() {
        var result = {};
        for(var i = 0; i < this.mappings.length; i++) {
            if (!this.searching)
                return;
            var mapping = this.mappings[i];
            var value = mapping.getValueFromField();
            result[mapping.property] = value;
        }
        return result;
    },
    query: function(parameters, sender) {
        if (this.options["query"])
            this.options["query"](parameters, sender);
    },
    select: function(values) {
        for(var i = 0; i < this.mappings.length; i++) {
            var mapping = this.mappings[i];
            var value = values[mapping.property];
            mapping.setValueToField(value);
        }
    },
    clear: function() {
        for(var i = 0; i < this.mappings.length; i++) {
            var mapping = this.mappings[i];
            mapping.clearField();
        }
    }
}

ACFields.BasicTable = Class.create();
ACFields.BasicTable.Column = {};
ACFields.BasicTable.Column.DefaultHtmlOptions = {
};
ACFields.BasicTable.Column.InstanceMethods = {
    initializeColumnOptions: function() {
        if (this.columnInitialized)
            return;
        if (!this.htmlOptions)
            this.htmlOptions = {};
        this.htmlOptions = Object.fill(this.htmlOptions, 
            ACFields.BasicTable.Column.DefaultHtmlOptions);
        var field = this.getField();
        if (!this.options["masters"] && field.tagName.toLowerCase() == "select")
            this.prepareMastersFrom(field);
        this.initializeHtmlOptions();
        this.columnInitialized = true;
    },
    initializeMasters: function() {
    },
    prepareMastersFrom: function(field) {
        if (!field)
            return;
        this.options.masters = Form.Element.getSelectOptions(field);
        this.options.masterValueToText = {};
        this.options.masterTextToValue = {};
        this.options.arraySeparator = this.options.arraySeparator || " "; 
        for(var i = 0; i <  this.options.masters.length; i++) {
            var master = this.options.masters[i];
            var key = master.value;
            if (this.type == "Number" || this.type == "Currency")
                key = key * 1
            this.options.masterValueToText[key] = master.text;
            this.options.masterTextToValue[master.text] = key;
        }
    },
    initializeHtmlOptions: function() {
        if (!this.htmlOptions["align"]){
            var align = ((!this.options.masterValueToText) && 
                (this.type == "Number" || this.type == "Currency")) ? "right" :
                Element.getStyle(this.getField(), "text-align");
            this.htmlOptions["align"] = align;
        }
    },
    buildCell: function(tr, values) {
		var td = tr.insertCell(-1);
		tr.appendChild(td);
		Element.addClassName(td, this.property);
		td.innerHTML = this.to_cell_html(tr, values);
		for(var attr in this.htmlOptions)
		  td.setAttribute(attr, this.htmlOptions[attr]);
		if (!this.visible) {
			td.style.display = "none";
		}
    },
    to_cell_html: function(tr, values) {
        this.initializeColumnOptions();
        var field = this.getField();
        if (!this.options["masters"] && field.tagName.toLowerCase() == "select")
            this.prepareMastersFrom(field);
        var value = values[this.property];
        if (this.options.masterValueToText) {
            keys = (value.constructor == Array) ? value : [value];
            var texts = [];
            for(var i = 0; i < keys.length; i++) {
                var text = this.options.masterValueToText[ keys[i] ]; 
                if (text)
                    texts.push(text);
            }
            value = texts.join(this.options.arraySeparator);
        } else {
            value = ACFields.Mapping.to_string(this, value);
        }
        if (value == null || value == undefined)
            value = "";
        return value;
    },
    parseCell: function(tr, values) {
        var td = document.getFirstElementByClassName(this.property, tr);
		values[this.property] = this.to_cell_value(tr, td);
    },
    to_cell_value: function(tr, td, values) {
        this.initializeColumnOptions();
        var field = this.getField();
        if (!this.options["masters"] && field.tagName.toLowerCase() == "select")
            this.prepareMastersFrom(field);
        var value = HTMLElement.getValue(td);
        if (this.options.masterTextToValue) {
            texts = value.split(this.options.arraySeparator);
            if (field.type && field.type == "select-multiple") {
                var result = [];
                for(var i = 0; i < texts.length; i++) {
                    var value = this.options.masterTextToValue[ texts[i] ]; 
                    result.push(value);
                }
                return result;
            } else {
                for(var i = 0; i < texts.length; i++) {
                    var value = this.options.masterTextToValue[ texts[i] ]; 
                    if (value)
                        return value;
                }
                return null;
            }
        } else {
            return ACFields.Mapping.to_value(this, td);
        }
    }
    
}
ACFields.BasicTable.DefaultOptions = {
    "noRecordHTML": "no record found.",
    "clearSelectionHTML": "[clear selection]"
};
ACFields.BasicTable.prototype = {
    initialize: function(tBody, mappings, options) {
        this.tBody = $(tBody);
        if (!this.tBody)
            throw new Error("no table or tbody specified");
        if (this.tBody.tagName.toLowerCase() == "table") {
            var table = this.tBody;
            if (table.tBodies.length < 1) {
                var newBody = document.createElement("TBODY");
                table.appendChild(newBody);
            }
            this.tBody = table.tBodies[0];
        }
        this.mappings = mappings;
		this.options = Object.fill( options || {}, ACFields.BasicTable.DefaultOptions );
		this.initializeMappingsAsColumn();
    },
    initializeMappingsAsColumn: function() {
        for(var i = 0; i < this.mappings.length; i++) {
            var mapping = this.mappings[i];
            Object.fill(mapping, ACFields.BasicTable.Column.InstanceMethods);
        }
    },
    execute: function(list) {
        try {
            this.tBody.innerHTML = "";
        } catch(ex) {
            //innerHTML に 文字列を代入するとIE7でエラーになるので、面倒だけど一行ずつdeleteRowしている 
            while(this.tBody.rows.length > 0){
                this.tBody.deleteRow(0);
            }
        }
        this.lastNoRecordRow = null;
		if (!list || list.length < 1) {
		    if (this.options["noRecordHTML"]) {
    			var tr = this.tBody.insertRow(-1);
    			var td = tr.insertCell(0);
    			td.colSpan = this.mappings.length;
    			td.innerHTML = this.options["noRecordHTML"];
    			this.lastNoRecordRow = tr;
		    }
		} else {
			for(var i = 0; i < list.length; i++) {
				var values = list[i];
				var tr = this.tBody.insertRow(-1);
				for(var j = 0; j < this.mappings.length; j++) {
					var mapping = this.mappings[j];
					mapping.buildCell(tr, values); 
				}
			}
		}
		this.lastClearSelectionRow = null;
	    if (this.options["clearSelectionHTML"]) {
			var tr = this.tBody.insertRow(-1);
			var td = tr.insertCell(0);
			td.colSpan = this.mappings.length;
			td.innerHTML = this.options["clearSelectionHTML"];
			this.lastClearSelectionRow = tr;
	    }
    },
    toValues: function(row) {
		var result = {};
		for(var i = 0; i < this.mappings.length; i++) {
			var mapping = this.mappings[i];
			mapping.parseCell(row, result); 
		}
		return result;
    },
    getRowType: function(row) {
        if (!row)
            return null;
        if (row == this.lastNoRecordRow)
            return "noRecord";
        if (row == this.lastClearSelectionRow)
            return "clearSelection";
        return "others";
    }
}


ACFields.PullDown = Class.create();
ACFields.PullDown.DefaultOptions = {
    activateSoon: true,
    closeOnSelect: true,
    toggleOnDblClick: true,
    searchOnShow: true,
    searchingHTML: "searching・・・"
};
ACFields.PullDown.DefaultTableOptions = {
    "cellpadding": "0",
    "cellspacing": "0",
    "border": "0"
};
ACFields.PullDown.DefaultTableStyle = {
    "empty-cells": "show"
};
ACFields.PullDown.Methods = {}
Object.extend(ACFields.PullDown.Methods, HTMLInputElement.PullDown.Methods);
Object.extend(ACFields.PullDown.Methods, {
    initialize: function(mappings, queryMethod, options) {
        options = Object.fill( options || {}, ACFields.PullDown.DefaultOptions);
        HTMLInputElement.PullDown.Methods.initialize.apply(this, [options]);
        this.tableOptions = Object.fill( this.options["table"] || {}, ACFields.PullDown.DefaultTableOptions);
        this.tableStyle = Object.fill( this.tableOptions["style"] || {}, ACFields.PullDown.DefaultTableStyle);
        this.mappings = mappings;
        this.queryMethod = queryMethod;
        this.acFields = new ACFields(this.mappings, {"query": this.invokeQuery.bind(this) });
        if (this.options.activateSoon)
            this.activate();
    },
    activate: function() {
        var suggestives = this.mappings.
            select( function(mapping){return mapping.suggestive;}).
            collect( function(mapping) { return mapping.getField();} );
        var visibleHandlingMatcher = this.matchWhenVisible.bind(this);
        new Event.KeyHandler(suggestives, [
            {event: "keydown", key: Event.KEY_UP    , method: this.rowUp.bindAsEventListener(this), match: visibleHandlingMatcher},
            {event: "keydown", key: Event.KEY_DOWN  , method: this.rowDown.bindAsEventListener(this), match: visibleHandlingMatcher},
            {event: "keydown", key: Event.KEY_SPACE , ctrl: true, method: this.toggle.bindAsEventListener(this)},
            {event: "keydown", key: Event.KEY_ESC   , method: this.hide.bindAsEventListener(this), match: visibleHandlingMatcher},
            {event: "keydown", key: Event.KEY_RETURN, method: this.selectRow.bindAsEventListener(this), match: visibleHandlingMatcher}
        ]);
        for(var i = 0; i < suggestives.length; i++) {
            Event.observe($(suggestives[i]), "blur", this.hide.bindAsEventListener(this) , false);
            if (this.options.toggleOnDblClick) 
                Event.observe($(suggestives[i]), "dblclick", this.toggle.bindAsEventListener(this) , false);
        }
    },
    matchWhenVisible: function(action, event, keyCode, keyHandler) {
        return (this.visible && keyHandler.matchAction(action, event, keyCode));
    },
    appendSearchingDiv: function(dest) {
    	if (!this.options.searchingHTML || this.searchingDiv)
    	   return;
        this.searchingDiv = document.createElement("DIV");
        this.searchingDiv.innerHTML = this.options.searchingHTML;
        dest.appendChild(this.searchingDiv);
    },
	createPane: function() {
		var result = HTMLInputElement.PullDown.Methods.createPane.apply(this, arguments);
		this.appendSearchingDiv(result);
		this.table = document.createElement("TABLE");
		if (this.tableOptions.style)
		  delete this.tableOptions.style;
		Object.extendProperties(this.table, this.tableOptions);
		Element.setStyle(this.table, this.tableStyle);
		result.appendChild(this.table);
        this.rowGenerator = new ACFields.BasicTable(this.table, this.mappings, this.options["rowGenerator"]);
        this.selection = new HTMLTableElement.MouseOverRowSelection(this.table);
        Event.observe(this.table, "click", this.selectRow.bindAsEventListener(this), false);
		return result;
	},
    invokeQuery: function(parameters, sender) {
        if (!this.queryMethod)
            throw new Error("no queryMethod specified");
        if (this.searchingDiv) {
            Element.show(this.searchingDiv);
            if (this.table)
                Element.hide(this.table);
        }
        this.queryCallbackBind = this.queryCallbackBind || this.queryCallback.bind(this); 
        var result = this.queryMethod.apply(null, [parameters, this.queryCallbackBind]);
        if (result && result.constructor == Array)
            this.showQueryResult(result);
    },
    queryCallback: function(result) {
        this.showQueryResult(result);
    },
    showQueryResult: function(result) {
        if (this.searchingDiv)
            Element.hide(this.searchingDiv);
        if (!this.table)
            this.createPane();
        Element.show(this.table);
        this.rowGenerator.execute(result);
    },
    rowUp: function(event) {
        if (!this.selection)
            return;
        this.selection.prev(event);
        Element.scrollYIfInvisible(this.selection.row, this.pane); 
    },
    rowDown: function(event) {
        if (!this.selection)
            return;
        this.selection.next(event);
        Element.scrollYIfInvisible(this.selection.row, this.pane); 
    },
    selectRow: function(event) {
        var rowType = this.rowGenerator.getRowType(this.selection.row);
        if (rowType == "noRecord") {
            return;
        } else if (rowType == "clearSelection") {
            this.acFields.clear();
        } else {
            var values = this.rowGenerator.toValues(this.selection.row);
            this.acFields.select(values);
        }
        if (this.options.closeOnSelect)
            this.hide(event);
    },
    toggle: function(event) {
        HTMLInputElement.PullDown.Methods.toggle.apply(this, arguments);
    },
    hide: function(event) {
        HTMLInputElement.PullDown.Methods.hide.apply(this, arguments);
    },
    show: function(event) {
        HTMLInputElement.PullDown.Methods.show.apply(this, arguments);
        if (this.options.searchOnShow)
            this.acFields.search(Event.element(event));
    }
});
Object.extend(ACFields.PullDown.prototype, ACFields.PullDown.Methods);
 