require File.dirname(__FILE__) + '/../test_helper'
require 'book_title_controller'

# Re-raise errors caught by the controller.
class BookTitleController; def rescue_action(e) raise e end; end

class BookTitleControllerTest < Test::Unit::TestCase
  fixtures :book_titles

  def setup
    @controller = BookTitleController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new

    @first_id = book_titles(:first).id
  end

  def test_index
    get :index
    assert_response :success
    assert_template 'list'
  end

  def test_list
    get :list

    assert_response :success
    assert_template 'list'

    assert_not_nil assigns(:book_titles)
  end

  def test_show
    get :show, :id => @first_id

    assert_response :success
    assert_template 'show'

    assert_not_nil assigns(:book_title)
    assert assigns(:book_title).valid?
  end

  def test_new
    get :new

    assert_response :success
    assert_template 'new'

    assert_not_nil assigns(:book_title)
  end

  def test_create
    num_book_titles = BookTitle.count

    post :create, :book_title => {}

    assert_response :redirect
    assert_redirected_to :action => 'list'

    assert_equal num_book_titles + 1, BookTitle.count
  end

  def test_edit
    get :edit, :id => @first_id

    assert_response :success
    assert_template 'edit'

    assert_not_nil assigns(:book_title)
    assert assigns(:book_title).valid?
  end

  def test_update
    post :update, :id => @first_id
    assert_response :redirect
    assert_redirected_to :action => 'show', :id => @first_id
  end

  def test_destroy
    assert_nothing_raised {
      BookTitle.find(@first_id)
    }

    post :destroy, :id => @first_id
    assert_response :redirect
    assert_redirected_to :action => 'list'

    assert_raise(ActiveRecord::RecordNotFound) {
      BookTitle.find(@first_id)
    }
  end
end
