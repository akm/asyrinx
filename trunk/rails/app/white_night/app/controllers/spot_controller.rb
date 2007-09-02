class SpotController < ApplicationController

  include AuthenticatedSystem
  before_filter :login_required

  def index
    redirect_to :action => 'new'
  end
  
  def new
    if request.get?
      @spot = Spot.new
      render :action => 'new'
    else
      @spot = Spot.new(params['spot'].merge(:creator => current_user))
      @spot.save!
      redirect_to :action => 'new'
    end
  end
  
  def destroy
    if request.post?
      Spot.destroy(params[:id])
    end
    redirect_to :action => 'new'
  end
  
  def roulette
    render :action => 'roulette'
  end

end
