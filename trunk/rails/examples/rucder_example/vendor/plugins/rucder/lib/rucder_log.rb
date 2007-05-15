require 'rucder_sql_parser'
class RucderLog < ActiveRecord::Base

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
      begin
        parsed = @sql_parser.call(sql, :ignore_values => true)
        if parsed
          key_sql = parsed.inspect
          key_caller = filter_caller.join("\n")
          log = RucderLog.find_by_parsed_sql_and_stack_trace(key_sql, key_caller)
          unless log
            log = RucderLog.create(:sql => sql, :parsed_sql => key_sql, :stack_trace => key_caller)
            RucderCrud.service(log, parsed)
            RucderIrun.service(log, parsed)
          end
        end
      rescue
        logger.debug("\n" * 10)
        logger.warn("failed to parse: #{sql}\ncause: #{$!}")
        logger.debug("\n" * 10)
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
  
  FILTER_DENY = Regexp.union(
    /\/vendor\/plugins\/rucder/,
    /\/vendor\/rails\/actionmailer/,
    /\/vendor\/rails\/actionpack/,
    /\/vendor\/rails\/actionwebservice/,
    /\/vendor\/rails\/activerecord/,
    /\/vendor\/rails\/activesupport/,
    /\/vendor\/rails\/railities/,
    /\/vendor\/rails\/rails/,
    /\/gems\/actionmailer/,
    /\/gems\/actionpack/,
    /\/gems\/actionwebservice/,
    /\/gems\/activerecord/,
    /\/gems\/activesupport/,
    /\/gems\/railities/,
    /\/gems\/rails/,
    /\/lib\/commands\/servers/,
    /\/benchmark.rb/,
    /\/thread.rb/,
    /\/pstore.rb/,
    /\/cgi\/session.rb/,
    /\/webrick\//,
    /\/gems\/mongrel/,
    /\/rubygems\/custom_require.rb/,
    /^script\/server/
  )
  
  def self.match_line(line)
    return !(FILTER_DENY =~ line)
  end
  
end
