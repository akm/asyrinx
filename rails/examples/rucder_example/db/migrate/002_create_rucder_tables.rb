class CreateRucderTables < ActiveRecord::Migration
  def self.up
    create_table :rucder_tables do |t|
      t.column :name, :string, :null => false
    end
    create_table :rucder_logs do |t|
      t.column :sql, :text # :string, :limit => 4000 # for Oracle
      t.column :parsed_sql, :text # :string, :limit => 4000 # for Oracle
      t.column :stack_trace, :text # :string, :limit => 4000 # for Oracle
      t.column :created_at, :datetime
    end
    create_table :rucder_trace_lines do |t|
      t.column :line, :string
      t.column :created_at, :datetime
    end
    create_table :rucder_cruds do |t|
      t.column :table_id, :integer, :null => false
      t.column :log_id, :integer, :null => false
      t.column :name, :string, :null => false
    end
  end

  def self.down
    drop_table :rucder_cruds
    drop_table :rucder_trace_lines
    drop_table :rucder_logs
    drop_table :rucder_tables
  end
end
