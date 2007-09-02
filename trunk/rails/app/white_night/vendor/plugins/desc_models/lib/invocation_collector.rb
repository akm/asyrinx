class ActiveRecord::Base
  module InvocationCollector
    module Hook
      def self.append_features(base) #:nodoc:
        super
        # base.class_inheritable_accessor :invocations
        base.class_inheritable_accessor :hooked_method_names
        base.instance_eval do
          def include_with_hook_invocation(*args, &proc)
            result = include_without_hook_invocation(*args, &proc)
            ActiveRecord::Base::InvocationCollector::Hook.hook_invocation(self, nil)
            result
          end
          alias :include_without_hook_invocation :include
          alias :include :include_with_hook_invocation
        end
        
        self.hook_invocation(base)
      end

      DEFAULT_HOOK_OPTIONS = {
        :patterns => [/\Avalidates_.*/, /\Abelongs_to\z/, /\Ahas_many\z/, /\Ahas_one\z/, /\Aextends_.*/]
      }
      
      def self.hook_invocation(klass, options = nil)
        options = DEFAULT_HOOK_OPTIONS.merge(options || {})
        method_names = klass.singleton_methods(true).select{|m|
            options[:patterns].any?{|pattern|pattern =~ m}  
          }
        method_definitions = ''
        method_names.each do |method_name|
          next if klass.respond_to?("#{method_name}_with_hook_invocation")
          next if /(_with_hook_invocation|_without_hook_invocation)/ =~ method_name
          next if klass.hooked_method_names && klass.hooked_method_names.any?{|hooked| method_name.include?(hooked) }
          klass.hooked_method_names ||= []
          klass.hooked_method_names << method_name
          method_definitions << <<-EOS
            def #{method_name}_with_hook_invocation(*args, &proc)
              invocation = {:class_name => self, :method_name => '#{method_name}', :arguments => args}
              ActiveRecord::Base::InvocationCollector::Hook.add_invocation(self, invocation)
              #{method_name}_without_hook_invocation(*args, &proc)
            end
            
            alias :#{method_name}_without_hook_invocation #{method_name}
            alias :#{method_name} #{method_name}_with_hook_invocation
          EOS
          puts "hook: #{klass.name}.#{method_name}"
        end
        
        klass.instance_eval method_definitions
        klass.instance_eval do 
          def self.invocations
            Hook.invocations(self)
          end
        end
      end
      
      def self.add_invocation(klass, invocation)
        invocations = self.invocations(klass)
        invocations << invocation unless invocations.include?(invocation)
      end
      
      def self.invocations(klass)
        @invocations_map ||= {}
        @invocations_map[klass.name] = [] unless @invocations_map[klass.name] 
        @invocations_map[klass.name]
      end
      
    end
  end
end
