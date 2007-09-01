class CourseController < ApplicationController

  def index
    redirect_to :action => 'choice'
  end

  def choice
    render :action => 'choice'
  end
end
