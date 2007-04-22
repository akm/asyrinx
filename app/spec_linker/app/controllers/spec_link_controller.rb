class SpecLinkController < ApplicationController

  def ajax_list
    @spec_links = SpecLink.find(:all)
  end
  
  def ajax_new
  end

  def ajax_save
    if params[:id] 
      @spec_link = SpecLink.find(params[:id])
      @spec_link.attributes = params[:spec_link]
    else
      @spec_link = SpecLink.new(params[:spec_link])
    end
    @spec_link.save!
    render :action => 'ajax_edit'
  end

  def ajax_edit
    @spec_link = SpecLink.find(params[:id])
  end
end
