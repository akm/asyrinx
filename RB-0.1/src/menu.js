/**
 * menu.js
 * 
 * require 
 *     prototype.js 
 *     prototype_ext.js
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

var Menu = Class.create();

Menu.Item = Class.create();
Menu.Item.DefaultOptions = {
    direction: "vertical", //"horizontal",
    body: {},
    table: {},
    contentCell: {},
    marginLeftCell: {},
    marginRightCell: {},
    hideDelay:200,
    selectedColor: "#FFFFFF",
    selectedBgColor: "#93A070",
    havingItemsHtml: '<img src="http://asyrinx.googlecode.com/svn/branches/js/RB-0.1/test/functional/black_left_triangle.png"/>'
};
Menu.Item.DefaultCursorStyle = (/MSIE/.test(navigator.appVersion))?"hand":"pointer";
Menu.Item.DefaultBody = { tagName: "div", style:"position:absolute;background-color:#FFFFFF;border: 1px solid #BBBBBB;" };
Menu.Item.DefaultTable = { tagName: "table", border:0, cellspacing:0, cellpadding:0, style:"empty-cells:show; padding:0px; margin:0px; border-collapse:collapse; " };
Menu.Item.DefaulContentCell = { tagName: "td", style:"padding:0px;margin:0px;cursor:" + Menu.Item.DefaultCursorStyle };
Menu.Item.DefaulMarginLeftCell = { tagName: "td", width:16, body:" ", style:"padding:0px;margin:0px;cursor:" + Menu.Item.DefaultCursorStyle };
Menu.Item.DefaulMarginRightCell = { tagName: "td", width:16, body:" ", style:"padding:0px;margin:0px;cursor:" + Menu.Item.DefaultCursorStyle };
Menu.Item.Methods = {
    initialize: function(body, parentItem, items, options){
        this.body = body;
        this.parentItem = this.parentItem || parentItem;
        this.items = this.items || items;
        this.options = this.options || options || {};
    },
    
    getOption: function(key, item){
        var result = (this.options)?this.options[key]:null;
        return (result)?result:(this.parentItem)?this.parentItem.getOptionForChild(key, item||this):null;
    },
    
    getOptionForChild: function(key, item){
        return this.getOption(key,item);
    },
    
    getTreeLevel: function(){
        return (this.parentItem) ? this.parentItem.getTreeLevel()+1 : 0
    },
    
    updateBody: function(){
        if (!this.items)
            return;
        for(var i=0;i<this.items.length;i++){
            var item = this.items[i];
            if (!item.initialize) {
                Object.fill(item, Menu.Item.Methods);
                item.initialize(null, this, null, null);
            }
        }
        this.body.innerHTML = "";
        var table = Element.build(this.getOption("table"));
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        if (this.getOption("direction") == "horizontal") {
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            for(var i=0;i<this.items.length;i++){
                this.items[i].createContentContainer(tr);
            }
        } else {
            for(var i=0;i<this.items.length;i++){
                var tr = document.createElement("tr");
                tbody.appendChild(tr);
                this.items[i].createContentContainer(tr);
            }
        }
        this.body.appendChild(table);
        Event.observe(this.body, "click", this.clicked.bindAsEventListener(this));
        Event.observe(this.body, "mouseover", this.mouseOver.bindAsEventListener(this));
        Event.observe(this.body, "mouseout", this.mouseOut.bindAsEventListener(this));
    },
    createContentContainer: function(tr){
        this.cells = Element.build([
            this.getOption("marginLeftCell"), this.getOption("contentCell"), this.getOption("marginRightCell")
        ]);
        this.marginLeftCell = this.cells[0];
        this.contentCell = this.cells[1];
        this.marginRightCell = this.cells[2];
        for(var i=0;i<this.cells.length;i++){
            var cell=this.cells[i];
            tr.appendChild(cell);
        }
        if (this.items && this.items.length>0)
            this.marginRightCell.innerHTML = this.getOption("havingItemsHtml");
        this.updateContent(this.cells[1]);
    },
    
    updateContent: function(container){
        if (!this.content)
            this.content = (this.link)?{"tagName":"a", "href": this.link, "body": this.text}:this.text;
        if (!this.content.nodeType)
            this.content = Element.build(this.content);
        container.appendChild(this.content);
    },
    
    focus: function(){
        if (!this.defaultBackgroundColor){
            this.defaultBackgroundColor = this.contentCell.style.backgroundColor;
            this.defaultColor = this.contentCell.style.color;
        }
        for(var i=0;i<this.cells.length;i++){
            var cell=this.cells[i];
            cell.style.backgroundColor = this.getOption("selectedBgColor");
            cell.style.color = this.getOption("selectedColor");
        }
        this.hideOtherSiblings();
        this.showBody();
    },
    blur: function(){
        for(var i=0;i<this.cells.length;i++){
            var cell=this.cells[i];
            cell.style.backgroundColor = this.defaultBackgroundColor;
            cell.style.color = this.defaultColor;
        }
        this.hideBody();
    },
    
    hasElement: function(element){
        for(var i=0;i<this.cells.length;i++){
            var cell=this.cells[i];
            if ((element == cell)||Element.childOf(element,cell))
                return true;
        }
        return false;
    },
    findItemByEvent: function(event){
        var element = Event.element(event);
        for(var i=0;i<this.items.length;i++){
            var item = this.items[i];
            if (item.hasElement(element))
                return item;
        }
        return null;
    },
    action: function(event){
        var element = Event.element(event);
        if (/A|INPUT|BUTTON/.test(element.tagName))
            return;
        if (this.link)
            window.location.href = this.link;
    },
    
    clicked: function(event){
        var item = this.findItemByEvent(event);
        if (item) item.action(event);
    },
    mouseOver: function(event){
        var item = this.findItemByEvent(event);
        if (item) item.focus();
    },
    mouseOut: function(event){
        var item = this.findItemByEvent(event);
        if (item) item.blur();
    },
    createBody: function(){
        this.body = Element.build(this.getOption("body"));
        Element.hide(this.body);
        document.body.appendChild(this.body);
    },
    showBody: function(){
        this.cancelHiding();
        if (!this.items || this.items.length < 1) return;
        if (!this.body){
            this.createBody();
            this.updateBody();
        }
        var containerPos = Position.cumulativeOffset(this.marginLeftCell);
        var parnetBodyPos = Position.cumulativeOffset((this.parentItem)?this.parentItem.body:this.marginRightCell);
        var parentDirection = (this.parentItem)?this.parentItem.getOption("direction"):Menu.Item.DefaultOptions.direction;
        if (parentDirection == "horizontal") {
            this.body.style.left = containerPos[0] +"px";
            this.body.style.top = (parnetBodyPos[1] + this.cells.collect(function(cell){return cell.offsetHeight;}).max() +2)+"px";
        }else{
            this.body.style.left = (parnetBodyPos[0] + this.cells.collect(function(cell){return cell.offsetWidth;}).sum() +2)+"px";
            this.body.style.top = containerPos[1] +"px";
        }
        Element.show(this.body);
    },
    hideOtherSiblings: function(){
        if (!this.parentItem)
            return;
        this.parentItem.hideItems();
    },
    cancelHiding: function(){
        this.hiding = false;
        if (this.parentItem)
            this.parentItem.cancelHiding();
    },
    hideBody: function(){
        this.hiding = true;
        setTimeout(this._hideBody.bind(this), this.getOption("hideDelay"));
    },
    _hideBody: function(){
        if (!this.hiding) return;
        this.hideBodySoon();
    },
    hideBodySoon: function(){
        if (!this.body) return;
        Element.hide(this.body);
        this.hideItems();
    },
    hideItems: function(){
        if (!this.items) return;
        for(var i=0; i<this.items.length;i++)
            this.items[i].hideBodySoon();
    }
}
Object.extend(Menu.Item.prototype, Menu.Item.Methods);

Menu.DefaultOptions = {
    direction: "horizontal", //"vertical",
    itemDirection: "vertical", //"horizontal",
    showSoon: true,
    havingItemsHtmlMinLevel: 2
};
Menu.Methods = {
    initialize: function(body, items, options){
        options = Object.fill(options||{}, Menu.DefaultOptions);
        options = Object.fill(options||{}, Menu.Item.DefaultOptions);
        Object.fill(options.body, Menu.Item.DefaultBody);
        Object.fill(options.table, Menu.Item.DefaultTable);
        Object.fill(options.contentCell, Menu.Item.DefaulContentCell);
        Object.fill(options.marginLeftCell, Menu.Item.DefaulMarginLeftCell);
        Object.fill(options.marginRightCell, Menu.Item.DefaulMarginRightCell);
        
        Menu.Item.Methods.initialize.apply(this, [body, null, items, options]);
        if (this.options.showSoon)
            this.updateBody();
    },
    getOptionForChild: function(key, item){
        switch(key){
            case "direction": return this.options.itemDirection;
            case "havingItemsHtml": 
                return (item.getTreeLevel() < this.options.havingItemsHtmlMinLevel) ? "" : this.options.havingItemsHtml;
        }
        return this.getOption(key);
    }
}
Object.extend(Menu.prototype, Menu.Item.Methods);
Object.extend(Menu.prototype, Menu.Methods);
