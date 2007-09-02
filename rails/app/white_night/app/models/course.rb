class Course < ActiveRecord::Base
  
  belongs_to :creator, :class_name => 'User', :foreign_key => 'creator_id'

  has_many :spots


  def save_with_spots(spots)
    Course.transaction do 
      self.save!
      spots.each do |spot_hash|
        Spot.create!(spot_hash.merge(:course_id => self.id))
      end
    end
  end
end
