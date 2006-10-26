ActiveRecord::ConnectionAdapters::ColumnDefinition.class_eval <<-'EOF'
  def to_sql
    if name.is_a? Array
      column_sql = "PRIMARY KEY (#{name.join(',')})"
    elsif type == :primary_key
      column_sql = "PRIMARY KEY (#{name})"
    else
      column_sql = "#{base.quote_column_name(name)} #{type_to_sql(type.to_sym, limit)}"
      add_column_options!(column_sql, :null => null, :default => default)
    end
    column_sql
  end
EOF

ActiveRecord::ConnectionAdapters::ColumnDefinition.send(:alias_method, :to_s, :to_sql)

ActiveRecord::ConnectionAdapters::SchemaStatements.class_eval do
    def create_table_yield_before_pk(name, options = {})
      table_definition = ActiveRecord::ConnectionAdapters::TableDefinition.new(self)

      yield table_definition

      table_definition.primary_key(options[:primary_key] || "id") unless options[:id] == false
      
      if options[:force]
        drop_table(name) rescue nil
      end

      create_sql = "CREATE#{' TEMPORARY' if options[:temporary]} TABLE "
      create_sql << "#{name} ("
      create_sql << table_definition.to_sql
      create_sql << ") #{options[:options]}"
      execute create_sql
    end
end
ActiveRecord::ConnectionAdapters::SchemaStatements.send(:alias_method, :create_table_yield_after_pk, :create_table)
ActiveRecord::ConnectionAdapters::SchemaStatements.send(:alias_method, :create_table, :create_table_yield_before_pk)


ActiveRecord::ConnectionAdapters::TableDefinition.class_eval do
  
  def primary_key_for_string(name)
    col = self[name] 
    return primary_key_int(name) if col.nil? || name.is_a?(Array) || (col.type != :string)
    column = ActiveRecord::ConnectionAdapters::ColumnDefinition.new(@base, name, :primary_key)
    @columns << column unless @columns.include? column
    self
  end
  
end

ActiveRecord::ConnectionAdapters::TableDefinition.send(:alias_method, :primary_key_int, :primary_key)
ActiveRecord::ConnectionAdapters::TableDefinition.send(:alias_method, :primary_key, :primary_key_for_string)
