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
    
    to_editable: function(element) {
        var tagName = element.tagName.toLowerCase();
        switch(tagName) {
            case 'ol':
            case 'ul':
                return Node.Finder.first(element, Node.Walk.childNodes(element),
                    Element.Predicate.tagName('li') );
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
        skip = skip || 1;
        if (HTMLElement.InplaceEditor.elements.length < 1)
            return null;
        var firstElement = HTMLElement.InplaceEditor.to_editable(HTMLElement.InplaceEditor.elements[0]);
        if (!element)
            return firstElement;
        var eventElement = element;
        element = (element.tagName == "INPUT") ? element.parentNode : element;
        var registered = Node.Walk.skipTo(
                Element.Walk.parentNode,
                function(node){ return HTMLElement.InplaceEditor.elements.indexOf(node) > -1; }, 
                true)(element);
        if (!registered)
            return firstElement;
        if (registered != element) {
            var nextElement = Node.Finder.first(element,
                (skip>0)?Element.Walk.nextElement:Element.Walk.previousElement, 
                Node.Predicate.and(
                    Node.Predicate.childOf(registered),
                    Node.Predicate.exclude(eventElement),
                    Object.Predicate.not(Element.Predicate.tagNames(['thead','tbody','tfoot','tr','ol','ul'])) 
                ));
            if (nextElement)
                return HTMLElement.InplaceEditor.to_editable(nextElement);
        }
        var index = HTMLElement.InplaceEditor.elements.indexOf(registered);
        index += skip;
        if (index < 0) index = HTMLElement.InplaceEditor.elements.length -1;
        if (index > HTMLElement.InplaceEditor.elements.length -1) index = 0;
        var result;
        try{
            result = HTMLElement.InplaceEditor.elements[index];
            result = HTMLElement.InplaceEditor.to_editable( result );
        }catch(ex){
            logger.debug("getNextEditable error occurred", ex, 2);
            throw ex;
        }
        return result;

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
        element.appendChild(textField);
        textField.type = "text";
        textField.value = text;
        textField.style.textAlign = element.style.textAlign;
        if (elementSize.width > 0)
	        textField.style.width = elementSize.width + "px";
        if (elementSize.height > 0)
	        textField.style.height = elementSize.height + "px";
        this.observeEditor(textField);
        if (navigator.appVersion.indexOf("MSIE") < 0) {
            setTimeout(this.focusEditor.bind(this), 300);
        } else {
            this.focusEditor();
        }
        this.setup_input(element, textField);
    },
    
    focusEditor: function(){
        try{this.editor.focus();}catch(ex){}
        try{this.editor.select();}catch(ex){}
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
