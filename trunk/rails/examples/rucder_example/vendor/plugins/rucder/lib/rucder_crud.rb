class RucderCrud < ActiveRecord::Base
  belongs_to :table, :class_name => "RucderTable", :foreign_key => "table_id"
  belongs_to :log, :class_name => "RucderLog", :foreign_key => "rucder_log_id"

  def self.service(log, parsed_sql)
    parsed_sql = parsed_sql.dup
    crud_type = nil
    table_names = []
    if parsed_sql[:insert]
      crud_type = :insert
      table_names = [drill_down(parsed_sql, :insert, :into, :table)]
      parsed_sql[:insert].delete(:into)
    elsif parsed_sql[:update]
      crud_type = :update
      table_names = [drill_down(parsed_sql, :update, :table)]
      parsed_sql[:update].delete(:table)
    elsif parsed_sql[:delete]
      crud_type = :delete
      table_names = [drill_down(parsed_sql, :delete, :table)]
      parsed_sql[:delete].delete(:table)
    end
    table_names.each do |table_name|
      next if table_name.blank?
      table = RucderTable.find_or_create_by_name(table_name)
      RucderCrud.create(:log => log, :name => crud_type.to_s, :table => table)
    end
    
    table_names = collect_tables(parsed_sql)
    table_names.each do |table_name|
      next if table_name.blank?
      table = RucderTable.find_or_create_by_name(table_name)
      RucderCrud.create(:log => log, :name => 'read', :table => table)
    end
  end
  
  def self.drill_down(hash, *keys)
    return nil unless hash
    keys.each do |key|
      hash = hash[key]
      return nil unless hash
    end
    return hash
  end

  def self.collect_tables(hash, result = [], ancestors = [])
    hash.each do |k, v|
      if k == :table && ancestors.include?(:from)
        result << v
      elsif v.is_a?(Hash)
        ancestors.push(k)
        begin
          collect_tables(v, result, ancestors)
        ensure
          ancestors.pop
        end
      elsif v.is_a?(Array)
        v.each do |value|
          collect_tables(value, result, ancestors)
        end
      end
    end
    return result
  end
  
end
