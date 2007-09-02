require File.join(File.dirname(__FILE__), '../init')
require File.join(File.dirname(__FILE__), 'test_helper')

require 'rucder_sql_parser'

class RucderSqlParserTest < Test::Unit::TestCase

  def test_parse_select
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
        :limit => 10,
        :offset => 0,
        :rel => {
          :select => ['*'],
          :from => {:table => 'users'}
        }
      },
      parser.call("SELECT * FROM users  LIMIT 0, 10") )

    assert_equal( {
        :limit => 10,
        :offset => 0,
        :rel => {
          :select => [
            {:owner => 'users', :col => 'id'},
            {:name => 'passwd', :as => 'password'},
            {:name => 'substr(users.name,1,10)', :as => 'first_name'}
          ],
          :from => {:table => 'users'}
        }
      },
      parser.call("SELECT users.id as id, passwd password, substr(users.name, 1, 10) as first_name FROM users  LIMIT 0, 10") )

    assert_equal( {
        :select => [{:name=>'email', :as => 'mail_address'}],
        :from => {:table => 'users'}
      },
      parser.call("SELECT email mail_address FROM users") )

    assert_equal( {
        :select => [{:name=>'email', :as => 'mail_address'}],
        :from => {:table => 'users'}
      },
      parser.call("SELECT email as mail_address FROM users") )

    assert_equal( {
        :select => [{:name => 'count(*)', :as => 'count_all'}],
        :from => {:table => 'users'}
      },
      parser.call("SELECT count(*) AS count_all FROM users") )
      
    assert_equal( {
        :limit => 1,
        :rel => {
          :select => ['*'],
          :from => {:table => 'users'},
          :where => 
            {:left=>{:name=>"LOWER(users.email)"},
             :right=>{:lit=>"'test@test.com'"},
             :op=>:"="},
        }
      },
      parser.call("SELECT * FROM users WHERE (LOWER(users.email) = 'test@test.com')  LIMIT 1 ") )

    assert_equal( {
        :select => [
          {:name => 'sum(mgpnt)', :as => 'sum_mgpnt'},
        ],
        :from => {:table => 'some_schema.some_table'},
        :where => {
          :left => {
            :left => {:left=>{:name=>"ownerno"},
             :right=>{:lit=>"1"},
             :op=>:"="},
            :right => {:left=>{:name=>"itemno"},
             :right=>{:lit=>"'99999'"},
             :op=>:"="},
            :op=>:'and'
          },
          :right => {:left=>{:name=>"userno"},
           :right=>{:lit=>"111"},
           :op=>:"="},
          :op=>:'and'
        }
      },
      parser.call("SELECT sum(mgpnt) AS sum_mgpnt FROM some_schema.some_table WHERE (ownerno = 1 and itemno = '99999' and userno = 111)") )
 

    assert_equal( {
        :select => [
          {:name => 'user_id'},
          {:name => 'count(*)', :as => 'item_count'},
          {:name => 'max(lineno)', :as => 'max_lineno'}
        ],
        :from => {:table => 'user_items'},
        :groupby => {:exprs => [{:name => 'user_id'}]}
      },
      parser.call("SELECT user_id, count(*) as item_count , max(lineno) as max_lineno FROM user_items group by user_id") )


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
    assert_equal({
        :insert => {
          :into => {:table => 'users'},
          :columns => %w(updated_at crypted_password login created_at email),
          :values => ["'2007-05-10 19:41:53'", 'NULL', 'NULL', "'takeshi'", "'2007-05-10 19:41:53'", "'akm2000@gmail.com'"]
        }
      },
      parser.call("INSERT INTO users (`updated_at`, `crypted_password`, `login`, `created_at`, `email`) VALUES('2007-05-10 19:41:53', NULL, NULL, 'takeshi', '2007-05-10 19:41:53', 'akm2000@gmail.com')") )
    assert_equal({
        :insert => {
          :into => {:table => 'users'},
          :columns => %w(updated_at crypted_password login created_at email),
          :values => ["?", "?", "?", "?", "?", "?"]
        }
      },
      parser.call("INSERT INTO users (`updated_at`, `crypted_password`, `login`, `created_at`, `email`) VALUES('2007-05-10 19:41:53', NULL, NULL, 'takeshi', '2007-05-10 19:41:53', 'akm2000@gmail.com')", :ignore_values => true) )
  end

  def test_parse_update
    parser = ActiveRecord::Rucder::SqlParser.new

    assert_equal({
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
      },
      parser.call("UPDATE users SET `created_at` = '2007-05-10 20:04:40', `login` = 'akm2000', `crypted_password` = 'ff32c2f44fd1b1ed9006fe3f2ceb60d1e4e78d37', `remember_token_expires_at` = NULL, `salt` = '0e03126df54d704199e853472e85a0efe466f4b1', `remember_token` = NULL, `email` = 'akm2000@gmail.com', `updated_at` = '2007-05-10 20:41:24' WHERE id = 1") )

    assert_equal({
        :update => 
          {:table => 'users'},
        :set => [
          {:left=>{:name=>"created_at"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"login"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"crypted_password"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"remember_token_expires_at"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"salt"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"remember_token"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"email"},:right=>{:lit=>"?"}, :op=>:"="},
          {:left=>{:name=>"updated_at"},:right=>{:lit=>"?"}, :op=>:"="},
        ],
       :where=>
          {:left=>{:name=>"id"}, :right=>{:lit=>"?"}, :op=>:"="}
      },
      parser.call("UPDATE users SET `created_at` = '2007-05-10 20:04:40', `login` = 'akm2000', `crypted_password` = 'ff32c2f44fd1b1ed9006fe3f2ceb60d1e4e78d37', `remember_token_expires_at` = NULL, `salt` = '0e03126df54d704199e853472e85a0efe466f4b1', `remember_token` = NULL, `email` = 'akm2000@gmail.com', `updated_at` = '2007-05-10 20:41:24' WHERE id = 1", :ignore_values => true) )
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

    assert_equal( {
        :delete => 
          {:table => 'users'},
        :where=>
          {:left=>{:name=>"id"}, :right=>{:lit=>"?"}, :op=>:"="}
      },
      parser.call("DELETE FROM users WHERE id = 1", :ignore_values => true) )
  end
  
  
  def test_parse_select_oracle
    parser = ActiveRecord::Rucder::SqlParser.new
    sql = <<-EOS
    select 
    	column_name, 
    	data_type, 
    	data_default, 
    	nullable, 
    	decode(data_type, 'NUMBER', data_precision, 'VARCHAR2', data_length, null) as length,
    	decode(data_type, 'NUMBER', data_scale, null) as scale
    from 
    	all_tab_columns
    where 
    	owner = 'ANOTHER_SCHEMA' and table_name = 'SOME_TABLE'
    order by column_id
    EOS

    assert_equal( {
        :select => [
          {:name => 'column_name'},
          {:name => 'data_type'},
          {:name => 'data_default'},
          {:name => 'nullable'},
          {:name => "decode(data_type,'NUMBER',data_precision,'VARCHAR2',data_length,null)", :as => 'length'},
          {:name => "decode(data_type,'NUMBER',data_scale,null)", :as => 'scale'}
        ],
        :from => {:table => 'all_tab_columns'},
        :where=>{
          :left=>
            {:left=>{:name=>"owner"},
             :right=>{:lit=>"'ANOTHER_SCHEMA'"},
             :op=>:"="},
          :right=>
            {:left=>{:name=>"table_name"},
             :right=>{:lit=>"'SOME_TABLE'"},
             :op=>:"="},
           :op=>:and},
        :orderby => [{:expr => {:name => 'column_id'}, :asc => true}]
      }, parser.call(sql) )
  
    sql = <<-EOS
      SELECT * FROM user_options
      WHERE ((user_options.user_id) = (10795) AND (user_type_cd is null))
      ORDER BY created_at desc
    EOS
    
    assert_equal( {
        :select => ['*'],
        :from => {:table => 'user_options'},
        :where=> {
          :left=> {
            :left=>{:owner=>"user_options", :col =>"user_id"},
            :right=>{:lit=>"10795"},
            :op=>:"="},
          :right => {
            :left=>{:name=>"user_type_cd"},
            :right=>{:name=>"null"},
            :op=>:"="},
          :op=>:"and"},
        :orderby => [{:expr => {:name => 'created_at'}}]
      }, parser.call(sql) )
      
    sql = <<-EOS
      select * from (
        select raw_sql_.*, rownum raw_rnum_ from (
          SELECT * FROM user_options
          WHERE ((user_options.user_id) = (10795) AND (user_type_cd is null))
          ORDER BY created_at desc
        ) raw_sql_ where rownum <= 1
      ) where raw_rnum_ > 0
    EOS
    
    assert_equal( {
        :limit => 1,
        :offset => 0,
        :rel => {
          :select => ['*'],
          :from => {:table => 'user_options'},
          :where=> {
            :left=> {
              :left=>{:owner=>"user_options", :col =>"user_id"},
              :right=>{:lit=>"10795"},
              :op=>:"="},
            :right => {
              :left=>{:name=>"user_type_cd"},
              :right=>{:name=>"null"},
              :op=>:"="},
            :op=>:"and"},
          :orderby => [{:expr => {:name => 'created_at'}}]
        }
      }, parser.call(sql) )
      
      
    sql = <<-EOS
      select * from (
        select raw_sql_.*, rownum raw_rnum_ from (
          SELECT * FROM users WHERE (users.id = '16443')
        ) raw_sql_ where rownum <= 70
      ) where raw_rnum_ > 40
    EOS
    
    assert_equal( {
        :limit => 30,
        :offset => 40,
        :rel => {
          :select => ['*'],
          :from => {:table => 'users'},
          :where=>
            {:left=>{:owner => 'users', :col => 'id' },
             :right=>{:lit=>"'16443'"},
             :op=>:"="}
        }
      }, parser.call(sql) )
  end

end