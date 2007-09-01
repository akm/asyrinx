class SpotController < ApplicationController

  def index
    redirect_to :action => 'new'
  end
  
  def new
    if request.get?
      @spot = Spot.new
      render :action => 'new'
    else
      @spot = Spot.new(params['spot'])
      @spot.save!
      render :action => 'new'
    end
  end

end
