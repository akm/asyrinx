require File.dirname(__FILE__) + '/../test_helper'
require 'spot_controller'

# Re-raise errors caught by the controller.
class SpotController; def rescue_action(e) raise e end; end

class SpotControllerTest < Test::Unit::TestCase
  def setup
    @controller = SpotController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  # Replace this with your real tests.
  def test_truth
    assert true
  end
end
