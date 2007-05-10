# Rucder
module ActiveRecord
  module Rucder
    def self.append_features(base) #:nodoc:
      super

      base.extend(ClassMethods)
      base.class_eval do
        class_inheritable_accessor :rucder_enabled
    
        alias_method :create_without_rucder, :create
        alias_method :create, :create_with_rucder

        alias_method :update_without_rucder, :update
        alias_method :update, :update_with_rucder

        alias_method :destroy_without_rucder, :destroy
        alias_method :destroy, :destroy_with_rucder
      end
      
      base.instance_eval do
        alias :find_without_rucder :find
        alias :find :find_with_rucder 

        alias :find_by_sql_without_rucder :find_by_sql
        alias :find_by_sql :find_by_sql_with_rucder 

        alias :create_without_rucder :create
        alias :create :create_with_rucder 

        alias :update_all_without_rucder :update_all
        alias :update_all :update_all_with_rucder 

        alias :delete_all_without_rucder :delete_all
        alias :delete_all :delete_all_with_rucder 
      end
      
      base.rucder_enabled = true
    end

    def create_with_rucder
      result = create_without_rucder
      notify_evnet(:create) if rucder_enabled
      return result
    end
    
    def update_with_rucder
      result = update_without_rucder
      notify_evnet(:update) if rucder_enabled
      return result
    end
    
    def destroy_with_rucder
      result = destroy_without_rucder
      notify_evnet(:destroy) if rucder_enabled
      return result
    end
    
    def notify_evnet(event, trace_level = 3)
      self.class.notify_evnet(event, trace_level)
    end
    
    module ClassMethods
      def notify_evnet(event, trace_level = 2)
        @service ||= LogService.new
        @service.process(event, self, trace_level)
      end
      
      def find_with_rucder(*args)
        result = find_without_rucder(*args)
        notify_evnet(:find) if rucder_enabled
        return result
      end
      
      def find_by_sql_with_rucder(sql)
        result = find_by_sql_without_rucder(sql)
        notify_evnet(:find_by_sql) if rucder_enabled
        return result
      end

      def create_with_rucder(attributes = nil)
        result = create_without_rucder(attributes)
        notify_evnet(:create) if rucder_enabled
        return result
      end
      
      def update_all_with_rucder(updates, conditions = nil)
        result = update_all_without_rucder(updates, conditions)
        notify_evnet(:update_all) if rucder_enabled
        return result
      end
      
      def delete_all_with_rucder(conditions = nil)
        result = delete_all_without_rucder(conditions)
        notify_evnet(:delete_all) if rucder_enabled
        return result
      end
    end
    
    class LogService
      def process(event, klass, trace_level)
        ActiveRecord::Base.logger.debug("#{klass.name} #{event.to_s}\n  " << caller(trace_level).join("\n  "))
      end
    end
    
  end
end