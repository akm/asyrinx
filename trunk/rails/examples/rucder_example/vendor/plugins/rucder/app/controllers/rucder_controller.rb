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
    redirect_to :action => 'tables'
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
  
end
