require File.dirname(__FILE__) + '/../test_helper'

class Cpk2IntIntTest < Test::Unit::TestCase
  # fixtures :cpk2_int_ints
  # 上のfixturesを使うとNameError: uninitialized constant RecordNotFoundとかいう例外が出るので、自前で用意 
  # これは、モデルに対応するテーブルの名前が複数形でないから。複数形ならうまくいくようだ
  def setup
    Cpk2IntInt.delete_all
    @instances = {
      :first => Cpk2IntInt.create({:pk1 => 1, :pk2 => 2, :name => 'レコード-1'}),
      :second => Cpk2IntInt.create({:pk1 => 2, :pk2 => 4, :name => 'レコード-2'})
    }
  end

  def cpk2_int_int(fixture_key)
    @instances[fixture_key]
  end
  
  def test_count
    assert 2, Cpk2IntInt.count
  end
  
  def test_find
    assert 2, Cpk2IntInt.count
    assert_equal [1,2], cpk2_int_int(:first).id
    assert_equal [2,4], cpk2_int_int(:second).id
    assert_equal cpk2_int_int(:first), Cpk2IntInt.find([1, 2])
    assert_equal cpk2_int_int(:second), Cpk2IntInt.find([2, 4])
  end
  
  def test_create_third
    third = Cpk2IntInt.create({:pk1 => 3, :pk2 => 7, :name => 'record-3'})
    assert_equal [3, 7], third.id
    assert_equal 3, third.pk1
    assert_equal 7, third.pk2
    assert_equal 3, Cpk2IntInt.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Cpk2IntInt.create({:pk1 => 3, :pk2 => 7, :name => 'record-4'})
    }
    fourth = Cpk2IntInt.new({:name => 'record-4'})
    fourth.id = [3,8]
    fourth.save
    assert_not_nil fourth
    assert_equal [3,8], fourth.id
    assert_equal 3, fourth.pk1
    assert_equal 8, fourth.pk2
    assert_equal 4, Cpk2IntInt.count
  end
  
  def test_save
    first = cpk2_int_int(:first)
    second = cpk2_int_int(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Cpk2IntInt.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end

  def test_destroy
    assert_equal 2, Cpk2IntInt.count
    cpk2_int_int(:first).destroy
    assert_equal 1, Cpk2IntInt.count
  end
  
end
