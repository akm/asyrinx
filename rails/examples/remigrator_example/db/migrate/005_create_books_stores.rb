class CreateBooksStores < ActiveRecord::Migration
  def self.up
    create_table :books_stores do |t|
      t.column "book_id", :integer, :null => false
      t.column "store_id", :integer, :null => false
    end
  end

  def self.down
    drop_table :books_stores
  end
end
