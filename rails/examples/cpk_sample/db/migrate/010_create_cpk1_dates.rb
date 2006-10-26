class CreateCpk1Dates < ActiveRecord::Migration
  def self.up
    create_table :cpk1_date, :primary_key => :pk1 do |t|
      t.column :pk1, :datetime, :null => false
      t.column :name, :string, :limit => 30, :null => true
    end
  end

  def self.down
    drop_table :cpk1_date
  end
end
