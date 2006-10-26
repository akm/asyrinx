class CreatePk1Strs < ActiveRecord::Migration
  def self.up
    create_table :pk1_str, :primary_key => :pk1 do |t|
      t.column :pk1, :string, :limit => 10, :null => false
      t.column :name, :string, :limit => 30, :null => true
    end
  end

  def self.down
    drop_table :pk1_str
  end
end
