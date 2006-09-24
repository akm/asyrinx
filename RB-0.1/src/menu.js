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

Menu = Class.create();

Menu.Item = Class.create();
Object.extend(Menu.Item, {
    initializeMethods: function(item, parentItem){
        if (!item.initialize) {
            Object.fill(item, Menu.Item.Methods);
            item.initialize(null, parentItem, null, null);
        }
    }
})
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
    havingItemsHtmlVertical: '<img src="http://asyrinx.googlecode.com/svn/branches/js/RB-0.1/test/functional/black_left_triangle.png"/>',
    havingItemsHtmlHorizontal: '<img src="http://asyrinx.googlecode.com/svn/branches/js/RB-0.1/test/functional/black_bottom_triangle.png"/>'
};
Menu.Item.DefaultCursorStyle = (/MSIE/.test(navigator.appVersion))?"hand":"pointer";
Menu.Item.DefaultBody = { tagName: "div", style:"position:absolute;background-color:#FFFFFF;border: 1px solid #BBBBBB;" };
Menu.Item.DefaultTable = { tagName: "table", border:0, cellspacing:0, cellpadding:0, style:"empty-cells:show; padding:0px; margin:0px; border-collapse:collapse; " };
Menu.Item.DefaultCellStyle = "padding:0px;margin:0px;cursor:" + Menu.Item.DefaultCursorStyle;
Menu.Item.DefaulContentCell = { tagName: "td", style: Menu.Item.DefaultCellStyle };
Menu.Item.DefaulMarginLeftCell = { tagName: "td", width:16, body:" ", style: Menu.Item.DefaultCellStyle };
Menu.Item.DefaulMarginRightCell = { tagName: "td", width:16, body:" ", style: Menu.Item.DefaultCellStyle };
Menu.Item.Methods = {
    initialize: function(body, parentItem, items, options){
        this.body = body;
        this.parentItem = this.parentItem || parentItem;
        this.items = this.items || items;
        this.options = this.options || options || {};
        this.activeItem = null;
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
    visit: function(iterator){
        iterator(this);
        if (!this.items) return;
        for(var i=0;i<this.items.length;i++){
            Menu.Item.initializeMethods(this.items[i], this);
            this.items[i].visit(iterator);
        }
    },
    
    updateBody: function(){
        if (!this.items)
            return;
        for(var i=0;i<this.items.length;i++)
            Menu.Item.initializeMethods(this.items[i], this);
        this.body.innerHTML = "";
        var table = Element.build(this.getOption("table"),this.body);
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
        Event.observe(this.body, "click", this.clicked.bindAsEventListener(this));
        Event.observe(this.body, "mouseover", this.mouseOver.bindAsEventListener(this));
    },
    
    clicked: function(event){
        var item = this.findItemByEvent(event);
        if (item) item.action(event);
    },
    mouseOver: function(event){
        var item = this.findItemByEvent(event);
        if (item){
            this.hideItems();
            this.blurItems();
            item.focus();
            item.showBody();
        }
    },
    
    action: function(event){
        var element = Event.element(event);
        if (/A|INPUT|BUTTON/.test(element.tagName))
            return;
        if (this.link)
            window.location.href = this.link;
    },
    
    getShortcutCaption: function(){
        if (!this.shortcut) return " ";
        var result = [];
        if (this.shortcut.alt) result.push("Alt");
        if (this.shortcut.ctrl) result.push("Ctrl");
        if (this.shortcut.shift) result.push("Shift");
        result.push(Event.getKeyName(this.shortcut.key));
        return result.join("+");
    },
    
    createContentContainer: function(tr){
        this.cells = Element.build([
            this.getOption("marginLeftCell"), 
            this.getOption("contentCell"), 
            { tagName:"td", body: this.getShortcutCaption(), style: "padding:0px 0px 0px 5px;margin:0px;cursor:" + Menu.Item.DefaultCursorStyle },
            this.getOption("marginRightCell")
        ],tr);
        this.marginLeftCell = this.cells[0];
        this.contentCell = this.cells[1];
        this.marginRightCell = this.cells[3];
        if (this.items && this.items.length>0){
            var key = "havingItemsHtml" + ((this.parentItem)?this.parentItem.getOption("direction"):"vertical").capitalize();
            this.marginRightCell.innerHTML = this.getOption(key);
        }
        this.updateContent(this.cells[1]);
    },
    
    updateContent: function(container){
        if (!this.content)
            this.content = (this.link)?{"tagName":"a", "href": this.link, "body": this.text}:this.text;
        if (!this.content.nodeType)
            this.content = Element.build(this.content,container);
    },
    
    changeActiveItem: function(newActiveItem){
        this.blurItems(newActiveItem);
        this.activeItem = newActiveItem;
    },
    
    cancelActiveItem: function(oldActiveItem){
        if (this.activeItem == oldActiveItem)
            this.activeItem =null;
    },
    
    focus: function(){
        if (!this.contentCell)
            return;
        if (!this.defaultBackgroundColor){
            this.defaultBackgroundColor = this.contentCell.style.backgroundColor;
            this.defaultColor = this.contentCell.style.color;
        }
        for(var i=0;i<this.cells.length;i++){
            var cell=this.cells[i];
            cell.style.backgroundColor = this.getOption("selectedBgColor");
            cell.style.color = this.getOption("selectedColor");
        }
        if (this.parentItem) this.parentItem.changeActiveItem(this);
    },
    blur: function(){
        if (this.parentItem) this.parentItem.cancelActiveItem(this);
        if (this.cells){
            for(var i=0;i<this.cells.length;i++){
                var cell=this.cells[i];
                cell.style.backgroundColor = this.defaultBackgroundColor;
                cell.style.color = this.defaultColor;
            }
        }
        this.blurItems();
    },
    blurItems: function(exceptedItem){
        if (!this.items) return;
        for(var i=0; i<this.items.length;i++){
            var item = this.items[i];
            if (item == exceptedItem) continue;
            if (item.blur) item.blur();
        }
    },
    
    bodyVisible: function(){
        return (this.body)?Element.visible(this.body):false;
    },
    
    createBody: function(){
        this.body = Element.build(this.getOption("body"),document.body);
        Element.hide(this.body);
    },
    showBody: function(){
        this.cancelHiding();
        if (!this.items || this.items.length < 1) return;
        if (!this.body){
            this.createBody();
            this.updateBody();
    		this.shim = HTMLIFrameElement.Shim.create(this.body);
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
		this.shim.enableShim();
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
        this.shim.disableShim();
        this.hideItems();
    },
    hideItems: function(exceptedItem){
        if (!this.items) return;
        for(var i=0; i<this.items.length;i++){
            var item = this.items[i];
            if (item == exceptedItem) continue;
            this.items[i].hideBodySoon();
        }
    },
    
    isChildElement: function(element){
        if (!this.cells)
            return false;
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
            if (item.isChildElement(element))
                return item;
        }
        return null;
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
        Event.observe(document, "click", this.documentClicked.bindAsEventListener(this));
    },
    getOptionForChild: function(key, item){
        switch(key){
            case "direction": return this.options.itemDirection;
            case "havingItemsHtmlHorizontal":
            case "havingItemsHtmlVertical":
                return (item.getTreeLevel() < this.options.havingItemsHtmlMinLevel) ? "" : this.options[key];
        }
        return this.getOption(key);
    },
    documentClicked: function(event){
        var element = Event.element(event);
        try{
            this.visit(function(item){
                if (item.isChildElement(element))
                    throw "elementFound"; 
            });
        }catch(ex){
            if (ex == "elementFound") return;
            throw ex;
        }
        this.blurItems();
        this.hideItems();
    }
}
Object.extend(Menu.prototype, Menu.Item.Methods);
Object.extend(Menu.prototype, Menu.Methods);



Menu.KeyHandler = Class.create();
Menu.KeyHandler.DefaultOptions = {
    activateHandlingSoon: true,
    triggerKey: {event:"keydown", ctrl:true, key: Event.KEY_ALT }
}
Menu.KeyHandler.Methods = {
    initialize: function(menu, options){
        this.options = Object.fill(options||{}, Menu.KeyHandler.DefaultOptions);
        this.active = false;
        this.menu = menu;
        this.activeParent = null;
        if (this.options.activateHandlingSoon)
            this.activateHandling();
    },
    activateHandling: function(){
        this.options.triggerKey.method = this.toggleActive.bindAsEventListener(this);
        var activeMatcher = this.matchWhenActive.bind(this);
        var actions = [
            this.options.triggerKey,
            {event:"keydown", key: Event.KEY_UP   , method: this.goUp.bindAsEventListener(this), match: activeMatcher },
            {event:"keydown", key: Event.KEY_DOWN , method: this.goDown.bindAsEventListener(this), match: activeMatcher },
            {event:"keydown", key: Event.KEY_LEFT , method: this.goLeft.bindAsEventListener(this), match: activeMatcher },
            {event:"keydown", key: Event.KEY_RIGHT, method: this.goRight.bindAsEventListener(this), match: activeMatcher },
            {event:"keyup", key: Event.KEY_RETURN, method: this.hitEnter.bindAsEventListener(this), match: activeMatcher }
        ];
        this.menu.visit(function(menuItem){
            if (!menuItem.shortcut) return;
            menuItem.shortcut.method = menuItem.shortcut.method || menuItem.action;
            menuItem.shortcut.event = menuItem.shortcut.event || "keydown";
            actions.push(menuItem.shortcut);
        });
        this.impl = new Event.KeyHandler(document, actions);
    },
    matchWhenActive: function(action, event, keyCode, keyHandler) {
        return (this.menu.activeItem) && (keyHandler.matchAction(action, event, keyCode));
    },
    toggleActive: function(event){
        this.active = !this.active;
        if (this.active){
            this.activeParent = this.menu;
            if (this.activeParent.items && this.activeParent.items.length>0)
                this.activeParent.items[0].focus();
        }else{
            this.menu.blurItems();
            this.menu.hideItems();
            this.activeParent = null;
        }
    },
    
    isHorizontalMode: function(){
        this.prepareActiveParent();
        return this.activeParent.getOption("direction") == "horizontal";
    },
    
    goUp: function(event){
        if (this.isHorizontalMode())
            this.goToParent();
        else 
            this.goToSibling(-1);
    },
    goDown: function(event){
        if (this.isHorizontalMode())
            this.goToChild();
        else
            this.goToSibling(1);
    },
    goLeft: function(event){
        if (this.isHorizontalMode())
            this.goToSibling(-1);
        else
            this.goToParent();
    },
    goRight: function(event){
        if (this.isHorizontalMode())
            this.goToSibling(1);
        else
            this.goToChild();
    },
    hitEnter: function(event){
        if (this.activeParent.activeItem)
            this.activeParent.activeItem.action(event);
    },
    
    prepareActiveParent: function(){
        if (this.activeParent) return;
        for(var current=this.menu;(current);current=current.activeItem){
            this.activeParent=current;
        }
    },
    
    goToSibling: function(direction){
        this.prepareActiveParent();
        var idx = this.activeParent.items.indexOf(this.activeParent.activeItem) + direction;
        if (idx < 0) idx = this.activeParent.items.length -1;
        else if (idx > this.activeParent.items.length -1) idx = 0;
        this.activeParent.items[idx].focus();
    },
    goToParent: function(){
        this.prepareActiveParent();
        if (this.activeParent.parentItem && this.activeParent.parentItem != this.menu) {
            this.activeParent.activeItem.blur();
            this.activeParent.hideItems();
            this.activeParent = this.activeParent.parentItem;
            this.activeParent.hideItems();
        }else {
            this.activeParent = this.menu;
            this.activeParent.hideItems();
            this.goToSibling(-1);
            this.goToChild(true);
        }
    },
    goToChild: function(exitWithoutChild){
        this.prepareActiveParent();
        if (this.activeParent.activeItem.bodyVisible())
            return;
        if (this.activeParent.activeItem.items && this.activeParent.activeItem.items.length > 0){
            this.activeParent.activeItem.showBody();
            this.activeParent = this.activeParent.activeItem;
            this.activeParent.items[0].focus();
        } else if (!exitWithoutChild){
            this.activeParent = this.menu;
            this.activeParent.hideItems();
            this.goToSibling(1);
            this.goToChild(true);
        }
    }
};
Object.extend(Menu.KeyHandler.prototype, Menu.KeyHandler.Methods);