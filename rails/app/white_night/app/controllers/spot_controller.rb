class SpotController < ApplicationController

  def index
    redirect_to :action => 'new'
  end
  
  def new
    render :action => 'new'
  end

end
