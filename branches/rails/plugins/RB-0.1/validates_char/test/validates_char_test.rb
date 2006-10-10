
require File.dirname(__FILE__) + "/test_helper"
require File.dirname(__FILE__) + "/../init"

class ValidatesCharTest < Test::Unit::TestCase
  
  fixtures :parties
  
  def test_validates_char
    parties = Party.find_all
    parties.each{ |party|
      assert_equal true, party.valid?, party.name
    }
    
    fowler = Party.new(:name => "Martin Fowler")
    fowler.name_kana = "Martin Fowler"
    assert_equal false, fowler.valid?
    fowler.name_kana = "マーチン・ファウラー"
    assert_equal true, fowler.valid?
    
    tokyo_dynamite = Party.new(:name => "東京ダイナマイト")
    tokyo_dynamite.name_kana = "東京ダイナマイト1"
    assert_equal false, tokyo_dynamite.valid?
    tokyo_dynamite.name_kana = "Tokyo☆ダイナマイト2"
    assert_equal false, tokyo_dynamite.valid?
    tokyo_dynamite.name_kana = "トウキョウ☆ダイナマイト3"
    assert_equal false, tokyo_dynamite.valid?
    tokyo_dynamite.name_kana = "トウキョウ・ダイナマイト4"
    assert_equal true, tokyo_dynamite.valid?
    tokyo_dynamite.name_kana = "トウキョウダイナマイト5"
    assert_equal true, tokyo_dynamite.valid?
    
    tokyo_dynamite.name_kana = "とうきょうダイナマイト6"
    assert_equal "トウキョウダイナマイト6",  tokyo_dynamite.name_kana
    assert_equal true, tokyo_dynamite.valid?
    
    tokyo_dynamite.name_kana = "ﾄｳｷｮｳﾀﾞｲﾅﾏｲﾄ7"
    assert_equal "トウキョウダイナマイト7",  tokyo_dynamite.name_kana
    assert_equal true, tokyo_dynamite.valid?
    
    tokyo_dynamite.tel = "abcddefg"
    assert_equal false, tokyo_dynamite.valid?
    tokyo_dynamite.tel = "＋８１－３－２３４５－６７８９"
    assert_equal "+81-3-2345-6789",  tokyo_dynamite.tel
    assert_equal true, tokyo_dynamite.valid?
    
    
    
  end
end
