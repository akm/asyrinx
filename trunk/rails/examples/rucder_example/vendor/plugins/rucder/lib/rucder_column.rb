class RucderColumn < ActiveRecord::Base
  belongs_to :table, :class_name => "RucderTable", :foreign_key => "table_id"
  has_many :iruns, :dependent => :destroy, :class_name => "RucderIrun", :foreign_key => "column_id"
end
