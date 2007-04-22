Event.observe(window, "load", function(event){
    var container = document.createElement("DIV");
    container.setAttribute("id", "spec_linker_container_main");
    container.setAttribute("class", "spec_linker_container");
    document.body.appendChild(container);

    var wating_msg = document.createElement("span");
    wating_msg.setAttribute("class", "spec_linker_loading_msg");
    container.appendChild(wating_msg);
    
    new Ajax.Updater(container, "/spec_link/ajax_list", 
        {   asynchronous:true, evalScripts:true,
            parameters: {"url": document.URL} });
});