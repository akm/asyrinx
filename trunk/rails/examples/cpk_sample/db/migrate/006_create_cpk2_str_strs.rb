class CreateCpk2StrStrs < ActiveRecord::Migration
  def self.up
    create_table :cpk2_str_str, :primary_key => [:pk1, :pk2] do |t|
      t.column :pk1, :string, :limit => 10, :null => false
      t.column :pk2, :string, :limit => 10, :null => false
      t.column :name, :string, :limit => 30, :null => true
    end
  end

  def self.down
    drop_table :cpk2_str_str
  end
end
