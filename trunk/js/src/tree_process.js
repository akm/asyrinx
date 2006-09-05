/**
 * tree_process.js
 * 
 * require prototype.js, prototype_ext.js 
 *
 * @copyright T.Akima
 * @license LGPL
 */

TreeProcess = {}
TreeProcess.Processor = Class.create();
TreeProcess.Processor.DefaultOptions = {
    "dispatch_method": "dispatch"
};
TreeProcess.Processor.DefaultContext = {
	"command_method": "execute", 
	"iterations": [],
	"iterators": [],
    "iteration_level": -1,
    "iteration": null,
    "iteration_name": null,
    "iterator": null,
    "iterator_name": null,
    "command_delay": 0
}
TreeProcess.Processor.prototype = {
    initialize: function(options) {
		this.active = false;
		this.options = Object.extend( $H(TreeProcess.Processor.DefaultOptions), options || {} );
		this.running = false;
    },
    
    createContext: function() {
		var result = $H( TreeProcess.Processor.DefaultContext );
		result["processor"] = this;
        return result;
    },
	
    createSubContext: function( parent_context ) {
		var result = this.createContext();
		result["parent_context"] = parent_context;
		return result; 
    },
	
	start: function( command, context ) {
        context = context || this.createContext();
		context["command"] = command;
        return this.process( context );
    },

    process: function( context ) {
        this.running = true;
        try {
            this.process_iteration(context);
        } finally {
            this.running = false;
            this.stopping = false;
        }
        return context;
    },
    
    process_iteration: function(context) {
        if (!context.iterations)
            throw "no iterations in context" + context.inspect();
		if (context.iterations.constructor != Array)
			context.iterations = context.iterations.split(',');
		context.iterations = context.iterations.collect(function(iter){ return iter.strip(); } );
        if (context.iteration_level == null || context.iteration_level == undefined )
            throw "no iteration_level in context: iterations" + context.iterations.inspect();
		var context_bak = {
			"iteration_level": context.iteration_level,
			"iteration_name": context.iteration_name,
			"iteration": context.iteration
		}
        context.iteration_level += 1;
        var iteration_level = context.iteration_level;
		try {
			if (iteration_level < context.iterations.length) {
		        var iteration_names = context.iterations[iteration_level];
		        if (!iteration_names)
		            throw "no iteration_names in context: level[" + iteration_level + "] in " + context.iterations.inspect();
				if (iteration_names.constructor != Array)
					iteration_names = [iteration_names];
				try {
					for(var i = 0; i < iteration_names.length; i++) {
						context.iteration_name = iteration_names[i];
						context.iteration = (context.iterator) ? context.iterator[context.iteration_name] : context[context.iteration_name];
						if (!context.iteration) {
							throw "no context.iteration:" + 
								" context.iteration_name=" + context.iteration_name + 
								" context.iteration_level=" + context.iteration_level;
						}
						var process_method = (context.iteration_name.endWith("s")) ? this.process_plural : this.process_singular;
						process_method.apply(this, [context]);
					}
				} finally {
				}
			} else {
				if (context.iterations.length > 0)
					throw "something wrong...";
				this.process_impl(context);
			}
		} finally {
            context.iteration_level = context_bak.iteration_level;
			context.iteration_name = context_bak.iteration_name;
			context.iteration = context_bak.iteration;
			context["clear context.iteration count"] = context["clear context.iteration count"] || 0;
			context["clear context.iteration count"] += 1
		}
    },
	
	process_plural: function(context) {
		var context_bak = {
			"iterator": context.iterator,
			"iterator_name": context.iterator_name
		};
		//複数形になっているはずだから単数形にしておく
		var singularized_iteration_name = context.iteration_name.singularize(); 
		for(var i = 0; i < context.iteration.length; i++) {
			context.iterator = context.iteration[i];
			context.iterator_name = singularized_iteration_name;
			context.iterators.push(context.iterator);
			context[context.iterator_name] = context.iterator; 
	        try {
				if (!context.iterator) {
					throw "no context.iteration:" + 
						" context.iteration_name=" + context.iteration_name + 
						" context.iterator_name=" + context.iterator_name + 
						" context.iteration_level=" + context.iteration_level;
				}
				this.process_impl(context);
	        } catch(ex) {
				if (this.match_flow_exception(context, ex)) {
		            if (ex.flow == "continue") continue;
		            if (ex.flow == "break") break;
		            if (ex.flow == "exit") return;
				}
	            throw ex;
			} finally {
				context.iterators.pop();
				context.iterator = context_bak.iterator;
				context.iterator_name = context_bak.iterator_name;
			}
		}
	},
    
	process_singular: function(context) {
		var context_bak = {
			"iterator": context.iterator,
			"iterator_name": context.iterator_name
		};
		try {
			context.iterator = context.iteration;
			context.iterator_name = context.iteration_name;
			context.iterators.push(context.iterator);
			context[context.iterator_name] = context.iterator; 
			if (!context.iterator) {
				throw "no context.iteration:" + 
					" context.iteration_name=" + context.iteration_name + 
					" context.iterator_name=" + context.iterator_name + 
					" context.iteration_level=" + context.iteration_level;
			}
			this.process_impl(context);
        } catch(ex) {
			if (this.match_flow_exception(context, ex)) {
	            if (ex.flow == "continue") return; //continue;
	            if (ex.flow == "break") return; //break;
	            if (ex.flow == "exit") return;
			}
            throw ex;
		} finally {
			context.iterators.pop();
			context.iterator = context_bak.iterator;
			context.iterator_name = context_bak.iterator_name;
        }
	},
	
	match_flow_exception: function(context, ex) {
		if (ex.iteration) {
			return (ex.iteration == context.iteration_name);
		} else if (ex.iterator) {
			return (ex.iteration == context.iteration_name);
		} else if (ex.iteration_level == context.iteration_level) {
			return true;
		}
		return false;
	},
	
	process_impl: function(context) {
        if (this.stopping)
            throw {"flow":"exit", "iteration_level":0};
        if (context.iteration_level < context.iterations.length -1 ) {
            this.process_iteration(context);
        } else {
            this.execute_command(context);
        }
	},
    
    execute_command: function(context) {
        var command = context["command"];
        if (!command)
            throw "command is unspecified in context.";
        var receiver = command;
        var f = null;
        if (command.constructor == Function) {
            receiver = null;
            f = command;
        } else {
    		var command_method = context["command_method"];
            if (!command_method)
                throw "command_method is unspecified in context.";
            f = (command_method.call) ? command_method : 
    			(command[command_method] || command[this.options.dispatch_method]);
            if (!f)
               throw "command has no method: " + context.command_method + " or " + this.options.dispatch_method;
        }
        if (context.command_delay < 1) 
            f.call(command, context);
        else {
            var contextCopy = Object.extend({}, context);
            setTimeout(f.bind(receiver, contextCopy), context.command_delay * 1);
        }
    },
    
    stop: function() {
        if (this.running)
            this.stopping = true;
    }
}
TreeProcess.Command = {
	extend: function() {
		if (arguments.length < 2)
			throw "Neather command nor extension is specified";
		var args = $A(arguments);
		var command = args.shift();
		args = args.flatten();
		for(var i = 0; i < args.length; i++) {
			Object.extend(command, args[i]);
		}	
	},
	checkExtension: function(command, name, properties) {
		for(var i = 0; i < properties.length; i++) {
			if (!command[properties[i]])
				throw name + " needs '" + properties[i] + "'";
		}
	}
};
TreeProcess.Command.Invocator = Class.create();
TreeProcess.Command.Invocator.prototype = {
	initialize: function(default_context, invocations) {
		this.invocations = invocations;
		this.default_context = default_context;
	},
	execute: function(parent_context) {
		if (this.invocations.length < 1)
			return;
		var context = parent_context.processor.createSubContext(context);
		Object.extend(context, this.default_context);
		//
		this.prepareContext(context, this.invocations[0]);
		context.processor.start(this.invocations[0].command, context);
		for(var i = 1; i < this.invocations.length; i++) {
			this.prepareContext(context, this.invocations[i]);
			context.processor.process(context);
		}
	},
	
	prepareContext: function(context, invocation) {
		context["iterations"] = invocation.iterations || [];
		context["command_method"] = invocation.method || "execute";
		context["command"] = invocation.command;
	}
};

TreeProcess.Command.Delegate = Class.create();
TreeProcess.Command.Delegate.prototype = {
	initialize: function() {
		var args = $(arguments);
		this.invocations = [];
		for(var i = 0; i < args.length; i += 2) {
			this.invocations.push( {
				"method": args[i],
				"delegate": args[i + 1]
			} );
		}
		if (this.invocations.length > 0) {
		}
	},
	execute: function(context) {
		for(var i = 0; i < this.invocations.length; i++) {
			var invocation = this.invocations[i];
			invocation.delegate[invocation.method](context);
		}
	}
}


TreeProcess.Command.Find = Class.create();
TreeProcess.Command.Find.prototype = {
	initialize: function() {
		TreeProcess.Command.extend(this, {
			find_target_name: "iterator",
			result_name: "find_result"
		}, $A(arguments));
		TreeProcess.Command.checkExtension(this,
			"TreeProcess.Command.Find", ["find_target_name", "result_name", "match"]);
	},
	findAll: function(context) {
		if (this.match(context)) {
			var result = context[this.result_name] || [];
			context[this.result_name] = result;
			result.push(context[this.find_target_name]);
		}
	},
	findOne: function(context) {
		if (this.match(context)) {
			context[this.result_name] = context[this.find_target_name];
			throw {"flow": "exit", "iteration_level":0};
		}
	}
};

TreeProcess.Command.Collect = Class.create();
TreeProcess.Command.Collect.prototype = {
    initialize: function(){
		TreeProcess.Command.extend(this, {
			collect_target_name: "iterator",
			result_name: "collect_result"
		}, $A(arguments));
		TreeProcess.Command.checkExtension(this,
			"TreeProcess.Command.ShowHide", ["collect_target_name", "result_name"]);
	},
    collect: function(context) {
		var result = context[this.result_name] || [];
		context[this.result_name] = result;
		result.push( this.select(context) );
    },
	select: function(context) {
		return context[this.collect_target_name];
	}
} 

TreeProcess.Command.ShowOrHide = Class.create();
TreeProcess.Command.ShowOrHide.prototype = {
    initialize: function(){
		TreeProcess.Command.extend(this, {
			showHide_target_name: "iterator"
		}, $A(arguments));
		TreeProcess.Command.checkExtension(this, 
			"TreeProcess.Command.ShowHide", ["showHide_target_name", "predicate"]);
	},
    showOrHide: function(context) {
        context[this.showHide_target_name].style.display = (this.predicate(context) ? "" : "none");
    }
}



TreeProcess.Command.InnerText = Class.create();
TreeProcess.Command.InnerText.DefaultOptions = {
    "ignore_case": true,
    "className": null
};
TreeProcess.Command.InnerText.prototype = {
    initialize: function(options) {
		this.options = Object.extend( $H(TreeProcess.Command.InnerText.DefaultOptions), options || {} );
    },
    setup: function(context) {
        var value = context["matching_value"];
        this.value = (!value) ? "" : (this.options["ignore_case"]) ? value.toLowerCase() : value;
    },
    execute: function(context) {
        var text = this.getTextOf(context["row"]) 
        if (!text)
            return (this.value == "");
        if (this.options["ignore_case"])
            text = text.toLowerCase();
        return (text.indexOf(this.value) > -1);
    },
    
    getTextOf: function(row) {
        if (this.options["className"]) {
            var nodes = document.getElementsByClassName(this.options["className"], row);
            if (nodes.length < 1)
                return null;
            var result = "";
            for(var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                result += (node.innerText || node.textContent);
            }
            return result
        } else {
            return row.innerText || row.textContent;
        }
    }
}
