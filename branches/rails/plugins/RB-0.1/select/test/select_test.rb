require File.dirname(__FILE__) + "/test_helper"
require File.dirname(__FILE__) + "/../init"

class SelectTest < Test::Unit::TestCase
  
  def test_to_sql
    select = Select.new
    select.from("parties").as("p")
    select.where.add("p.deleted = 0")
    select.where.nest.add("p.name like ?", "%ABC%").add("p.name like ?", "XYZ")
    s, p = select.build
    assert_equal "select * from parties as p where p.deleted = 0 and ((p.name like ?) or (p.name like ?))", s
    assert_equal ["%ABC%", "XYZ"], p
  end
  
  def test_where_to_sql
    select = Select.new
    select.where.add("deleted = 0")
    select.where.nest.add("name like ?", ["%abc%"]).add("name like ?", ["xyz"])
    s, p = select.where.build
    assert_equal "deleted = 0 and ((name like ?) or (name like ?))", s
    assert_equal ["%abc%", "xyz"], p

    select = Select.new
    select.where.add("deleted = ?", 0)
    select.where.add("id in (?)", [1,2,3])
    s, p = select.where.build
    assert_equal "(deleted = ?) and (id in (?))", s
    assert_equal [0, [1,2,3]], p
  end
  
  def test_where_parse_add_each
    select = Select.new
    select.where.add("deleted = 0")
    select.where.parse_add_each("name", "abc, xyz")
    s, p = select.where.build
    assert_equal "deleted = 0 and ((name like ?) or (name like ?))", s
    assert_equal ["%abc%", "%xyz%"], p
  end
  
end
