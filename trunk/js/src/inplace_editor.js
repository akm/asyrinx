/**
 * brownie-editable.js
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

HTMLElement.InplaceEditor = Class.create();
Object.extend(HTMLElement.InplaceEditor, {
    classNames: [],
    
    registerByClass: function( className ) {
        HTMLElement.InplaceEditor.instance = HTMLElement.InplaceEditor.instance || new HTMLElement.InplaceEditor();
        this.classNames.push( className );
        var targets = document.getElementsByClassName( className );
        targets.each( function( element ) {
            HTMLElement.InplaceEditor.instance.add(element );
        });
    },
    
    textFieldMargins: {x:6, y:8},
    
    elements: [],
    
    addElement: function( element ) {
        this.elements.push(element);
    },
    
    instance: null
} );
HTMLElement.InplaceEditor.nullFocus = {
    initialize: function() {
    },
    
    dokeydown: function( event ) {        
    },
    
    dokeyup: function( event ) {        
    }

}
HTMLElement.InplaceEditor.Focus = Class.create();
HTMLElement.InplaceEditor.Focus.prototype = {
    initialize: function() {
    },

    dokeydown: function( event ) {        
        var keyCode = Event.getKeyCode(event);
        switch(keyCode) {
            case Event.KEY_TAB:
	            var input = Event.element(event);
	            //endEditを行うとinputのparentNodeとの関係が失われるので、その前にゲット
	            var nextEditable = this.getNextEditable( input, (event.shiftKey) ? -1 : 1 );
	            HTMLElement.InplaceEditor.instance.endEdit( input );
	            if (nextEditable)
	                HTMLElement.InplaceEditor.instance.beginEdit( nextEditable );
                break;
        }
    },
    
    dokeyup: function(event ) {
        var keyCode = Event.getKeyCode(event);
        switch(keyCode) {
            case Event.KEY_RETURN:
            case Event.KEY_ENTER:
                HTMLElement.InplaceEditor.instance.endEdit( Event.element(event) );
                break;
            case Event.KEY_ESC:
                HTMLElement.InplaceEditor.instance.cancelEdit( Event.element(event) );
                break;
            case Event.KEY_TAB:
                //TABキーを押すとonkeyupイベントが発生せず、blurしてしまう。
                break;
        }
    },
    
    getNextEditable: function( element, skip ) {
        skip = skip || 1
        if (HTMLElement.InplaceEditor.elements.length < 1)
            return null;
        if (!element)
            return HTMLElement.InplaceEditor.elements[0];
        var editableElement = (element.tagName == "INPUT") ? element.parentNode : element;
        var index = HTMLElement.InplaceEditor.elements.indexOf(editableElement);
        index += skip;
        if (index > HTMLElement.InplaceEditor.elements.length -1)
            index = 0;
        return HTMLElement.InplaceEditor.elements[index];
    },
    
    isEditableNode: function(node){
        if (!node.className || node.className == "")
            return false;
        for(var i = 0; i < HTMLElement.InplaceEditor.classNames.length; i++) {
            if (Element.hasClassName(node, HTMLElement.InplaceEditor.classNames[i]))
                return true;
        }
        return false;
    }

}
//HTMLElement.InplaceEditor.focus_controller = HTMLElement.InplaceEditor.nullFocus;
HTMLElement.InplaceEditor.focus_controller = new HTMLElement.InplaceEditor.Focus();
HTMLElement.InplaceEditor.prototype = {
    initialize: function( element ) {
        if (element)
            this.add(element);
        this.clearEditor();
    },
    
    add: function( element ) {
        HTMLElement.InplaceEditor.addElement(element);
        this.clickListener = this.clickListener || this.clickElement.bindAsEventListener(this);
        Event.observe(element, "click", this.clickListener, false);
    },
    
    to_input_text: function(element) {
        var s = element.textContent || element.innerText || "";
        return s.strip();
    },
    
    setup_input: function(element, input) {
    },
    
    to_element_html: function(element, input) {
        var s = input.value || " ";
        if (s == "")
            s = " ";
        return s.replace(/ /g, "&nbsp;");
    },
    
    tear_down_input: function(element, input) {
    },
    
    to_editable: function(element) {
        var tagName = element.tagName.toLowerCase();
        switch(tagName) {
            case 'ol':
            case 'ul':
                return Element.findNextSibling(element.firstChild, 
                    Element.predicateByTagName('li'));
            case 'table':
                return this.to_editable(Node.Finder.first(element,Node.Walk.childNodes(element), 
                    Element.Predicate.tagNames(['thead','tbody','tfoot','tr'])));
            case 'thead': 
            case 'tfoot': 
            case 'tbody': 
                return this.to_editable(Node.Finder.first(element,Node.Walk.childNodes(element), 
                    Element.Predicate.tagName('tr')));
            case 'tr':
                return (element.cells && element.cells.length > 0) ? element.cells[0] : null;
            default:
                return element;
        }
    },
    
    beginEdit: function( element ) {
        element = this.to_editable(element);
        if (!element)
            return;
        this.lastContainer = element;
        this.lastContainerInnerHTML = element.innerHTML;
        
        var text = this.to_input_text(element);
        var elementSize = { 
            width: element.clientWidth - HTMLElement.InplaceEditor.textFieldMargins.x,
            height: element.clientHeight - HTMLElement.InplaceEditor.textFieldMargins.y
        };
        element.innerHTML = "";
        this.editor = document.createElement("input");
        var textField = this.editor;
        textField.type = "text";
        textField.value = text;
        textField.style.textAlign = element.style.textAlign;
        if (elementSize.width > 0)
	        textField.style.width = elementSize.width + "px";
        if (elementSize.height > 0)
	        textField.style.height = elementSize.height + "px";
        element.appendChild(textField);
        this.observeEditor(textField);
        textField.focus();
        textField.select();
        this.setup_input(element, textField);
    },
    
    cancelEdit: function( input ) {
        this.stopObservingEditor(input);
        var container = this.lastContainer || input.parentNode;
        container.innerHTML = this.lastContainerInnerHTML;
        this.tear_down_input(container, input);
        this.clearEditor();
    },
    
    endEdit: function( input ) {
        this.stopObservingEditor(input);
        var container = this.lastContainer || input.parentNode;
        container.innerHTML = this.to_element_html(container, input);
        this.tear_down_input(container, input);
        this.clearEditor();
    },
    
    clearEditor: function() {
        this.editor = null;
        this.lastContainer = null;
        this.lastContainerInnerHTML = null; 
    },
    
    clickElement: function( event ) {
        if (this.editor)
            return;
        this.beginEdit( Event.element(event) );
    },
    
    editorBlur: function( event ) {
        this.endEdit( Event.element(event) );
    },
    
    editorKeydown: function( event ) {
        HTMLElement.InplaceEditor.focus_controller.dokeydown( event );
    },
    
    editorKeyup: function( event ) {
        HTMLElement.InplaceEditor.focus_controller.dokeyup( event );
    },
    
    observeEditor: function( editor ) {
        this.blurListener = this.blurListener || this.editorBlur.bindAsEventListener(this);
        this.keydownListener = this.keydownListener || this.editorKeydown.bindAsEventListener(this);
        this.keyupListener = this.keyupListener || this.editorKeyup.bindAsEventListener(this);
        Event.observe(editor, "keydown", this.keydownListener, false);
        Event.observe(editor, "keyup", this.keyupListener, false);
        Event.observe(editor, "blur", this.blurListener, false);
    },
    
    stopObservingEditor: function( editor ) {
        Event.stopObserving(editor, "keydown", this.keydownListener, false);
        Event.stopObserving(editor, "keyup", this.keyupListener, false);
        Event.stopObserving(editor, "blur", this.blurListener, false);
    }
}
