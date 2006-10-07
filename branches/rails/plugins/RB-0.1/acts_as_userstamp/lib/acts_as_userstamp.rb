require RAILS_ROOT + '/vendor/plugins/userstamp/lib/userstamp'

module ActiveRecord
  
  class Base
    @@user_model = nil
    cattr_accessor :user_model
    
    def self.user_model
      @@user_model ||= Object.const_get(self.user_model_class_name)
      @@user_model
    end
    
    def self.user_model_class_name
      self.user_model_name.to_s.singularize.humanize
    end
    
    @@userstamp_options = {
      :belongs_to => true,
      :name_created_by => :created_by, 
      :name_updated_by => :updated_by, 
      :ignore_empty => true
    }
    
    def self.acts_as_userstamp( options = {} )
      @@userstamp_options = @@userstamp_options.update(options)
      @@user_model = self
      self.class_eval do 
        cattr_accessor :current_user
      end
    end
    
    def self.inherited(subclass)
      if @@userstamp_options[:belongs_to]
        self.belongs_to_user(subclass, @@userstamp_options[:name_created_by])
        self.belongs_to_user(subclass, @@userstamp_options[:name_updated_by])
      end
    end
    
    def self.belongs_to_user(klass, name_sym, options = {})
      options[:foreign_key] ||= name_sym.to_s
      options[:class_name] ||= ActiveRecord::Base.user_model_class_name
      if klass.columns.any?{|col| (col.name==name_sym.to_s) && col.number? }
        klass.class_eval do
          belongs_to name_sym,
          :class_name => options[:class_name], 
          :foreign_key => options[:foreign_key]
        end
      end
    end
    
    def self.method_added( method_name )
      if @@userstamp_options[:ignore_empty]
        @@setter_names ||= [
          (@@userstamp_options[:name_created_by].to_s + '=').to_sym,
          (@@userstamp_options[:name_updated_by].to_s + '=').to_sym
        ]
        if @@setter_names.include?(method_name)
          original = "default_#{method_name.to_s}"
          filtered = "ignore_empty_#{method_name.to_s}"
          return if self.method_defined? original
          alias_method(original, method_name)
          define_method(filtered){ |value|
            value = nil if value.respond_to?(:empty?) && value.empty?
            self.__send__(original, value)
          }
          alias_method(method_name, filtered);
        end
      end
    end
    
  end
end

module UserstampController
  module AuthGeneratorAdaptor
    def userstamp
      user = nil
      if !@user.nil? && @user.ident
        @user.reload 
        user = @user.ident ? @user : nil
      end
      ActiveRecord::Base.user_model.current_user = user
    end
  end
  
  module LoginEngineAdaptor
    def userstamp
      user = session[:user]
      user_model = ActiveRecord::Base.user_model
      user_model.current_user = (user.nil?) ? nil : user_model.find(:first, :conditions =>["id = ?", user.id])
    end
  end
  
  ADAPTORS = {'LoginEngine' => LoginEngineAdaptor, 'AccountSystem' => AuthGeneratorAdaptor }
  
  def self.included(controller_class)
    super
    module_names = controller_class.included_modules.collect{|m| m.name }
    ADAPTORS.each_pair{|k,v|
      if module_names.include? k
        controller_class.__send__(:include, v)
        controller_class.before_filter :userstamp
        controller_class.logger.info("#{self.name} made #{controller_class.name} include #{v.name} because it included #{k}")
        break
      end
    }
  end
end
