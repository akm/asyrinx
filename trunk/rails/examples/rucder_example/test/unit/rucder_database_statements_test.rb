require File.dirname(__FILE__) + '/../test_helper'

require 'rucder_service'
require 'rucder_database_statements'

conn = ActiveRecord::Base.connection
conn.class.class_eval do
  include ActiveRecord::Rucder::DatabaseStatements
end
conn.rucder_enabled = true

class RucderDatabaseStatementsTest < Test::Unit::TestCase

  fixtures :users

  def setup
    @service_args = []
    ActiveRecord::Rucder.rucder_service = Proc.new{|*args| @service_args << args }
  end
  
  def check_args(*expecteds)  # (event, klass, trace_level)
    assert_equal expecteds.length, @service_args.length
    expecteds.each_with_index do |expected, index|
      if expected[1].is_a?(Hash) && expected[1][:arguments][0].is_a?(Regexp)
        assert_equal expected[0], @service_args[index][0]
        assert_match expected[1][:arguments][0], @service_args[index][1][:arguments][0]
      else
        assert_equal expected, @service_args[index]
      end
    end
    @service_args.clear
  end

  def test_find
    User.find(:first)
    check_args([:select_all, {:arguments=>["SELECT * FROM users  LIMIT 1", "User Load"]}])
    
    User.find(:all)
    check_args([:select_all, {:arguments=>["SELECT * FROM users ", "User Load"]}])
    
    User.find(1)
    check_args([:select_all, {:arguments=>["SELECT * FROM users WHERE (users.id = 1) ", "User Load"]}])
  end
  
  def test_find_by_sql
    User.find_by_sql("select * from users where id = 1")
    check_args([:select_all, {:arguments=>["select * from users where id = 1", "User Load"]}])
  end

  def test_create
    User.create(:login => 'test_user', :email => 'test_user@test.com', :password => 'password', :password_confirmation => 'password')
    check_args(
        [:execute, {:arguments=>["SHOW FIELDS FROM users", "User Columns"]}],
        [:select_all, {:arguments=> ["SELECT * FROM users WHERE (LOWER(users.login) = 'test_user')  LIMIT 1", "User Load"]}],
        [:select_all, {:arguments=> ["SELECT * FROM users WHERE (LOWER(users.email) = 'test_user@test.com')  LIMIT 1", "User Load"]}],
        [:insert, {:arguments=> [/^INSERT INTO users \(/, "User Create", "id", nil, nil]}])
  end

  def test_update
    user = User.find(:first)
    check_args([:select_all, {:arguments=>["SELECT * FROM users  LIMIT 1", "User Load"]}])
    user.email = "test1@test.com"
    user.save!
    check_args(
      [:select_all, {:arguments=>["SELECT * FROM users WHERE (LOWER(users.login) = 'quentin' AND users.id <> 1)  LIMIT 1", "User Load"]}], 
      [:select_all, {:arguments=>["SELECT * FROM users WHERE (LOWER(users.email) = 'test1@test.com' AND users.id <> 1)  LIMIT 1", "User Load"]}], 
      [:update, {:arguments=>[/^UPDATE users SET .* WHERE id = 1$/, "User Update"]}]
    )
  end

  def test_destroy
    user = User.find(:first)
    check_args([:select_all, {:arguments=>["SELECT * FROM users  LIMIT 1", "User Load"]}])
    user.email = "test1@test.com"
    user.destroy
    check_args([:delete, {:arguments=> ["            DELETE FROM users\n            WHERE id = 1\n", "User Destroy"]}])
  end

end