class RucderTable < ActiveRecord::Base
  has_many :cruds, :dependent => :destroy, :class_name => "RucderCrud", :foreign_key => "table_id", :order => 'name asc, log_id asc'

  INNER_JOIN_TABLES_TO_CRUDS = "inner join rucder_tables on rucder_tables.id = rucder_cruds.table_id"
  INNER_JOIN_CRUDS_TO_LOGS = "inner join rucder_logs on rucder_logs.id = rucder_cruds.log_id"

  def self.options_to_find(params)
    table = (params[:table] || '').downcase
    types = (params[:types] || '').downcase
    sql = (params[:sql] || '').downcase
    trace_line = (params[:trace_line] || '').strip
    joins = []
    where = []
    parameters = []
    unless table.blank?
      where << "rucder_tables.name like ? "
      parameters << "%#{table}%"
    end
    unless types.blank? || types == 'all'
      if types == 'none'
        where << "rucder_cruds.name not in (?)"
        parameters << RucderCrud::TYPE_ABBREVIATIONS.values
      else
        where << "rucder_cruds.name in (?)"
        parameters << types.split(//).map{|ch|RucderCrud::TYPE_ABBREVIATIONS[ch]}.compact
      end
      joins << INNER_JOIN_TABLES_TO_CRUDS
    end
    unless sql.blank?
      where << "rucder_logs.sql like ? "
      parameters << "%#{sql}%"
      joins << INNER_JOIN_TABLES_TO_CRUDS unless joins.include?(INNER_JOIN_TABLES_TO_CRUDS)
      joins << INNER_JOIN_CRUDS_TO_LOGS
    end
    unless trace_line.blank?
      where << "rucder_logs.stack_trace like ? "
      parameters << "%#{trace_line}%"
      joins << INNER_JOIN_TABLES_TO_CRUDS unless joins.include?(INNER_JOIN_TABLES_TO_CRUDS)
      joins << INNER_JOIN_CRUDS_TO_LOGS unless joins.include?(INNER_JOIN_CRUDS_TO_LOGS)
    end
    
    result = {
      :order => 'rucder_tables.name asc'
    }
    result[:conditions] = [where.join(' and ')]+ parameters unless where.empty?
    return result
  end
end
