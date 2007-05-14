# Rucder
module ActiveRecord
  module Rucder
    def self.rucder_service
      @rucder_service
    end
    def self.rucder_service=(new_service)
      @rucder_service = new_service
    end

    def self.notify_evnet(event, context)
      ActiveRecord::Rucder.rucder_service ||= DatabaseLogService.new
      ActiveRecord::Rucder.rucder_service.call(event, context)
    end
    
    module Observable
      def notify_evnet(event, arguments)
        ActiveRecord::Rucder.notify_evnet(event, {:arguments => arguments}) if rucder_enabled && !@in_notification
        @in_notification = true
        begin
          return yield if defined? yield
        ensure
          @in_notification = false
        end
      end
    end
    
    class LogService
      def call(event, context)
        # ActiveRecord::Base.logger.debug("#{event.to_s} #{context.inspect}\n  " << caller(trace_level).join("\n  "))
        ActiveRecord::Base.logger.debug("#{event.to_s} #{context.inspect}")
      end
    end
    
    class DatabaseLogService
      def call(event, context)
        RucderLog.service(event, context[:arguments])
      end
    end
  end
end
