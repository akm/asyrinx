require File.dirname(__FILE__) + '/../test_helper'

class Cpk2IntStrTest < Test::Unit::TestCase
  # fixtures :cpk2_int_str
  # 上のfixturesを使うとNameError: uninitialized constant RecordNotFoundとかいう例外が出るので、自前で用意 
  # これは、モデルに対応するテーブルの名前が複数形でないから。複数形ならうまくいくようだ
  def setup
    Cpk2IntStr.delete_all
    @instances = {
      :first => Cpk2IntStr.create({:pk1 => 1, :pk2 => '弐', :name => 'レコード-1'}),
      :second => Cpk2IntStr.create({:pk1 => 2, :pk2 => 'よん', :name => 'レコード-2'})
    }
  end

  def cpk2_int_str(fixture_key)
    @instances[fixture_key]
  end
  
  def test_count
    assert 2, Cpk2IntStr.count
  end
  
  def test_find
    assert 2, Cpk2IntStr.count
    assert_equal [1,'弐'], cpk2_int_str(:first).id
    assert_equal [2,'よん'], cpk2_int_str(:second).id
    assert_equal cpk2_int_str(:first), Cpk2IntStr.find([1, '弐'])
    assert_equal cpk2_int_str(:second), Cpk2IntStr.find([2, 'よん'])
  end
  
  def test_create_third
    third = Cpk2IntStr.create({:pk1 => 3, :pk2 => 'ナナ', :name => 'record-3'})
    assert_equal [3, 'ナナ'], third.id
    assert_equal 3, third.pk1
    assert_equal 'ナナ', third.pk2
    assert_equal 3, Cpk2IntStr.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Cpk2IntStr.create({:pk1 => 3, :pk2 => 'ナナ', :name => 'record-4'})
    }
    fourth = Cpk2IntStr.new({:name => 'record-4'})
    fourth.id = [3,'ハチ']
    fourth.save
    assert_not_nil fourth
    assert_equal [3,'ハチ'], fourth.id
    assert_equal 3, fourth.pk1
    assert_equal 'ハチ', fourth.pk2
    assert_equal 4, Cpk2IntStr.count
  end
  
  def test_save
    first = cpk2_int_str(:first)
    second = cpk2_int_str(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Cpk2IntStr.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end

  def test_destroy
    assert_equal 2, Cpk2IntStr.count
    cpk2_int_str(:first).destroy
    assert_equal 1, Cpk2IntStr.count
  end
  
end
