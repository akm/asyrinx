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
    @tables = RucderTable.find(:all, :order => 'rucder_tables.name asc')
  end
  
end
