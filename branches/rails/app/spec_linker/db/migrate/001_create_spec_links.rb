class CreateSpecLinks < ActiveRecord::Migration
  def self.up
    create_table :spec_links do |t|
      t.column :url, :string, :limit => 255, :null => false
      t.column :descriptions, :text
      t.column :external_url, :text
    end
  end

  def self.down
    drop_table :spec_links
  end
end
