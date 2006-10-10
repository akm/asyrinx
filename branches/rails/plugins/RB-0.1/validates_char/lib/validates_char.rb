ActiveRecord::Errors.default_error_messages = {
  :accept_char => "accepts only %s",
  :deny_char => "denies %s"
}.update(ActiveRecord::Errors.default_error_messages)

require 'jp_char'

ActiveRecord::Base.class_eval do
  
  def self.validates_char(*attr_names)
    configuration = { :ignore_nil => true }
    configuration.update(attr_names.pop) if attr_names.last.is_a?(Hash)
    
    predicate = configuration[:accept] ? :accept : configuration[:deny] ? :deny : nil;
    raise(ArgumentError, "Array of (symbol or String) must be supplied as the :accept or :deny option of the configuration hash") if predicate.nil?
    
    expressions = configuration[predicate]
    configuration[:message] ||= ActiveRecord::Errors.default_error_messages[ "#{predicate.to_s}_char".to_sym ] % JpChar.type_captions(expressions) .join(",")
    
    ActiveRecord::Base.logger.debug("validates_char: #{self}" )
    
    if configuration[:conversions]
      attr_names.each{|attr_name|
        method_name = "#{attr_name.to_s}="
        original = "#{attr_name.to_s}_without_conv="
        alias_method(original, method_name) if method_defined?(method_name)
        define_method(method_name){|value|
          super(JpChar.convert(value, configuration[:conversions]))
        }
      }
    end
    
    validates_each(attr_names, configuration) do |record, attr_name, value|
      next if value.nil? && configuration[:ignore_nil]
      method = (predicate == :deny) ? :unmatch_all_char? : :match_all_char?
      match = JpChar.__send__(method, value, expressions)
      record.errors.add(attr_name, configuration[:message]) unless match
    end
  end
  
end
