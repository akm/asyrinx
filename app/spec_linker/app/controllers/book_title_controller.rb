class BookTitleController < ApplicationController
  def index
    list
    render :action => 'list'
  end

  # GETs should be safe (see http://www.w3.org/2001/tag/doc/whenToUseGet.html)
  verify :method => :post, :only => [ :destroy, :create, :update ],
         :redirect_to => { :action => :list }

  def list
    @book_title_pages, @book_titles = paginate :book_titles, :per_page => 10
  end

  def show
    @book_title = BookTitle.find(params[:id])
  end

  def new
    @book_title = BookTitle.new
  end

  def create
    @book_title = BookTitle.new(params[:book_title])
    if @book_title.save
      flash[:notice] = 'BookTitle was successfully created.'
      redirect_to :action => 'list'
    else
      render :action => 'new'
    end
  end

  def edit
    @book_title = BookTitle.find(params[:id])
  end

  def update
    @book_title = BookTitle.find(params[:id])
    if @book_title.update_attributes(params[:book_title])
      flash[:notice] = 'BookTitle was successfully updated.'
      redirect_to :action => 'show', :id => @book_title
    else
      render :action => 'edit'
    end
  end

  def destroy
    BookTitle.find(params[:id]).destroy
    redirect_to :action => 'list'
  end
end
