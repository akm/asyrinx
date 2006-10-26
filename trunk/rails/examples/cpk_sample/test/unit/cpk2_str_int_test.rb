require File.dirname(__FILE__) + '/../test_helper'

class Cpk2StrIntTest < Test::Unit::TestCase
  # fixtures :cpk2_str_int
  # 上のfixturesを使うとNameError: uninitialized constant RecordNotFoundとかいう例外が出るので、自前で用意 
  # これは、モデルに対応するテーブルの名前が複数形でないから。複数形ならうまくいくようだ
  def setup
    Cpk2StrInt.delete_all
    @instances = {
      :first => Cpk2StrInt.create({:pk1 => '壱', :pk2 => 2, :name => 'レコード-1'}),
      :second => Cpk2StrInt.create({:pk1 => '弐', :pk2 => 4, :name => 'レコード-2'})
    }
  end

  def cpk2_str_int(fixture_key)
    @instances[fixture_key]
  end
  
  def test_count
    assert 2, Cpk2StrInt.count
  end
  
  def test_find
    assert 2, Cpk2StrInt.count
    assert_equal ['壱',2], cpk2_str_int(:first).id
    assert_equal ['弐',4], cpk2_str_int(:second).id
    assert_equal cpk2_str_int(:first), Cpk2StrInt.find(['壱', 2])
    assert_equal cpk2_str_int(:second), Cpk2StrInt.find(['弐', 4])
  end
  
  def test_create_third
    third = Cpk2StrInt.create({:pk1 => '参', :pk2 => 7, :name => 'record-3'})
    assert_equal ['参', 7], third.id
    assert_equal '参', third.pk1
    assert_equal 7, third.pk2
    assert_equal 3, Cpk2StrInt.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Cpk2StrInt.create({:pk1 => '参', :pk2 => 7, :name => 'record-4'})
    }
    fourth = Cpk2StrInt.new({:name => 'record-4'})
    fourth.id = ['参',8]
    fourth.save
    assert_not_nil fourth
    assert_equal ['参',8], fourth.id
    assert_equal '参', fourth.pk1
    assert_equal 8, fourth.pk2
    assert_equal 4, Cpk2StrInt.count
  end
  
  def test_save
    first = cpk2_str_int(:first)
    second = cpk2_str_int(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Cpk2StrInt.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end

  def test_destroy
    assert_equal 2, Cpk2StrInt.count
    cpk2_str_int(:first).destroy
    assert_equal 1, Cpk2StrInt.count
  end
  
end
