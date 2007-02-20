# copyright akima
class Select

  module Helper
    def self.empty?( s )
      return true unless s
      return s.empty? if s.respond_to? "empty?"
      return false
    end
    
    def self.build_or_to_s( obj, params )
      return obj.respond_to?(:build) ? obj.build(params) : obj.to_s
    end
  end

  attr_accessor :fields
  attr_accessor :from
  attr_accessor :where
  attr_accessor :group_by
  attr_accessor :having
  attr_accessor :order_by
  attr_accessor :limit
  attr_accessor :offset
  
  def initialize( fields = nil )
    @fields = fields
    @from = FromPhase.new
    @where = Conditions.new(:bracket => false)
    @group_by = nil
    @having = Conditions.new
    @order_by = nil
    @limit = nil
    @offset = nil
  end

  def to_s
    return build
  end
  
  def params
    p = []
    build p
    return p
  end
  
  def build(params = nil)
    result_params = (params) ? nil : params = []
    s = "select " + (Helper.empty?(@fields) ? "*" : @fields)
    append_phase_and_params(s, params, " from ", @from)
    append_phase_and_params(s, params, " where ", @where)
    append_phase_and_params(s, params, " group by ", @group_by)
    append_phase_and_params(s, params, " having ", @having)
    append_phase_and_params(s, params, " order by ", @order_by)
    append_phase_and_params(s, params, " limit ", @limit)
    append_phase_and_params(s, params, " offset ", @offset)
    if result_params
      return s, result_params
    else
      return s
    end
  end
  
  def append_phase_and_params( dest, params, preposition, obj )
    phase = Helper.build_or_to_s( obj, params )
    return if Helper.empty? phase
    dest << preposition << phase
    # params << param if param
  end
  
  def from( table = nil) 
    (table) ? @from.add(table) : @from
  end
  
  def where( condition = nil, parameters = nil, options = nil ) 
    (condition) ? @where.add(condition, parameters, options) : @where
  end
  
  def group_by( fields = nil)
    @group_by = fields if fields
    return @group_by
  end
  
  def having( condition = nil, parameters = nil) 
    (condition) ? @having.add(condition, parameters) : @having
  end
  
  def order_by( fields = nil)
    @order_by = fields if fields
    return @order_by
  end
  
  def limit( value = nil)
    @limit = value if value
    return @limit
  end
  
  def offset( value = nil)
    @offset = value if value
    return @offset
  end
  
  class ParameterizedCondition
    def initialize( expression, params, options = nil)
      @expression = expression
      @params = params
      if @params.is_a? Array
        @params = [@params] if @expression.count('?') != @params.length
      else
        @params = [@params]
      end
      @options = {
          :bracket => true
        }.merge(options || {})
    end
    
    def build(params = [])
      return "" if @expression.nil? || (@expression.respond_to?(:empty?) && @expression.empty?)
      @params.each{ |p| params.push(p) }
      return (@options[:bracket]) ? "(#{@expression})" : @expression
    end
    
    def empty?
      Helper.empty?(@expression)
    end
    
    def to_s
      @expression
    end
  end

  class Conditions
    attr_accessor :items, :bracket, :connector
    
    DEFAULT_OPTIONS = {:connector => 'and', :bracket => true}
    
    def initialize( options = nil)
      options = (options) ? DEFAULT_OPTIONS.merge(options) : DEFAULT_OPTIONS
      @connector = options[:connector]
      @bracket = options[:bracket]
      @items = []
    end
    
    def build(params = nil)
      result_params = (params) ? nil : params = []
      expressions = []
      @items.each{|item| 
        s = Helper.build_or_to_s(item, params)
        expressions << s if !Helper.empty?(s)
      }
      return "" if expressions.empty?
      result = expressions.join(" " + @connector + " ")
      result = "(#{result})" if @bracket
      if result_params
        return result, result_params
      else
        return result
      end
    end
    
    def to_s
      return build
    end
    
    def empty?
      return true if @items.empty?
      @items.each{|item|
        return false unless item.empty?
      }
      return true
    end
    
    def add( item, parameters = nil, options = nil )
      item = ParameterizedCondition.new(item, parameters, options) if parameters
      @items << item
      return self
    end
    
    def nest(options = nil)
      item = Conditions.new({:connector => 'or'}.merge(options||{}))
      @items << item
      item
    end
    
    def and( item, parameters = nil, options = nil )
      connect("and", item, parameters, options)
    end
    
    def or( item, parameters = nil, options = nil )
      connect("or", item, parameters, options)
    end
    
    def connect( connector, item, parameters = nil, options = nil )
      return self unless item.empty?
      if (connector == @connector) 
        add(item, parameters, options)
        return self
      end
      p = []
      s = self.build(p)
      #
      @items = []
      add(s, p) unless s.empty?
      add(item, parameters, options)
      @connector = connector
      return self
    end
    
    def <<( item )
      add(item)
    end
    
    def add_compare(field, value, options)
      return self if Helper.empty?(value) || Helper.empty?(field)
      options = {
        :operator => '=',
        :bind_by_percents_with_like => true
      }.merge(options || {})
      value = "%#{value}%" if options[:operator].downcase == 'like' && options[:bind_by_percents_with_like]
      add("#{field.to_s} #{options[:operator].to_s} ?", value, options)
    end
    
    def parse_add_each(field, values, options = nil, &block)
      return unless values
      options = {:delimeter => /\s/, 
        :strip_each_value => true,
        :connector => 'or', # as nest method option
        :operator => 'like' # as add_compare method option
      }.merge(options || {})
      result = self.nest(options)
      parsed = values.split(options[:delimeter])
      parsed.each{ |value| 
        value.strip! if options[:strip_each_value]
        if block
          block.call(result, field, value, options)
        else
          result.add_compare(field, value, options)
        end
      }
    end
  end
  
  class FromPhase
    def initialize
      @tables = Array.new
    end
    
    def empty?
      @tables.empty?
    end
    
    def <<(table)
      add(table)
    end
    
    def add(table)
      table = TableUnit.new(table) unless table.is_a? TableUnit
      @tables << table
      return table
    end
    
    def get(name)
      @tables.each{|table| 
        result = table.get(name)
        return result if result
      }
      return nil
    end
    
    def to_s
      return "" if empty?
      return @tables.join(", ")
    end
  end
  
  class FromUnit 
    attr_accessor :name
    attr_accessor :table
    attr_accessor :joins
    
    def initialize(table)
      @table = table
      @name = nil
      @joins = Array.new
    end
    
    def get( n )
      return self if n == @name
      @joins.each{|join| 
        result = join.get(n)
        return result if result
      }
      return nil
    end
    
    def as(name)
      @name = name
      return self
    end
    
    def to_s
      (@joins.empty?) ? "" : @joins.join(" ")
    end
    
    def join(table, join_type = "inner join")
      result = JoinUnit.new(table, join_type)
      @joins << result
      return result
    end
    def inner_join(table)
      join(table, "inner join")
    end
    def left_outer_join(table)
      join(table, "left outer join")
    end
  end
  
  class TableUnit < FromUnit
    def initialize(table)
      super(table)
    end
    
    def to_s
      subJoins = super
      result = @table + (!Helper.empty?(name) ? (" as #{name}") : "" ) + 
        (subJoins.empty? ? "" : (" " + subJoins))
    end
  end
  
  class JoinUnit < FromUnit
    attr_accessor :join_type
    attr_accessor :conditions
    def initialize(table, join_type)
      super(table)
      @join_type = join_type
      @conditions = Conditions.new
    end
    
    def on( condition = nil, parameters = nil, options = nil )
      @conditions.add(condition, parameters, options)
    end

    def to_s
      subJoins = super
      result = @join_type + " " + @table + (Helper.empty?(name) ? "" : (" as #{name}") ) + 
        ( @conditions.empty? ? "" : " on #{@conditions.to_s}") +
        (subJoins.empty? ? "" : " #{subJoins}")
    end
  end
  
end
