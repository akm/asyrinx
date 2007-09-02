class CreateSpots < ActiveRecord::Migration
  def self.up
    create_table :spots do |t|
      t.column :name, :string, :limit => 200
      t.column :latitude, :string, :limit => 100
      t.column :longitude, :string, :limit => 100
      t.column :default_zoom, :string, :limit => 100
      t.column :comment, :text
      t.column :course_id, :integer
      t.column :creator_id, :integer
      t.column :created_at, :time
      t.column :updated_at, :time
    end
  end

  def self.down
    drop_table :spots
  end
end
