require File.dirname(__FILE__) + '/../test_helper'

class Pk1StrTest < Test::Unit::TestCase
  fixtures :pk1_str

  def test_count
    assert 2, Pk1Str.count
  end
  
  def test_find
    assert 2, Pk1Str.count
    assert_equal '壱', pk1_str(:first).id
    assert_equal '弐', pk1_str(:second).id
    assert_equal pk1_str(:first), Pk1Str.find('壱')
    assert_equal pk1_str(:second), Pk1Str.find('弐')
  end
  
  def test_create_third
    third = Pk1Str.create({:pk1 => '参', :name => 'record-3'})
    # ここがオカシイヨ！
    assert_equal 0, third.id
    assert_equal 0, third.pk1
    assert_equal 3, Pk1Str.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Pk1Str.create({:pk1 => 0, :name => 'record-4'})
    }
    fourth = Pk1Str.new({:name => 'record-4'})
    fourth.id = 'Ⅳ'
    fourth.save
    assert_not_nil fourth
    assert_equal 'Ⅳ', fourth.id
    assert_equal 'Ⅳ', fourth.pk1
    assert_equal 4, Pk1Str.count
  end
  
  def test_save
    first = pk1_str(:first)
    second = pk1_str(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Pk1Str.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end
  
  def test_destroy
    assert_equal 2, Pk1Str.count
    pk1_str(:first).destroy
    assert_equal 1, Pk1Str.count
  end
  
end
