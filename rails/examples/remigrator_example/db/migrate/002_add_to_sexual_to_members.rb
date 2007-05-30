class AddToSexualToMembers < ActiveRecord::Migration
  def self.up
    add_column :members, :sexual, :string
  end

  def self.down
    remove_column :members, :sexual
  end
end
