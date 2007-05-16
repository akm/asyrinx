require 'rucder_sql_parser'
class RucderLog < ActiveRecord::Base
  has_many :cruds, :dependent => :destroy, :class_name => "RucderCrud", :foreign_key => "rucder_log_id", :order => 'name asc, table_id asc'

  def self.service_begin
    @rucder_in_service = true
  end

  def self.service_end
    @rucder_in_service = false
  end
  
  def self.service(event, db_args)
    return if @rucder_in_service
    service_begin
    begin
      sql = db_args[0].gsub(/\n/, '').strip
      @sql_parser ||= ActiveRecord::Rucder::SqlParser.new
      parsed = nil
      begin
        parsed = @sql_parser.call(sql, :ignore_values => true)
      rescue
        logger.debug("\n" * 10)
        logger.warn("failed to parse: #{sql}\ncause: #{$!}")
        logger.debug("\n" * 10)
      end
      key_sql = parsed ? parsed.inspect : nil
      key_caller = filter_caller.join("\n")
      if key_sql
        log = RucderLog.find(:first, :conditions => [
          "parsed_sql = ? and stack_trace = ?", key_sql, key_caller
        ])
      else
        log = RucderLog.find(:first, :conditions => [
          "sql = ? and parsed_sql IS NULL and stack_trace = ?", sql, key_caller
        ])
      end
      unless log
        log = RucderLog.create(:sql => sql, :parsed_sql => key_sql, :stack_trace => key_caller)
        if parsed
          RucderCrud.service(log, parsed)
          RucderIrun.service(log, parsed)
        end
      end
    ensure
      service_end
    end
  end
  
  def self.filter_caller(callers = nil)
    callers ||= caller(2)
    prev_match = false
    callers.reverse.select{|line|
      prev_match_bak = prev_match
      prev_match = match_line(line)
      prev_match_bak || prev_match
    }.reverse.map{|line|line.gsub(/:\d*:in /, ':in ')}
  end
  
  RAILS_PACKAGES = %w(actionmailer actionpack actionwebservice activerecord activesupport railities rails)

  FILTER_DENY = Regexp.union( *(
    RAILS_PACKAGES.map{|package| "\/vendor\/plugins\/#{package}"} +
    RAILS_PACKAGES.map{|package| "/gems/#{package}"} + [
      "/vendor/rails/",
      "/vendor/plugins/rucder/",
      "/lib/commands/servers",
      "/benchmark.rb",
      "/thread.rb",
      "/pstore.rb",
      "/cgi\/session.rb",
      "/webrick/",
      "/gems/mongrel",
      "/rubygems/custom_require.rb",
      /^script\/server/
  ] ) )
  
  def self.match_line(line)
    return !(FILTER_DENY =~ line)
  end
  
  
  INNER_JOIN_LOGS_TO_CRUDS = "inner join rucder_cruds on rucder_cruds.rucder_log_id = rucder_log.id"
  INNER_JOIN_CRUDS_TO_TABLES = "inner join rucder_tables on rucder_tables.id = rucder_cruds.table_id"
  
  def self.options_to_find(params)
    table = (params[:table] || '').downcase
    types = (params[:types] || '').downcase
    joins = []
    where = []
    parameters = []
    unless table.blank?
      if table == "null"
        log_ids = RucderLog.connection.select_values("select rucder_logs.id from rucder_logs left outer join rucder_cruds on rucder_cruds.rucder_log_id = rucder_logs.id having count(rucder_cruds.id) < 1")
        where << "rucder_logs.id in (?)"
        parameters << log_ids.compact.map{|id|id.to_i}
      else
        where << "rucder_tables.name like ? "
        parameters << "%#{table}%"
        joins << INNER_JOIN_LOGS_TO_CRUDS
        joins << INNER_JOIN_CRUDS_TO_TABLES
      end
    end
    unless types.blank? || types == 'all'
      if types == 'none'
        where << "rucder_cruds.name not in (?)"
        parameters << RucderCrud::TYPE_ABBREVIATIONS.values
      else
        where << "rucder_cruds.name in (?)"
        parameters << types.split(//).map{|ch|RucderCrud::TYPE_ABBREVIATIONS[ch]}.compact
      end
      joins << INNER_JOIN_LOGS_TO_CRUDS unless joins.include?(INNER_JOIN_LOGS_TO_CRUDS)
    end
    
    result = {
      :include => {:cruds => :table},
      :order => 'created_at asc'
    }
    result[:conditions] = [where.join(' and ')]+ parameters unless where.empty?
    return result
  end
  
  
end
