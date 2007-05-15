class RucderIrun < ActiveRecord::Base
  belongs_to :column, :class_name => "RucderColumn", :foreign_key => "column_id"
  belongs_to :log, :class_name => "RucderLog", :foreign_key => "log_id"

  def self.service(log, parsed_sql)
  end
  
end
