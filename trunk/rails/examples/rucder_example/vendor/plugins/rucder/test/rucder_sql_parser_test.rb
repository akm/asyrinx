require File.join(File.dirname(__FILE__), '../init')
require File.join(File.dirname(__FILE__), 'test_helper')

require 'rucder_sql_parser'

class RucderSqlParserTest < Test::Unit::TestCase

  def _test_parse_select
    parser = ActiveRecord::Rucder::SqlParser.new
    assert_equal( {
        :limit => 1,
        :rel => {
          :select => ['*'],
          :from => {:table => 'users'}
        }
      },
      parser.call("SELECT * FROM users  LIMIT 1") )

    assert_equal( {
        :select => ['*'],
        :from => {:table => 'users'}},
      parser.call("SELECT * FROM users ") )

    assert_equal( {
      :from=>{:table=>"users"},
      :where=>{
        :left=>{:name=>"id"}, :right=>{:lit=>"1"}, :op=>:"="},
      :select=>["*"]},
      parser.call("SELECT * FROM users WHERE (id = 1) ") )

    assert_equal( {
        :select => ['*'],
        :from => {:table => 'users'},
        :where => {:left=>{:owner=>"users", :col=>"id"}, :right=>{:lit=>"1"}, :op=>:"="}},
      parser.call("SELECT * FROM users WHERE (users.id = 1) ") )

    assert_equal( {
      :from=>{:table=>"users"},
      :where=>{
        :left=>
          {:left=>{:owner=>"users", :col=>"login"},
           :right=>{:lit=>"'test@test.com'"},
           :op=>:"="},
        :right=>
          {:left=>{:owner=>"users", :col=>"password"},
           :right=>{:lit=>"'password'"},
           :op=>:"="},
         :op=>:and},
       :select=>["*"]},
      parser.call("SELECT * FROM users WHERE (users.login = 'test@test.com') and (users.password = 'password') ") )

    assert_equal( 
      {:from=>
        {:left=>{:table=>"users"},
         :right=>{:name=>"tel", :relation=>{:table=>"telephones"}},
         :kind=>:inner,
         :on=>
          {:left=>{:owner=>"tel", :col=>"user_id"},
           :right=>{:owner=>"users", :col=>"id"},
           :op=>:"="}},
       :where=>
        {:left=>
          {:left=>{:owner=>"users", :col=>"login"},
           :right=>{:lit=>"'test@test.com'"},
           :op=>:"="},
         :right=>
          {:left=>{:owner=>"users", :col=>"password"},
           :right=>{:lit=>"'password'"},
           :op=>:"="},
         :op=>:and},
       :select=> [
        {:col => "*", :owner => "users"},
        {:col => "display_number", :owner => "tel"}]},
      parser.call("SELECT users.*, tel.display_number FROM users inner join telephones tel on tel.user_id = users.id WHERE (users.login = 'test@test.com') and (users.password = 'password') ") )
  end

  def test_parse_insert
    parser = ActiveRecord::Rucder::SqlParser.new
    expected = {
        :insert => {
          :into => {:table => 'users'},
          :columns => %w(updated_at crypted_password login created_at email),
          :values => ["'2007-05-10 19:41:53'", 'NULL', 'NULL', "'takeshi'", "'2007-05-10 19:41:53'", "'akm2000@gmail.com'"]
        }
      }
    actual = parser.call("INSERT INTO users (`updated_at`, `crypted_password`, `login`, `created_at`, `email`) VALUES('2007-05-10 19:41:53', NULL, NULL, 'takeshi', '2007-05-10 19:41:53', 'akm2000@gmail.com')")
    assert_equal expected[:insert][:into], actual[:insert][:into]
    assert_equal expected[:insert][:columns], actual[:insert][:columns]
    assert_equal expected[:insert][:values].length, actual[:insert][:values].length
    expected[:insert][:values].each_with_index do |item, index|
      assert_equal item, actual[:insert][:values][index]
    end
    assert_equal expected[:insert][:values], actual[:insert][:values]
    assert_equal expected[:insert], actual[:insert]
    assert_equal expected, actual
  end

  def test_parse_update
    parser = ActiveRecord::Rucder::SqlParser.new

    actual = parser.call("UPDATE users SET `created_at` = '2007-05-10 20:04:40', `login` = 'akm2000', `crypted_password` = 'ff32c2f44fd1b1ed9006fe3f2ceb60d1e4e78d37', `remember_token_expires_at` = NULL, `salt` = '0e03126df54d704199e853472e85a0efe466f4b1', `remember_token` = NULL, `email` = 'akm2000@gmail.com', `updated_at` = '2007-05-10 20:41:24' WHERE id = 1")
    expected = {
        :update => 
          {:table => 'users'},
        :set => [
          {:left=>{:name=>"created_at"},:right=>{:lit=>"'2007-05-10 20:04:40'"}, :op=>:"="},
          {:left=>{:name=>"login"},:right=>{:lit=>"'akm2000'"}, :op=>:"="},
          {:left=>{:name=>"crypted_password"},:right=>{:lit=>"'ff32c2f44fd1b1ed9006fe3f2ceb60d1e4e78d37'"}, :op=>:"="},
          {:left=>{:name=>"remember_token_expires_at"},:right=>{:name=>'NULL'}, :op=>:"="},
          {:left=>{:name=>"salt"},:right=>{:lit=>"'0e03126df54d704199e853472e85a0efe466f4b1'"}, :op=>:"="},
          {:left=>{:name=>"remember_token"},:right=>{:name=>"NULL"}, :op=>:"="},
          {:left=>{:name=>"email"},:right=>{:lit=>"'akm2000@gmail.com'"}, :op=>:"="},
          {:left=>{:name=>"updated_at"},:right=>{:lit=>"'2007-05-10 20:41:24'"}, :op=>:"="},
        ],
       :where=>
          {:left=>{:name=>"id"}, :right=>{:lit=>"1"}, :op=>:"="}
      }
    assert_equal(expected[:update], actual[:update])
    assert_equal(expected[:where], actual[:where])
    expected[:set].each_with_index do |expected_item, index|
      assert_equal expected_item, actual[:set][index]
    end
    assert_equal(expected[:set], actual[:set])
    assert_equal(expected, actual)
  end

  def test_parse_delete
    parser = ActiveRecord::Rucder::SqlParser.new
    
    assert_equal( {
        :delete => 
          {:table => 'users'},
        :where=>
          {:left=>{:name=>"id"}, :right=>{:lit=>"1"}, :op=>:"="}
      },
      parser.call("DELETE FROM users WHERE id = 1") )
  end


end
