/**
 * table_sort.js
 * 
 * require prototype.js only
 *
 * @copyright T.Akima
 * @license LGPL
 */
TableSort = Class.create();
TableSort.DefaultOptions = {
    "rememberRows": false
}
Object.extend(TableSort, {
    comapare: function(row1,row2) {
        var key1=row1["key"];
        var key2=row2["key"];
        if (key1 == null && key2 == null)
            return 0;
        else if (key1 == null)
            return -1;
        else if (key2 == null)
            return 1;
        return (key1<key2)?-1:(key1==key2)?0:1;
    }
});
TableSort.prototype = {
	initialize: function(tables, options) {
		this.active = false;
		this.tables = (!tables) ? [] : (tables.constructor == Array) ? tables : [ tables ];
		this.tables = this.tables.collect( function(table){return $(table);} );
		this.options = Object.extend( $H(TableSort.DefaultOptions), options || {} );
    },
    
    run: function(keyMaker) {
        var rows = this.getTargetRows();
        var rowCountsOfBodies = this.getRowCountsOfBodies();
        var rowsWithKey = this.getRowsWithKey( rows, keyMaker );
        var comparator = (keyMaker["compare"]) ? keyMaker["compare"].bind(keyMaker) : TableSort.comapare; 
        rowsWithKey.sort(comparator);
        this.relocateRows(rowsWithKey.pluck("row"), rowCountsOfBodies);
    },
    
    getTargetRows: function() {
        if (this.options["rememberRows"] && this.rows)
            return this.rows;
        var rows = [];
        for(var i = 0; i < this.tables.length; i++) {
            var table = this.tables[i];
            for(var j = 0; j < table.tBodies.length; j++) {
                var tBody = table.tBodies[j];
                for(var k = 0; k < tBody.rows.length; k++) {
                    rows.push(tBody.rows[k]);
                }
            }
        }
        if (this.options["rememberRows"])
            this.rows = rows;
        return rows;
    },
    
    getRowCountsOfBodies: function() {
        var result = [];
        for(var i = 0; i < this.tables.length; i++) {
            var table = this.tables[i];
            for(var j = 0; j < table.tBodies.length; j++) {
                var tBody = table.tBodies[j];
                result.push( {"tBody": tBody, "rowCount": tBody.rows.length} );
            }
        }
        return result;
    },
    
    getRowsWithKey: function(rows,keyMaker) {
        var result = [];
        for(var i = 0; i < rows.length; i++) {
            var row = rows[i];
            result.push( {"row": row, "key": keyMaker.generate(row)} );
        }
        return result;
    },
    
    relocateRows: function(rows, rowCountsOfBodies) {
        var tables = Array(this.tables);
        var rowCount = rowCountsOfBodies.shift();
        for(var i = 0; i < rows.length; i++) {
            rowCount["tBody"].appendChild(rows[i]);
            rowCount["rowCount"] -= 1;
            if (rowCount["rowCount"] < 1)
                rowCount = rowCountsOfBodies.shift();
        }
    }
}

TableSort.Reverse = Class.create();
TableSort.Reverse.prototype = {
	initialize: function(keyGen) {
	   this.keyGen = keyGen;
	   this.name = "Reverse";
    },
    compare: function(row1,row2){
        this.comparator = this.comparator || ((this.keyGen["compare"]) ? this.keyGen["compare"].bind(this.keyGen) : TableSort.comapare);
        return -1 * this.comparator(row1,row2);
    },
    generate: function(row) {
        return this.keyGen.generate(row);
    }
}

TableSort.AsNumber = Class.create();
TableSort.AsNumber.prototype = {
	initialize: function(keyGen) {
	   this.keyGen = keyGen;
	   this.name = "AsNumber";
    },
    generate: function(row) {
        var result = this.keyGen.generate(row);
        return (result)?result*1:0;
    }
}

TableSort.InnerTextByClassName = Class.create();
TableSort.InnerTextByClassName.prototype = {
	initialize: function(className, ignoreCase) {
	   this.className = className;
	   this.ignoreCase = ignoreCase;
	   this.name = "InnerTextByClassName";
    },
    generate: function(row) {
        var elements = document.getElementsByClassName(this.className, row);
        if (!elements || elements.length < 1)
            return null;
        var result = elements[0].innerText|| elements[0].textContent;
        return (!this.ignoreCase) ? result : (result) ? result.toLowerCase() : result;
    }
}
TableSort.InnerText = TableSort.InnerTextByClassName;


TableSort.KeyJoin = Class.create();
TableSort.KeyJoin.prototype = {
	initialize: function(keyGens) {
	   this.keyGens = keyGens || [];
	   this.name = "KeyJoin";
    },
    
    compare: function(row1,row2){
        var comps = this.getComparators();
        var drow1 = { "row": row1 };  
        var drow2 = { "row": row2 }; 
        for(var i = 0; i < comps.length; i++) {
            drow1["key"] = row1["key"][i];
            drow2["key"] = row2["key"][i];
            var result = comps[i](drow1, drow2);
            if (result != 0) {
                return result;
            }
        }
        return 0;
    },
    
    generate: function(row) {
        var gens = this.getGenerators();
        var result = [];
        for(var i = 0; i < gens.length; i++){
            result.push(gens[i](row));
        }
        return result;
    },
    
    getComparators: function() {
        if (!this.comparators) {
            this.comparators = [];
            for(var i = 0; i < this.keyGens.length; i++) {
                var keyGen = this.keyGens[i];
                var f = (keyGen["compare"]) ? keyGen["compare"].bind(keyGen) : TableSort.comapare;
                this.comparators.push(f);
            }
        }
        return this.comparators;
    },
    
    getGenerators: function() {
        if (!this.generators) {
            this.generators = [];
            for(var i = 0; i < this.keyGens.length; i++) {
                var keyGen = this.keyGens[i];
                this.generators.push(keyGen.generate.bind(keyGen));
            }
        }
        return this.generators;
    }
}

TableSort.Trigger = Class.create();
TableSort.Trigger.DefaultOptions = {
    "reversible": true
}
TableSort.Trigger.prototype = {
	initialize: function(source, sorter, keyMaker, options) {
        this.source = $(source);
        this.sorter = sorter;
        this.keyMaker = keyMaker;
        this.options = Object.extend( $H(TableSort.Trigger.DefaultOptions), options || {} );
        this.desc = false;
        this.active = false;
        this.activate();
    },
    
    activate: function() {
        this.clickHandler = this.clickHandler || this.click.bindAsEventListener(this);
        Event.observe(this.source, "click", this.clickHandler, false);
        this.active = true;
    },
    
    deactivate: function() {
        if (!this.clickHandler)
            return;
        Event.stopObserving(this.source, "click", this.clickHandler, false);
        this.active = false;
    },
    
    click: function(event) {
        var keyMaker = (this.desc) ? new TableSort.Reverse(this.keyMaker) : this.keyMaker;
        this.sorter.run(keyMaker);
        if (this.options["reversible"])
            this.desc = !this.desc;
    }
}
