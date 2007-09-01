class CourseController < ApplicationController

  include AuthenticatedSystem
  before_filter :login_required

  def index
    redirect_to :action => 'choice'
  end

  def choice
    render :action => 'choice'
  end
end
