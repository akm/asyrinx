require File.dirname(__FILE__) + "/test_helper"
require File.dirname(__FILE__) + "/../init"

require 'jp_char'

class JpCharTest < Test::Unit::TestCase
  
  def test_conv
    han_numeric = "0123456789"
    han_alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    han_sign = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~|'
    han_kanasign = 'ﾞﾟ･ｰ'
    han_katakana = "ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ"
    
    zen_numeric = "０１２３４５６７８９"
    zen_alphabet = "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"
    zen_sign = "！＂＃＄％＆＇（）＊＋，－．／：；＜＝＞？＠［＼］＾＿｀｛｜｝～￤￥"
    zen_kanasign = "゛゜・ー"
    zen_katakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヽヾ"
    zen_hiragana = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゝゞ"
    
    check_char true, :hankaku_numeric, han_numeric
    check_char false, :hankaku_numeric, han_alphabet
    check_char false, :hankaku_numeric, han_sign
    check_char false, :hankaku_numeric, han_kanasign
    check_char false, :hankaku_numeric, han_katakana
    check_char false, :hankaku_numeric, zen_numeric
    check_char false, :hankaku_numeric, zen_alphabet
    check_char false, :hankaku_numeric, zen_sign
    check_char false, :hankaku_numeric, zen_kanasign
    check_char false, :hankaku_numeric, zen_katakana
    check_char false, :hankaku_numeric, zen_hiragana
    check_char false, :hankaku_numeric, "一亜○"
    
    check_char false, :hankaku_alphabet, han_numeric
    check_char true, :hankaku_alphabet, han_alphabet
    check_char false, :hankaku_alphabet, han_sign
    check_char false, :hankaku_alphabet, han_kanasign
    check_char false, :hankaku_alphabet, han_katakana
    check_char false, :hankaku_alphabet, zen_numeric
    check_char false, :hankaku_alphabet, zen_alphabet
    check_char false, :hankaku_alphabet, zen_sign
    check_char false, :hankaku_alphabet, zen_kanasign
    check_char false, :hankaku_alphabet, zen_katakana
    check_char false, :hankaku_alphabet, zen_hiragana
    check_char false, :hankaku_alphabet, "一亜○"

    check_char false, :hankaku_sign, han_numeric
    check_char false, :hankaku_sign, han_alphabet
    check_char true, :hankaku_sign, han_sign
    check_char false, :hankaku_sign, han_kanasign
    check_char false, :hankaku_sign, han_katakana
    check_char false, :hankaku_sign, zen_numeric
    check_char false, :hankaku_sign, zen_alphabet
    check_char false, :hankaku_sign, zen_sign
    check_char false, :hankaku_sign, zen_kanasign
    check_char false, :hankaku_sign, zen_katakana
    check_char false, :hankaku_sign, zen_hiragana
    check_char false, :hankaku_sign, "一亜○"
    
    check_char false, :hankaku_kanasign, han_numeric
    check_char false, :hankaku_kanasign, han_alphabet
    check_char false, :hankaku_kanasign, han_sign
    check_char true, :hankaku_kanasign, han_kanasign
    check_char false, :hankaku_kanasign, han_katakana
    check_char false, :hankaku_kanasign, zen_numeric
    check_char false, :hankaku_kanasign, zen_alphabet
    check_char false, :hankaku_kanasign, zen_sign
    check_char false, :hankaku_kanasign, zen_kanasign
    check_char false, :hankaku_kanasign, zen_katakana
    check_char false, :hankaku_kanasign, zen_hiragana
    check_char false, :hankaku_kanasign, "一亜○"
    
    check_char false, :hankaku_katakanachar, han_numeric
    check_char false, :hankaku_katakanabase, han_alphabet
    check_char false, :hankaku_katakanabase, han_sign
    check_char false, :hankaku_katakanabase, han_kanasign
    check_char true, :hankaku_katakanabase, han_katakana
    check_char false, :hankaku_katakanabase, zen_numeric
    check_char false, :hankaku_katakanabase, zen_alphabet
    check_char false, :hankaku_katakanabase, zen_sign
    check_char false, :hankaku_katakanabase, zen_kanasign
    check_char false, :hankaku_katakanabase, zen_katakana
    check_char false, :hankaku_katakanabase, zen_hiragana
    check_char false, :hankaku_katakanabase, "一亜○"

    check_char false, :hankaku_katakana, han_numeric
    check_char false, :hankaku_katakana, han_alphabet
    check_char false, :hankaku_katakana, han_sign
    check_char true, :hankaku_katakana, han_kanasign, :hankaku_kanasign
    check_char true, :hankaku_katakana, han_katakana, :hankaku_katakanabase
    check_char false, :hankaku_katakana, zen_numeric
    check_char false, :hankaku_katakana, zen_alphabet
    check_char false, :hankaku_katakana, zen_sign
    check_char false, :hankaku_katakana, zen_kanasign
    check_char false, :hankaku_katakana, zen_katakana
    check_char false, :hankaku_katakana, zen_hiragana
    check_char false, :hankaku_katakana, "一亜○"
    
    check_char false, :zenkaku_numeric, han_numeric
    check_char false, :zenkaku_numeric, han_alphabet
    check_char false, :zenkaku_numeric, han_sign
    check_char false, :zenkaku_numeric, han_kanasign
    check_char false, :zenkaku_numeric, han_katakana
    check_char true, :zenkaku_numeric, zen_numeric
    check_char false, :zenkaku_numeric, zen_alphabet
    check_char false, :zenkaku_numeric, zen_sign
    check_char false, :zenkaku_numeric, zen_kanasign
    check_char false, :zenkaku_numeric, zen_katakana
    check_char false, :zenkaku_numeric, zen_hiragana
    check_char false, :zenkaku_numeric, "一亜○"
    
    check_char false, :zenkaku_alphabet, han_numeric
    check_char false, :zenkaku_alphabet, han_alphabet
    check_char false, :zenkaku_alphabet, han_sign
    check_char false, :zenkaku_alphabet, han_kanasign
    check_char false, :zenkaku_alphabet, han_katakana
    check_char false, :zenkaku_alphabet, zen_numeric
    check_char true, :zenkaku_alphabet, zen_alphabet
    check_char false, :zenkaku_alphabet, zen_sign
    check_char false, :zenkaku_alphabet, zen_kanasign
    check_char false, :zenkaku_alphabet, zen_katakana
    check_char false, :zenkaku_alphabet, zen_hiragana
    check_char false, :zenkaku_alphabet, "一亜○"
    
    check_char false, :zenkaku_sign, han_numeric
    check_char false, :zenkaku_sign, han_alphabet
    check_char false, :zenkaku_sign, han_sign
    check_char false, :zenkaku_sign, han_kanasign
    check_char false, :zenkaku_sign, han_katakana
    check_char false, :zenkaku_sign, zen_numeric
    check_char false, :zenkaku_sign, zen_alphabet
    check_char true, :zenkaku_sign, zen_sign
    check_char false, :zenkaku_sign, zen_kanasign
    check_char false, :zenkaku_sign, zen_katakana
    check_char false, :zenkaku_sign, zen_hiragana
    check_char false, :zenkaku_sign, "一亜○"
    
    check_char false, :zenkaku_katakana, han_numeric
    check_char false, :zenkaku_katakana, han_alphabet
    check_char false, :zenkaku_katakana, han_sign
    check_char false, :zenkaku_katakana, han_kanasign
    check_char false, :zenkaku_katakana, han_katakana
    check_char false, :zenkaku_katakana, zen_numeric
    check_char false, :zenkaku_katakana, zen_alphabet
    check_char false, :zenkaku_katakana, zen_sign
    check_char true, :zenkaku_katakana, zen_kanasign, :zenkaku_kanasign
    check_char true, :zenkaku_katakana, zen_katakana, :zenkaku_katakanabase
    check_char false, :zenkaku_katakana, zen_hiragana
    check_char false, :zenkaku_katakana, "一亜○"
    
    check_char false, :zenkaku_hiragana, han_numeric
    check_char false, :zenkaku_hiragana, han_alphabet
    check_char false, :zenkaku_hiragana, han_sign
    check_char false, :zenkaku_hiragana, han_kanasign
    check_char false, :zenkaku_hiragana, han_katakana
    check_char false, :zenkaku_hiragana, zen_numeric
    check_char false, :zenkaku_hiragana, zen_alphabet
    check_char false, :zenkaku_hiragana, zen_sign
    check_char true, :zenkaku_hiragana, zen_kanasign, :zenkaku_kanasign
    check_char false, :zenkaku_hiragana, zen_katakana
    check_char true, :zenkaku_hiragana, zen_hiragana, :zenkaku_hiraganabase
    check_char false, :zenkaku_hiragana, "一亜○"

    check_char false, :zenkaku_kanji, han_numeric
    check_char false, :zenkaku_kanji, han_alphabet
    check_char false, :zenkaku_kanji, han_sign
    check_char false, :zenkaku_kanji, han_kanasign
    check_char false, :zenkaku_kanji, han_katakana
    check_char false, :zenkaku_kanji, zen_numeric
    check_char false, :zenkaku_kanji, zen_alphabet
    check_char false, :zenkaku_kanji, zen_sign
    check_char false, :zenkaku_kanji, zen_kanasign
    check_char false, :zenkaku_kanji, zen_katakana
    check_char false, :zenkaku_kanji, zen_hiragana
    check_char true, :zenkaku_kanji, "一亜○"
  end

  def check_char(expected, char_type, str, optional_type = nil)
    method_name = "#{char_type}?"
    str.each_char{ |c|
      assert_equal( expected, !!JpChar.__send__(method_name, c), "#{method_name}(#{c.inspect} of #{str.inspect} ) => #{expected}" )
      if expected
        assert_equal( true, [char_type, optional_type].include?(JpChar.char_type(c)), "char_type(#{c} of #{str} ) => #{char_type}" )
      end
    }
  end
  
  def test_specific_char
    check_char true, :zenkaku_kanji, "東京"
  end
  
  def test_match_all_char?
    assert_equal true, JpChar.match_all_char?("東京", [:zenkaku_kanji])
  end
  
  def test_respond_to?
    assert_equal true, JpChar.respond_to?(:numeric?)
    assert_equal true, JpChar.respond_to?(:sign?)
    assert_equal true, JpChar.respond_to?(:alphabet?)
    assert_equal true, JpChar.respond_to?(:katakana?)
    assert_equal true, JpChar.respond_to?(:hiragana?)
    assert_equal true, JpChar.respond_to?(:kanji?)
    assert_equal true, JpChar.respond_to?(:hankaku_numeric?)
    assert_equal true, JpChar.respond_to?(:hankaku_sign?)
    assert_equal true, JpChar.respond_to?(:hankaku_alphabet?)
    assert_equal true, JpChar.respond_to?(:hankaku_katakana?)
    assert_equal false, JpChar.respond_to?(:hankaku_hiragana?)
    assert_equal false, JpChar.respond_to?(:hankaku_kanji?)
    assert_equal true, JpChar.respond_to?(:zenkaku_numeric?)
    assert_equal true, JpChar.respond_to?(:zenkaku_sign?)
    assert_equal true, JpChar.respond_to?(:zenkaku_alphabet?)
    assert_equal true, JpChar.respond_to?(:zenkaku_katakana?)
    assert_equal true, JpChar.respond_to?(:zenkaku_hiragana?)
    assert_equal true, JpChar.respond_to?(:zenkaku_kanji?)
    
    assert_equal true, JpChar.respond_to?(:hankaku_alphabet_numeric?)
    assert_equal true, JpChar.respond_to?(:zenkaku_katakana_hiragana_kanji?)
    assert_equal true, JpChar.respond_to?(:hankaku_alphabet_numeric?)
    assert_equal true, JpChar.respond_to?(:kanji_alphabet?)
  end
  
  def test_convert_to_zenkaku_katakana
    assert_equal "0123456789abcdefghijklmnopqrstuガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ",
      JpChar::KANA.convert(
        "0123456789abcdefghijklmnopqrstuがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽヴあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっ",
        :zenkaku_katakana, [:hankaku_katakana, :zenkaku_hiragana]
      )
    assert_equal "0123456789abcdefghijklmnopqrstuガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ",
      JpChar::KANA.convert(
        "0123456789abcdefghijklmnopqrstuｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯ",
        :zenkaku_katakana
      )
  end

  def test_convert_by_symbol
    assert_equal "0123456789abcdefghijklmnopqrstuガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ",
      JpChar.convert(
        "0123456789abcdefghijklmnopqrstuがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽヴあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっ",
        { :hankaku_katakana => :zenkaku_katakana,
          :zenkaku_hiragana => :zenkaku_katakana } )
    assert_equal "0123456789abcdefghijklmnopqrstuガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ",
      JpChar.convert(
        "0123456789abcdefghijklmnopqrstuｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯ",
        { :hankaku_katakana => :zenkaku_katakana,
          :zenkaku_hiragana => :zenkaku_katakana } )
    assert_equal "トウキョウダイナマイト",
      JpChar.convert( "とうきょうだいなまいと",
        {:zenkaku_hiragana=>:zenkaku_katakana, :hankaku_katakana=>:zenkaku_katakana} )
    assert_equal "トウキョウダイナマイト",
      JpChar.convert( "とうきょうダイナマイト",
        {:zenkaku_hiragana=>:zenkaku_katakana, :hankaku_katakana=>:zenkaku_katakana} )
    assert_equal "トウキョウダイナマイト",
      JpChar.convert( "ﾄｳｷｮｳﾀﾞｲﾅﾏｲﾄ",
        {:zenkaku_hiragana=>:zenkaku_katakana, :hankaku_katakana=>:zenkaku_katakana} )
  end  
end
