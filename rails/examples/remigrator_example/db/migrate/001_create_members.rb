class CreateMembers < ActiveRecord::Migration
  def self.up
    create_table :members do |t|
      t.column "name", :string, :limit => 100
      t.column "comment", :string, :limit => 400
      t.column "age", :integer
    end
  end

  def self.down
    drop_table :members
  end
end
