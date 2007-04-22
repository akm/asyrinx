class CreateBookTitles < ActiveRecord::Migration
  def self.up
    create_table :book_titles do |t|
      t.column :title, :string, :limit => 255, :null => false
      t.column :authors, :string, :limit => 255, :null => false
      t.column :publisher, :string, :limit => 255, :null => false
      t.column :isbn, :string, :limit => 30, :null => false
    end
  end

  def self.down
    drop_table :book_titles
  end
end
