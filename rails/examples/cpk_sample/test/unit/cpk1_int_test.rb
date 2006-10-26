require File.dirname(__FILE__) + '/../test_helper'

class Cpk1IntTest < Test::Unit::TestCase
  # fixtures :cpk1_int
  # 上のfixturesを使うとNameError: uninitialized constant RecordNotFoundとかいう例外が出るので、自前で用意
  # これは、モデルに対応するテーブルの名前が複数形でないから。複数形ならうまくいくようだ
  def setup
    Cpk1Int.delete_all
    @instances = {
      :first => Cpk1Int.create({:pk1 => 1, :name => 'レコード-1'}),
      :second => Cpk1Int.create({:pk1 => 2, :name => 'レコード-2'})
    }
  end
  
  def cpk1_int(fixture_key)
    @instances[fixture_key]
  end

  def test_count
    assert 2, Cpk1Int.count
  end
  
  def test_find
    assert 2, Cpk1Int.count
    assert_equal [1], cpk1_int(:first).id
    assert_equal [2], cpk1_int(:second).id
    assert_equal cpk1_int(:first), Cpk1Int.find([1])
    assert_equal cpk1_int(:second), Cpk1Int.find([2])
  end
  
  def test_create_third
    third = Cpk1Int.create({:pk1 => 3, :name => 'record-3'})
    assert_equal [3], third.id
    assert_equal 3, third.pk1
    assert_equal 3, Cpk1Int.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Cpk1Int.create({:pk1 => 3, :name => 'record-4'})
    }
    fourth = Cpk1Int.new({:name => 'record-4'})
    fourth.id = [4]
    fourth.save
    assert_not_nil fourth
    assert_equal [4], fourth.id
    assert_equal 4, fourth.pk1
    assert_equal 4, Cpk1Int.count
  end
  
  def test_save
    first = cpk1_int(:first)
    second = cpk1_int(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Cpk1Int.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end
  
  def test_destroy
    assert_equal 2, Cpk1Int.count
    cpk1_int(:first).destroy
    assert_equal 1, Cpk1Int.count
  end
  
end
