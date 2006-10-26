require File.dirname(__FILE__) + '/../test_helper'

class Cpk1StrTest < Test::Unit::TestCase
  # fixtures :cpk1_str
  # 上のfixturesを使うとNameError: uninitialized constant RecordNotFoundとかいう例外が出るので、自前で用意 
  # これは、モデルに対応するテーブルの名前が複数形でないから。複数形ならうまくいくようだ
  def setup
    Cpk1Str.delete_all
    @instances = {
      :first => Cpk1Str.create({:pk1 => '壱', :name => 'レコード-1'}),
      :second => Cpk1Str.create({:pk1 => '弐', :name => 'レコード-2'})
    }
  end

  def cpk1_str(fixture_key)
    @instances[fixture_key]
  end
  
  def test_count
    assert 2, Cpk1Str.count
  end
  
  def test_find
    assert 2, Cpk1Str.count
    assert_equal ['壱'], cpk1_str(:first).id
    assert_equal ['弐'], cpk1_str(:second).id
    assert_equal cpk1_str(:first), Cpk1Str.find(['壱'])
    assert_equal cpk1_str(:second), Cpk1Str.find(['弐'])
  end
  
  def test_create_third
    third = Cpk1Str.create({:pk1 => '参', :name => 'record-3'})
    assert_equal ['参'], third.id
    assert_equal '参', third.pk1
    assert_equal 3, Cpk1Str.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Cpk1Str.create({:pk1 => '参', :name => 'record-4'})
    }
    fourth = Cpk1Str.new({:name => 'record-4'})
    fourth.id = ['Ⅳ']
    fourth.save
    assert_not_nil fourth
    assert_equal ['Ⅳ'], fourth.id
    assert_equal 'Ⅳ', fourth.pk1
    assert_equal 4, Cpk1Str.count
  end
  
  def test_save
    first = cpk1_str(:first)
    second = cpk1_str(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Cpk1Str.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end

  def test_destroy
    assert_equal 2, Cpk1Str.count
    cpk1_str(:first).destroy
    assert_equal 1, Cpk1Str.count
  end
  
end
