require File.dirname(__FILE__) + '/../test_helper'
require 'spec_link_controller'

# Re-raise errors caught by the controller.
class SpecLinkController; def rescue_action(e) raise e end; end

class SpecLinkControllerTest < Test::Unit::TestCase
  def setup
    @controller = SpecLinkController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
