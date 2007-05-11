# Rucder
module ActiveRecord
  module Rucder
    module DatabaseStatements
      def self.append_features(base) #:nodoc:
        super
        base.class_eval do
          include ActiveRecord::Rucder::Observable
          
          alias_method :select_all_without_rucder, :select_all
          alias_method :select_all, :select_all_with_rucder
      
          alias_method :select_one_without_rucder, :select_one
          alias_method :select_one, :select_one_with_rucder
      
          alias_method :select_value_without_rucder, :select_value
          alias_method :select_value, :select_value_with_rucder
      
          alias_method :select_values_without_rucder, :select_values
          alias_method :select_values, :select_values_with_rucder
      
          alias_method :execute_without_rucder, :execute
          alias_method :execute, :execute_with_rucder
      
          alias_method :insert_without_rucder, :insert
          alias_method :insert, :insert_with_rucder
      
          alias_method :update_without_rucder, :update
          alias_method :update, :update_with_rucder
      
          alias_method :delete_without_rucder, :delete
          alias_method :delete, :delete_with_rucder
        end
      end
      
      attr_accessor :rucder_enabled
      
      def select_all_with_rucder(*args) # (sql, name = nil)
        notify_evnet(:select_all, args){ select_all_without_rucder(*args) }
      end
  
      def select_one_with_rucder(*args) # (sql, name = nil)
        notify_evnet(:select_one, args){ select_one_without_rucder(*args) }
      end
  
      def select_value_with_rucder(*args) # (sql, name = nil)
        notify_evnet(:select_value, args){ select_value_without_rucder(*args) }
      end
  
      def select_values_with_rucder(*args) # (sql, name = nil)
        notify_evnet(:select_values, args){ select_values_without_rucder(*args) }
      end
  
      def execute_with_rucder(*args) # (sql, name = nil)
        notify_evnet(:execute, args){ execute_without_rucder(*args) }
      end
  
      def insert_with_rucder(*args) #(sql, name = nil, pk = nil, id_value = nil, sequence_name = nil) 
        notify_evnet(:insert, args){ insert_without_rucder(*args) }
      end
  
      def update_with_rucder(*args) #(sql, name = nil) 
        notify_evnet(:update, args){ update_without_rucder(*args) }
      end
  
      def delete_with_rucder(*args) #(sql, name = nil) 
        notify_evnet(:delete, args){ delete_without_rucder(*args) }
      end
    end
  end
end