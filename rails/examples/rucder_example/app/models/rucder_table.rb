class RucderTable < ActiveRecord::Base
  has_many :columns, :dependent => :destroy, :class_name => "RucderColumn", :foreign_key => "table_id"
  has_many :cruds, :dependent => :destroy, :class_name => "RucderCrud", :foreign_key => "table_id"
end
