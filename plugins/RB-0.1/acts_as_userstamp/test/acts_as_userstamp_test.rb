require File.dirname(__FILE__) + "/test_helper"
require File.dirname(__FILE__) + "/../init"

require 'userstamp'
ActiveRecord::Base.send(:include, ActiveRecord::Userstamp)

class WithoutFilterTest < Test::Unit::TestCase
  
  fixtures :books, :users
  
  def test_create
    User.current_user = User.find(users(:normal_user).id)
    refactoring = Book.create({
      :isbn => '0201485672',
      :name => 'Refactoring',
      :author => 'Martin Fowler',
      :publisher => 'Addison-Wesley Professional'
    })
    assert_not_nil refactoring.created_at
    assert_not_nil refactoring.created_by
    assert_not_nil refactoring.updated_at
    assert_not_nil refactoring.updated_by
    
    assert_kind_of User, refactoring.created_by
    assert_kind_of User, refactoring.updated_by

    assert_equal users(:normal_user).id, refactoring.created_by.id
    assert_equal users(:normal_user).id, refactoring.updated_by.id
  end
  
end
