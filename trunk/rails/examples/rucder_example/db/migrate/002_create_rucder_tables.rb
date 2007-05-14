class CreateRucderTables < ActiveRecord::Migration
  def self.up
    create_table :rucder_tables do |t|
      t.column :name, :string, :null => false
    end
    create_table :rucder_columns do |t|
      t.column :table_id, :integer, :null => false
      t.column :name, :string, :null => false
    end
    create_table :rucder_logs do |t|
      t.column :sql, :text
      t.column :parsed_sql, :text
      t.column :stack_trace, :text
      t.column :created_at, :datetime
    end
    create_table :rucder_cruds do |t|
      t.column :table_id, :integer, :null => false
      t.column :rucder_log_id, :integer, :null => false
      t.column :name, :string, :null => false
    end
    create_table :rucder_iruns do |t|
      t.column :column_id, :integer, :null => false
      t.column :rucder_log_id, :integer, :null => false
      t.column :name, :string, :null => false
    end
  end

  def self.down
    drop_table :rucder_iruns
    drop_table :rucder_cruds
    drop_table :rucder_logs
    drop_table :rucder_columns
    drop_table :rucder_tables
  end
end
