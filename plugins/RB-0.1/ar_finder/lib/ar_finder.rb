class ArFinder

  DEFAULT_OPTIONS = {:delimeter => ' ', :strip => true}
  
  def initialize(options = nil)
    @options = {}.merge(options||{})
    apply_options(@options)
  end
  
  def apply_options(options)
    return unless options
    options.each_pair{|k, v| send("#{k.to_s}=", v) if respond_to?("#{k.to_s}=") }
  end
  
  def attrs(keys)
    return unless keys
    result = {}
    keys.each{|k| result[k] = send(k) if respond_to?(k)}
    return result
  end
  
  def build_options(keys, options = nil)
    options = {:build => true}.merge(options || {})
    (build(options); options.delete(:build)) if options[:build]
    result = {}
    keys.each{ |key|
      v = respond_to?(key) ? send(key) : nil
      v ||= self.class.respond_to?(key) ? self.class.send(key) : nil
      next if v.nil? 
      formalize_method = "formalize_#{key.to_s}".to_sym
      result[key] = self.respond_to?(formalize_method) ? 
        self.send(formalize_method, v): v
    }
    return options.merge(result)
  end
  
  def formalize_joins(value)
    value.respond_to?(:join) ? value.join(' ') : value
  end
  
  def formalize_per_page(value)
    value.to_i
  end
  
  # ActiveRecord::Base::VALID_FIND_OPTIONS is protected
  VALID_FIND_OPTIONS = [ :conditions, :include, :joins, :limit, :offset,
  :order, :select, :readonly, :group, :from]
  
  def options_to_find(options = nil)
    build_options(VALID_FIND_OPTIONS, options)
  end
  
  VALID_PAGINATE_OPTIONS = [ :conditions, :include, :joins, :per_page,
  :order, :select, :count]
  
  def options_to_paginate(options = nil)
    build_options(VALID_PAGINATE_OPTIONS, options)
  end
  
  attr_accessor(*(VALID_FIND_OPTIONS - [:conditions, :order, :readonly] + [:per_page]))
  
  def conditions; @conditions; end
  def conditions=(value)
    @conditions = (value.nil? || (value.respond_to?(:empty?) && value.empty?)) ? nil : 
      value.is_a?(Array) ? to_conditions(value) : value
  end
  
  class Parameter < Hash
    attr_accessor :name
    def initialize(name, options, &proc)
      @name = name.to_sym
      self.update(options) if options
      self.instance_eval(&proc) if proc
    end
    
    def column
      self[:column] || name.to_s 
    end
    
    def excluded?
      self[:excluded]
    end
    
    def to_value(finder)
      v = finder.send(name)
      self[:to_value] ||= ParameterHelper.collect(self[:delimiter], 
        Proc.new{|value|
          filter = self[:filter] ? self[:filter] : nil
          value.nil? ? nil : filter.nil? ? value : 
            filter.respond_to?(:call) ? filter.call(value) : eval("\"#{filter}\"")
        }) 
      proc = self[:to_value]
      result = proc.call(v)
      result.empty? ? nil : 
        (result.length == 1) ? result.first : result
    end
    
    def array_statement?(statement)
      /\bin\b/i =~ statement
    end
    
    def to_statement(finder, st)
      values = self.to_value(finder)
      return st, {name => values} if (values.nil? || !values.is_a?(Array) || values.length == 1)
      return st, {name => values} if array_statement?(st)
      connector = self[:connector] || ' and '
      idx = 0
      params = {}
      result = values.collect{|value| 
        key = "#{name.to_s}#{idx += 1}"
        params[key.to_sym] = value
        st.gsub(":#{name.to_s}", ":#{key}")
      }.join(connector)
      return "(#{result})", params
    end
    
    def condition(finder)
      return nil if excluded?
      v = to_value(finder)
      return nil unless v
      if self[:join]
        (finder.joins ||= []) << self[:join]
        finder.joins.uniq!
      end
      self[:condition] ? instance_eval(self[:condition]) :
        "#{column} #{self[:operator]} :#{name.to_s}"
    end
  end
  
  module ParameterHelper
    def collect(delimeter, proc)
      Proc.new{|v| 
        v.nil? ? [] : 
        (delimeter ? v.split(delimeter) : [v]).collect{|v| 
          proc ? proc.call(v) : v} 
      }
    end
    
    def equal_with(delimeter = ' ', options = nil)
      {:to_value => self.collect(delimeter, Proc.new{|v| v}), :operator => '=' }.merge(options || {})
    end
    
    def include_in(delimeter = ',', options = nil, &proc)
      proc ||= Proc.new{|v| v}
      {:to_value => self.collect(delimeter, proc), :condition => '"#{column} in (:#{name.to_s})"' }.merge(options || {})
    end
    
    def like_start_with(delimeter = ' ', options = nil)
      {:to_value => self.collect(delimeter, Proc.new{|v| "#{v}%"}), :operator => 'like' }.merge(options || {})
    end
    
    def like_end_with(delimeter, options = nil)
      {:to_value => self.collect(delimeter, Proc.new{|v| "%#{v}"}), :operator => 'like' }.merge(options || {})
    end

    def like_include(delimeter, options = nil)
      {:to_value => self.collect(delimeter, Proc.new{|v| "%#{v}%"}), :operator => 'like' }.merge(options || {})
    end
    
    alias_method :like, :like_include
    
    extend self
  end
  extend ParameterHelper
  
  # protected
  def expand_condition(st)
    param_names = st.scan(/:(\w.*)\b/).flatten
    throw ">1 parameters in a statement is unsupported" if param_names.length > 1
    return st, nil if param_names.empty?
    param_name = param_names.first
    parameter = self.class[param_name.to_sym]
    raise "parameter not found: #{param_name}" unless parameter
    return parameter.to_statement(self, st)
  end
  
  def expand_conditions(statements, options)
    param_hash = {}
    result = []
    statements.each{|st| 
      st, params = expand_condition(st)
      result << st
      param_hash.update(params) if params
    }
    statement = result.join(options[:connect])
    return statement, param_hash
  end
  
  def to_conditions(statements, params = nil, options = nil)
    return nil if statements.empty?
    options = {:connect => ' and '}.merge(options || {})
    statement, param_hash = expand_conditions(statements, options)
    statement.index(/[\s\b\(]\:\w/) ?  [statement, params || param_hash] :
     (params && params.respond_to?(:empty?) && !params.empty?) ? [statement].concat(params) : 
    statement
  end
  
  def build_condition(param)
    param.condition(self)
  end
  
  def build(options = nil)
    st = self.class.parameters.collect{|p| build_condition(p) }
    st.compact!
    self.conditions = st
  end
  
  public
  def self.inherited(klass)
    klass.extend(ConcreteClassMethods)
  end
  
  module ConcreteClassMethods
    
    public
    def options_to_find(options)
      finder = self.new(options)
      finder.options_to_find
    end
    
    def to_sql(options)
      finder = self.new(options)
      finder.to_sql
    end
    
    public
    def default_order_option_index(value = nil)
      @default_order_option_index = value if value
      @default_order_option_index
    end
    
    def order_options(value = nil)
      @order_options = TextOptions.create(value) if value
      @default_order_option_index ||= @order_options.first.index
      @order_options
    end
    
    def order_option_names(*attrs)
      attrs = attrs.empty? ? [:index_text, :index] : attrs
      @order_options ? @order_options.to_array(*attrs) : []
    end
    
    def order_for(index)
      @order_options.nil? ? nil : 
        (option = @order_options[index]; option ? option.value : nil)
    end
    
    def parameters(*args)
      if args
        attrs = ((args.length == 1) && args.first.is_a?(Hash)) ? 
          args.first : args.inject({}){|dest, k| dest[k] = nil; dest }
        attrs.each{|attr, attr_options| parameter(attr, attr_options) }
      end
      @parameters
    end
    
    def parameter(attr, attr_options, &proc)
      @parameters ||= []
      param = Parameter.new(attr, attr_options, &proc)
      @parameters << param
      attr_accessor(attr)
      extend_parameter(attr, param)
      self
    end
    
    def [](attr)
      @parameters.detect{|p| p.name == attr.to_sym }
    end
    
    protected
    def extend_parameter(attr, attr_options)
      OptionsMethods.extend_as_selectable(self, attr, attr_options[:options]) if attr_options.respond_to?(:[]) && attr_options[:options]
      OptionsMethods.extend_as_checkable(self, attr, attr_options[:checkables]) if attr_options.respond_to?(:[]) && attr_options[:checkables]
    end
    
    public
    def select(value = nil)
      @select = value if value
      @select
    end
    
    def joins(value = nil)
      @joins = value if value
      @joins
    end
    
    def readonly(value = nil)
      @readonly = value if value
      @readonly
    end
    
    def group(value = nil)
      @group = value if value
      @group
    end
    
    def from(value = nil)
      @from = value if value
      @from
    end
    
  end
  
  module OptionsMethods
    def self.extend_as_selectable(klass, attr, options)
      attr_default_index = "#{attr.to_s}_default_index"
      attr_for = "#{attr.to_s}_for"
      attr_options = "#{attr.to_s}_options"
      attr_option_names = "#{attr.to_s}_option_names"
      var_options = "@#{attr_options}"
      var_default_index = "@#{attr_default_index}"
      class_methods = Module.new do
        define_method(attr_options) do |*values|
          result = instance_variable_get(var_options)
          value = values.empty? ? nil : values.first
          if value || result.nil?
            result = TextOptions.create(value || options)
            instance_variable_set(var_default_index, result.first.index)
            instance_variable_set(var_options, result) 
          end
          result
        end
        define_method(attr_option_names) do |*attrs| 
          attrs = attrs.empty? ? [:index_text, :index] : attrs
          options_obj = send(attr_options)
          options_obj ? options_obj.to_array(*attrs) : []
        end
        define_method(attr_default_index) do |*values| 
          value = values.empty? ? nil : values.first
          result = instance_variable_get(var_default_index)
          if value || result.nil?
            value = value || (opt = send(attr_options); opt ? opt.first.index : nil)
            instance_variable_set(var_default_index, value)
          end
          result
        end
        define_method(attr_for) do |index| 
          opt = send(attr_options)
          opt.nil? ? nil : 
            (option = opt[index]; option ? option.value : nil)
        end
      end
      klass.extend(class_methods)
      
      attr_index = "#{attr.to_s}_index"
      var_attr = "@#{attr}"
      var_index = "@#{attr_index}"
      klass.class_eval do
        define_method(attr){ instance_variable_get(var_attr) || klass.send(attr_for, send(attr_index)) }
        define_method(attr_index){ instance_variable_get(var_index) || klass.send(attr_default_index) }
        define_method("#{attr_index}="){|v| instance_variable_set(var_index, v) }
        define_method(attr_options){|*attrs| klass.send(attr_options, *attrs) }
        define_method(attr_option_names){|*attrs| klass.send(attr_option_names, *attrs) }
      end
    end
    def self.extend_as_checkable(klass, attr, options)
      attr_singularized = attr.to_s.singularize
      attr_pluralized = attr.to_s.pluralize
      #
      attr_default_indexes = "#{attr_singularized}_default_indexes"
      attr_for = "#{attr_singularized}_for"
      attrs_for = "#{attr_pluralized}_for"
      attr_options = "#{attr_singularized}_options"
      attr_option_names = "#{attr_singularized}_option_names"
      var_options = "@#{attr_options}"
      var_default_indexes = "@#{attr_default_indexes}"
      class_methods = Module.new do
        define_method(attr_options) do |*values|
          result = instance_variable_get(var_options)
          value = values.empty? ? nil : values.first
          if value || result.nil?
            result = TextOptions.create(value || options)
            instance_variable_set(var_default_indexes, result.indexes)
            instance_variable_set(var_options, result) 
          end
          result
        end
        define_method(attr_option_names) do |*attrs| 
          attrs = attrs.empty? ? [:text, :index] : attrs
          options_obj = send(attr_options)
          options_obj ? options_obj.to_array(*attrs) : []
        end
        define_method(attr_default_indexes) do |*values| 
          value = values.empty? ? nil : values.flatten
          result = instance_variable_get(var_default_indexes)
          if value || result.nil?
            value = value || (opt = send(attr_options); opt ? opt.indexes : nil)
            instance_variable_set(var_default_indexes, value)
          end
          result
        end
        define_method(attr_for) do |index| 
          opt = send(attr_options)
          opt.nil? ? nil : 
            (option = opt[index]; option ? option.value : nil)
        end
        define_method(attrs_for) do |*indexes| 
          indexes.flatten.collect{|idx| send(attr_for, idx) }
        end
      end
      klass.extend(class_methods)
      
      attr_indexes = "#{attr_singularized}_indexes"
      var_attr = "@#{attr}"
      var_indexes = "@#{attr_indexes}"
      klass.class_eval do
        define_method(attr){ instance_variable_get(var_attr) || klass.send(attrs_for, send(attr_indexes)) }
        define_method(attr_indexes){ instance_variable_get(var_indexes) || klass.send(attr_default_indexes) }
        define_method("#{attr_indexes}="){|v| 
          instance_variable_set(var_indexes, v.split(',').collect{|val|val.to_i}) 
        }
        define_method(attr_options){|*attrs| klass.send(attr_options, *attrs) }
        define_method(attr_option_names){|*attrs| klass.send(attr_option_names, *attrs) }
      end
    end
  end
  
  DEFAULT_PARAMETERS = [:order_index, :per_page]
  
  def to_params(param_names = nil)
    param_names ||= self.class.parameters.collect{|p| p.name} + DEFAULT_PARAMETERS
    
    param_names.inject({}){|dest, k| 
      v = self.send(k)
      dest[k] = v if v
      dest 
    }
  end
  
  def order
    @order ||= self.class.order_for(order_index)
  end
  
  def order=(value)
    @order = value
  end
  
  def order_index
    @order_index ||= self.class.default_order_option_index
  end
  
  def order_index=(value)
    value = value.to_i
    @order = self.class.order_for(value)
    @order_index = value
  end
  
  def order_options(*attrs)
    self.class.order_options(*attrs)
  end
  
  def order_option_names(*attrs)
    self.class.order_option_names(*attrs)
  end
  
end
