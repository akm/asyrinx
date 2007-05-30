class CreateBooks < ActiveRecord::Migration
  def self.up
    create_table :books do |t|
       t.column :subject, :string
       t.column :writer, :string
       t.column :price, :integer
    end
  end

  def self.down
    drop_table :books
  end
end
