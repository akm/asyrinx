class CreateStores < ActiveRecord::Migration
  def self.up
    create_table :stores do |t|
       t.column :name, :string
    end
  end

  def self.down
    drop_table :stores
  end
end
