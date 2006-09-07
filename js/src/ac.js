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
ACFields.Mapping.DefaultOptions = {
    TrueString: "○",
    FalseString: "×"
};
ACFields.Mapping.InstanceMethods = {
    initializeOptions: function() {
        if (!this.options)
            this.options = {};
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
            var baseElement = $(args[0]);
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
    observeField: function(acFields, options) {
        this.acFields = acFields;
        this.options = Object.extend(this.options || {}, options);
        this.focusHandler = this.fieldOnFocus.bindAsEventListener(this);
        Event.observe(this.getField(), "focus", this.focusHandler, false);
    },
    fieldOnFocus: function(event) {
        this.activateListeners();
    },
    activateListeners: function() {
        this.fieldKeyupHandler = this.fieldKeyup.bindAsEventListener(this);
        Event.observe(this.field, "keyup", this.fieldKeyupHandler, false);
    },
    deactivateListeners: function() {
        if (!this.fieldKeyupHandler)
            return;
        Event.stopObserving(this.field, "keyup", this.fieldKeyupHandler, false);
    },
    fieldKeyup: function(event) {
        this.acFields.searching = false;
        setTimeout(this.acFields.search.bind(this.acFields, this), this.options["keyup_delay"]);
    }
    
};
ACFields.DefaultOptions = {
    "keyup_delay": 500
};
ACFields.prototype = {
    initialize: function(mappings, options) {
		this.searching = false;
		this.options = Object.extend( $H(ACFields.DefaultOptions), options || {} );
        this.mappings = mappings;
        this.initializeMapping();
        this.observeFieldFocus();
    },
    initializeMapping: function() {
        for(var i = 0; i < this.mappings.length; i++) {
            var mapping = this.mappings[i];
            Object.fill(mapping, ACFields.Mapping.InstanceMethods);
            mapping.initializeOptions();
        }
    },
    observeFieldFocus: function() {
        for(var i = 0; i < this.mappings.length; i++) {
            this.mappings[i].observeField(this, this.options);
        }
    },
    search: function(sender) {
        this.searching = true;
        var parameters = this.getParameters();
        if (!this.searching)
            return;
        this.query(parameters, sender);
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
                this.getField().style.align;
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
    "empty_list_message": "該当無し    "
};
ACFields.BasicTable.prototype = {
    initialize: function(tBody, mappings, options) {
        this.tBody = $(tBody);
        if (!this.tBody)
            throw new Error("no table or tbody specified");
        if (this.tBody.tagName.toLowerCase() == "table")
             this.tBody = this.tBody.tBodies[0];
        this.mappings = mappings;
		this.options = Object.extend( $H(ACFields.BasicTable.DefaultOptions), options || {} );
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
		if (!list || list.length < 1) {
			var tr = this.tBody.insertRow(-1);
			var td = tr.insertCell(0);
			td.colSpan = this.mappings.length;
			var content = document.createTextNode( this.options["empty_list_message"] );
			td.appendChild(content);
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
    },
    toValues: function(row) {
		var result = {};
		for(var i = 0; i < this.mappings.length; i++) {
			var mapping = this.mappings[i];
			mapping.parseCell(row, result); 
		}
		return result;
    }
}
 