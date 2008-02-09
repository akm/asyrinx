/**
 * checkbox.js
 * 
 * require 
 *     prototype.js 
 *     prototype_ext.js 
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */
 
if (!window["HTMLInputElement"]) HTMLInputElement = {};

HTMLInputElement.WholeCheck = Class.create();
Object.extend(HTMLInputElement.WholeCheck, {
	select_all_link: function(link, checkboxesProvider){
		return new HTMLInputElement.WholeCheck(link, checkboxesProvider, function(){return true;});
	},
	deselect_all_link: function(link, checkboxesProvider){
		return new HTMLInputElement.WholeCheck(link, checkboxesProvider, function(){return false;});
	}
});
HTMLInputElement.WholeCheck.prototype = {
    initialize: function(wholeCheckbox, checkboxesProvider, checkedGetter){
        this.getCheckboxes = Element.getElementsProvider(checkboxesProvider);
        this.getChecked = checkedGetter || function(wholeCHeckbox){return wholeCheckbox.checked;};
		Event.observe($(wholeCheckbox), "click", this.wholeCheckboxClick.bindAsEventListener(this));
    },
    wholeCheckboxClick: function(event){
        var wholeCheckbox = Event.element(event);
        var checked = this.getChecked(wholeCheckbox);
        var checkboxes = this.getCheckboxes(event);
        for(var i=0;i<checkboxes.length;i++){
            var checkbox = $(checkboxes[i]);
            checkbox.checked = checked;
        }
    }
}

HTMLInputElement.CheckboxText = Class.create();
HTMLInputElement.CheckboxText.DefaultOptions = {
    separator: ",",
    applyAutomatically: true, 
    observeCheckboxes: false
}
HTMLInputElement.CheckboxText.prototype = {
    initialize: function(checkboxText, checkboxesProvider, options){
        this.options = $H(HTMLInputElement.CheckboxText.DefaultOptions).merge(options||{});
        this.getCheckboxes = Element.getElementsProvider(checkboxesProvider);
        this.checkboxText = $(checkboxText);
        if (this.options.applyAutomatically)
            this.observe();
    },
    observe: function() {
        var formAvailable = (this.checkboxText && this.checkboxText.form);
        if (this.options.observeCheckboxes || !formAvailable) {
            var checkboxes = this.getCheckboxes();
            for(var i=0;i<checkboxes.length;i++)
                Event.observe($(checkboxes[i]), "click", this.apply.bindAsEventListener(this));
        } else {
            Event.observe(this.checkboxText.form, "submit", this.apply.bindAsEventListener(this), true);
        }
    },
    
    apply: function(event){
        var values = [];
        var checkboxes = this.getCheckboxes(event);
        for(var i=0;i<checkboxes.length;i++){
            var checkbox = $(checkboxes[i]);
            if (checkbox.checked)
                values.push(checkbox.value);
        }
        this.checkboxText.value = values.join(this.options.separator);
    }
}
