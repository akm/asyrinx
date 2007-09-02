require 'invocation_collector'

ActiveRecord::Base.__send__(:include, ActiveRecord::Base::InvocationCollector::Hook)
