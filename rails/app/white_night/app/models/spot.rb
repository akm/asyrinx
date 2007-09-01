class Spot < ActiveRecord::Base

  belongs_to :course
  belongs_to :creator, :class_name => 'User', :foreign_key => 'creator_id'
  
end
