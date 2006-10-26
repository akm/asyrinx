require File.dirname(__FILE__) + '/../test_helper'

class Cpk2StrStrTest < Test::Unit::TestCase
  # fixtures :cpk2_str_str
  # 上のfixturesを使うとNameError: uninitialized constant RecordNotFoundとかいう例外が出るので、自前で用意 
  # これは、モデルに対応するテーブルの名前が複数形でないから。複数形ならうまくいくようだ
  def setup
    Cpk2StrStr.delete_all
    @instances = {
      :first => Cpk2StrStr.create({:pk1 => '壱', :pk2 => '弐', :name => 'レコード-1'}),
      :second => Cpk2StrStr.create({:pk1 => '弐', :pk2 => 'よん', :name => 'レコード-2'})
    }
  end

  def cpk2_str_str(fixture_key)
    @instances[fixture_key]
  end
  
  def test_count
    assert 2, Cpk2StrStr.count
  end
  
  def test_find
    assert 2, Cpk2StrStr.count
    assert_equal ['壱','弐'], cpk2_str_str(:first).id
    assert_equal ['弐','よん'], cpk2_str_str(:second).id
    assert_equal cpk2_str_str(:first), Cpk2StrStr.find(['壱', '弐'])
    assert_equal cpk2_str_str(:second), Cpk2StrStr.find(['弐', 'よん'])
  end
  
  def test_create_third
    third = Cpk2StrStr.create({:pk1 => '参', :pk2 => 'ナナ', :name => 'record-3'})
    assert_equal ['参', 'ナナ'], third.id
    assert_equal '参', third.pk1
    assert_equal 'ナナ', third.pk2
    assert_equal 3, Cpk2StrStr.count
    #
    assert_raise(ActiveRecord::StatementInvalid){
      Cpk2StrStr.create({:pk1 => '参', :pk2 => 'ナナ', :name => 'record-4'})
    }
    fourth = Cpk2StrStr.new({:name => 'record-4'})
    fourth.id = ['参','ハチ']
    fourth.save
    assert_not_nil fourth
    assert_equal ['参','ハチ'], fourth.id
    assert_equal '参', fourth.pk1
    assert_equal 'ハチ', fourth.pk2
    assert_equal 4, Cpk2StrStr.count
  end
  
  def test_save
    first = cpk2_str_str(:first)
    second = cpk2_str_str(:second)
    old_first_name = first.name
    second.name += 'x'
    assert_equal true, second.save
    #first = Cpk2StrStr.find(first.id)
    first.reload
    assert_equal old_first_name, first.name
  end

  def test_destroy
    assert_equal 2, Cpk2StrStr.count
    cpk2_str_str(:first).destroy
    assert_equal 1, Cpk2StrStr.count
  end
  
end
