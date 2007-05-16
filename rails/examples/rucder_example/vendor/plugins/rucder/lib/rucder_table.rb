class RucderTable < ActiveRecord::Base
  has_many :columns, :dependent => :destroy, :class_name => "RucderColumn", :foreign_key => "table_id"
  has_many :cruds, :dependent => :destroy, :class_name => "RucderCrud", :foreign_key => "table_id", :order => 'name asc, rucder_log_id asc'

  INNER_JOIN_TABLES_TO_CRUDS = "inner join rucder_tables on rucder_tables.id = rucder_cruds.table_id"

  def self.options_to_find(params)
    table = (params[:table] || '').downcase
    types = (params[:types] || '').downcase
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
    
    result = {
      :order => 'rucder_tables.name asc'
    }
    result[:conditions] = [where.join(' and ')]+ parameters unless where.empty?
    return result
  end
end
