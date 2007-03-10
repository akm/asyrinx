require File.join(File.dirname(__FILE__), '../init')
require File.join(File.dirname(__FILE__), 'test_helper')

class TextOptionsTest < Test::Unit::TestCase

  def test_create
    options = TextOptions.create('1: 削除済みのみ' => 'a', '2: 削除済み除く' => 'b', '3: 削除済みも含む' => 'c')
    assert_equal 3, options.length
    assert_equal 3, options.size
    assert_equal '削除済みのみ', options[1].text
    assert_equal '削除済み除く', options[2].text
    assert_equal '削除済みも含む', options[3].text
    assert_equal 'a', options[1].value
    assert_equal 'b', options[2].value
    assert_equal 'c', options[3].value
    assert_equal 1, options[1].index
    assert_equal 2, options[2].index
    assert_equal 3, options[3].index
    
    options = TextOptions.create(['1: 削除済みのみ', '2: 削除済み除く', '3: 削除済みも含む'])
    assert_equal 3, options.length
    assert_equal 3, options.size
    assert_equal '削除済みのみ', options[1].text
    assert_equal '削除済み除く', options[2].text
    assert_equal '削除済みも含む', options[3].text
    assert_equal 1, options[1].value
    assert_equal 2, options[2].value
    assert_equal 3, options[3].value
    assert_equal 1, options[1].index
    assert_equal 2, options[2].index
    assert_equal 3, options[3].index

    options = TextOptions.create(['削除済みのみ', '削除済み除く', '削除済みも含む'])
    assert_equal 3, options.length
    assert_equal 3, options.size
    assert_equal '削除済みのみ', options[0].text
    assert_equal '削除済み除く', options[1].text
    assert_equal '削除済みも含む', options[2].text
    assert_equal 0, options[0].value
    assert_equal 1, options[1].value
    assert_equal 2, options[2].value
    assert_equal 0, options[0].index
    assert_equal 1, options[1].index
    assert_equal 2, options[2].index

    options = TextOptions.create({'a. 削除済みのみ' => 1, 'b. 削除済み除く' => 2, 'c. 削除済みも含む' => 3})
    assert_equal 3, options.length
    assert_equal 3, options.size
    assert_equal 'a. 削除済みのみ', options[0].text
    assert_equal 'b. 削除済み除く', options[1].text
    assert_equal 'c. 削除済みも含む', options[2].text
    assert_equal 1, options[0].value
    assert_equal 2, options[1].value
    assert_equal 3, options[2].value
    assert_equal 0, options[0].index
    assert_equal 1, options[1].index
    assert_equal 2, options[2].index
  end
  
  def test_to_array
    options = TextOptions.create('1: 削除済みのみ' => 'a', '2: 削除済み除く' => 'b', '3: 削除済みも含む' => 'c')
    assert_equal ['削除済みのみ', 1], options[1].to_array
    assert_equal ['削除済み除く', 2], options[2].to_array
    assert_equal ['削除済みも含む', 3], options[3].to_array
    
    assert_equal [['削除済みのみ', 1], ['削除済み除く', 2], ['削除済みも含む', 3]], options.to_array
    assert_equal [['削除済みのみ', 1], ['削除済み除く', 2], ['削除済みも含む', 3]], options.to_array(:text, :index)
    assert_equal [['削除済みのみ', 'a'], ['削除済み除く', 'b'], ['削除済みも含む', 'c']], options.to_array(:text, :value)
    assert_equal [[1, '削除済みのみ', 'a'], [2, '削除済み除く', 'b'], [3, '削除済みも含む', 'c']], options.to_array(:index, :text, :value)
  end
end
