class RucderController < ActionController::Base
  
  layout 'rucder'
  
  before_filter :begin_rucder_service
  after_filter :end_rucder_service
  
  protected
  def begin_rucder_service
    RucderLog.service_begin
  end
  
  def end_rucder_service
    RucderLog.service_end
  end
  
  public
  def index
    redirect_to :action => 'logs'
  end
  
  def tables
    @tables = RucderTable.find(:all, 
      RucderTable.options_to_find(params).merge(:include => {:cruds => :log}))
  end
  
  def logs
    @logs = RucderLog.find(:all, RucderLog.options_to_find(params))
  end
  
  def show_log
    @log = RucderLog.find(params[:id])
  end
  
  def complete_tables
    tables = RucderTable.find(:all, RucderTable.options_to_find(params))
    render :text => '<ul>' << tables.map{|t|"<li>#{t.name}</li>"}.join('') << '</ul>'
  end
  
  def complete_trace_lines
    trace_lines = RucderTraceLine.find(:all, 
      :conditions => ["line like ?", "%#{params[:trace_line]}%"], :order => 'line asc')
    render :text => '<ul>' << trace_lines.map{|tl|"<li>#{tl.line.strip}</li>"}.join('') << '</ul>'
  end
  
  def complete_sqls
    logs = RucderLog.find(:all, 
      :conditions => ["sql like ?", "%#{params[:sql]}%"], :order => 'sql asc', :group => 'sql')
    render :text => '<ul>' << logs.map{|log|"<li>#{log.sql.strip}</li>"}.join('') << '</ul>'
  end
  
  def ajax_show_table
    table = RucderTable.find(params[:id])
    @logs = RucderLog.find(:all, RucderLog.options_to_find(:table => table.name))
    render :partial => 'logs'
  end
  
  def ajax_show_log
    log = RucderLog.find(params[:id])
    render :partial => 'show_log', :locals => {:log => log, :hide_id => true, :hide_sql => true, :hide_crud => true}
  end
  
end
