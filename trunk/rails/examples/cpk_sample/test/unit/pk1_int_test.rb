require File.dirname(__FILE__) + '/../test_helper'

class Pk1IntTest < Test::Unit::TestCase
  fixtures :pk1_int

  def test_count
    assert 2, Pk1Int.count
  end
  
  def test_find
    assert 2, Pk1Int.count
    assert_equal 1, pk1_int(:first).id
    assert_equal 2, pk1_int(:second).id
    assert_equal pk1_int(:first), Pk1Int.find(1)
    assert_equal pk1_int(:second), Pk1Int.find(2)
  end
  
  def test_create_third
    third = Pk1Int.create({:pk1 => 3, :name => 'record-3'})
    assert_equal 0, third.id
    assert_equal 0, third.pk1
    assert_equal 3, Pk1Int.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Pk1Int.create({:pk1 => 0, :name => 'record-4'})
    }
    fourth = Pk1Int.new({:name => 'record-4'})
    fourth.id = 4
    fourth.save
    assert_not_nil fourth
    assert_equal 4, fourth.id
    assert_equal 4, fourth.pk1
    assert_equal 4, Pk1Int.count
  end
  
  def test_save
    first = pk1_int(:first)
    second = pk1_int(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Pk1Int.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end
  
  def test_destroy
    assert_equal 2, Pk1Int.count
    pk1_int(:first).destroy
    assert_equal 1, Pk1Int.count
  end
  
end
