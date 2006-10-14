module JpChar
  
  class Type
    def self.instance
      return @@instances
    end
    
    KAKU_NAMES = { :hankaku => "半角", :zenkaku => "全角" }
    TYPE_NAMES = {
      :alphabet => "アルファベット",
      :numeric => "数字",
      :sign => "記号",
      :kanasign => "かな記号",
      :hiragana => "ひらがな",
      :katakana => "カタカナ",
      :kanji => "漢字"
    }
    TYPES_OF_KAKU = {}
    
    def initialize(kaku, type, chars = nil, &include)
      @kaku = kaku
      @type = type
      @symbol = "#{kaku.to_s}_#{type.to_s}".to_sym
      @chars = chars
      @include = include
      @@instances ||= []
      @@instances.push(self)
      TYPES_OF_KAKU[@kaku] = [] unless TYPES_OF_KAKU[@kaku]
      TYPES_OF_KAKU[@kaku].push(self)
    end
    
    def caption
      TYPE_NAMES[@type]
    end
    
    def type
      @type
    end
    
    def to_sym
      @symbol
    end
    
    def to_s
      "#{KAKU_NAMES[@kaku]}#{caption}"
    end
    
    def match(type_name_parts)
      type_name_parts.include?(@type.to_s)
    end
    
    def include?(c)
     (@include) ? @include.call(c) : 
      @chars.is_a?(Array) ? !!@chars.detect{|char| include_in_char?(char, c) } : 
      include_in_char?(@chars, c)
    end
    
    def include_in_char?(chars, c)
      return (chars.first <= c && c <= chars.last) if chars.is_a?(Range)
      return chars.include?(c) if chars.respond_to?(:include?)
      return chars.match(c) if chars.respond_to?(:match)
      return chars == c
    end
  end
  
  HANKAKU_NUMERIC = Type.new(:hankaku, :numeric, '0'..'9')
  HANKAKU_ALPHABET = Type.new(:hankaku, :alphabet, ["a".."z", "A".."Z"] )
  HANKAKU_SIGN = Type.new(:hankaku, :sign, ["!".."/", ":".."@", "[".."`", "{".."~", "｡".."､" ] )
  HANKAKU_KANASIGN = Type.new(:hankaku, :kanasign, 'ﾞﾟ･ｰ')
  HANKAKU_KATAKANA_CHAR = Type.new(:hankaku, :katakanabase, 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ')
  HANKAKU_KATAKANA = Type.new(:hankaku, :katakana, [HANKAKU_KANASIGN, HANKAKU_KATAKANA_CHAR])
  
  ZENKAKU_NUMERIC = Type.new(:zenkaku, :numeric, ("０".."９").to_a.join)
  ZENKAKU_ALPHABET = Type.new(:zenkaku, :alphabet, ("Ａ".."Ｚ").to_a.join + ("ａ".."ｚ").to_a.join )
  ZENKAKU_SIGN = Type.new(:zenkaku, :sign, ["！".."／", "：".."＠", "［".."｀", "｛".."～", "￠".."￥", "￨".."￥"] )
  ZENKAKU_KANASIGN = Type.new(:zenkaku, :kanasign, "゛゜・ー")
  ZENKAKU_KATAKANA_CHAR = Type.new(:zenkaku, :katakanabase, ["ァ".."タ", "ダ".."ヾ"] )
  ZENKAKU_HIRAGANA_CHAR = Type.new(:zenkaku, :hiraganabase, ["ぁ".."み", "む".."ゔ", "゛".."ゞ"] )
  ZENKAKU_KATAKANA = Type.new(:zenkaku, :katakana, [ZENKAKU_KANASIGN, ZENKAKU_KATAKANA_CHAR])
  ZENKAKU_HIRAGANA = Type.new(:zenkaku, :hiragana, [ZENKAKU_KANASIGN, ZENKAKU_HIRAGANA_CHAR])
  
  ZENKAKU_KANJI = Type.new(:zenkaku, :kanji){ |c|
    result = true
    PRIMITIVES.each{|t| 
      if t.include? c
        result = false
        break
      end
    }
    result
  }
  
  PRIMITIVES = Type.instance - [ZENKAKU_KANJI]
  
  def self.types_for(*symbols)
   (symbols.collect{ |type_sym|
      parts = type_sym.to_s.split('_')
      types = (parts.first=="hankaku") ? Type::TYPES_OF_KAKU[:hankaku] : (parts.first=="zenkaku") ? Type::TYPES_OF_KAKU[:zenkaku] : Type.instance
      types.select{ |t| t.match(parts) }
    } || []).flatten!.uniq
  end
  
  def self.type_captions(type_symbols)
    self.types_for(type_symbols).collect{|t|t.to_s}
  end
  
  def self.char_type(c)
    PRIMITIVES.each{ |t| return t.to_sym if t.include?(c) }
    return ZENKAKU_KANJI.to_sym
  end
  
  def self.method_missing(name, *args)
    method_name = name.to_s
    if /\?$/ =~ method_name
      types = types_for(method_name[0..-2])
      NameError.new("method not found", name) if types.empty?
      types.each{ |t| return true if t.include?(*args) }
      return false
    end
    super
  end
  
  def self.respond_to?(name)
    method_name = name.to_s
    if /\?$/ =~ method_name
      types = types_for(method_name[0..-2])
      return !types.empty?
    end
    super
  end
  
  def self.match_all_char?(str, types)
    require 'jcode'
    str.each_char{ |c|
      return false unless match_any_type?(c, types)
    }
    return true
  end
  
  def self.unmatch_all_char?(str, types)
    require 'jcode'
    str.each_char{ |c|
      return false if match_any_type?(c, types)
    }
    return true
  end
  
  def self.match_any_type?(c, types)
    return !!types.detect{ |t| self.match_type?(c, t) }
  end
  
  def self.match_type?(c, type)
    if (type.is_a? Symbol)
      types = types_for(type.to_s)
      types.each{ |t| return true if t.include?(c) }
      return false
    elsif type.respond_to? :include?
      return !!type.include?(c)
    elsif type.respond_to? :match
      return !!type.match(c)
    else
      return type == c
    end
  end
  
  def self.hankaku?(c)
    c.length == 1
  end
  
  def self.zenkaku?(c)
    c.length == 2
  end
  
  class Convertor
    def self.instances
      @@instances
    end
    
    def initialize(type_values)
      @type_values = type_values
      @@instances ||= []
      @@instances.push(self)
    end
    
    def match(replace, *searches)
      searches.each{|s| return false unless @type_values.has_key?(s) } 
      @type_values.has_key?(replace)
    end
    
    def convert(str, replace, searches = nil)
      convert!(str.dup, replace, searches)
    end
    
    def convert!(str, replace, searches = nil)
      require 'jcode'
      searches = @type_values.keys.to_a - [replace] unless searches
      replace_array = @type_values[replace]
      searches.each{ |search| replace_by_search(str, @type_values[search], replace_array) }
      str
    end
    
    def replace_by_search(str, search_array, replace_array)
      search_array.each_index{ |index|
        s = search_array[index]
        r = replace_array[index]
        p = 0
        while idx = str.index(s, p)
          str[ idx, s.length ] = r
          p = idx + s.length
        end
      }
    end
    
    
    def self.find_all( conversions )
      convertor_options = {}
      conversions.each_pair{ |k, v|
        convertors = self.instances.select{ |convertor| convertor.match(v,k) }
        convertors.each{|convertor|
          convertor_options[convertor] ||= {}
          convertor_options[convertor][v] ||= []
          convertor_options[convertor][v] << k
        }
      }
      convertor_options
    end
  end
  
  KANA = Convertor.new({
    :hankaku_katakana => ["ｶﾞ","ｷﾞ","ｸﾞ","ｹﾞ","ｺﾞ","ｻﾞ","ｼﾞ","ｽﾞ","ｾﾞ","ｿﾞ","ﾀﾞ","ﾁﾞ","ﾂﾞ","ﾃﾞ","ﾄﾞ","ﾊﾞ","ﾋﾞ","ﾌﾞ","ﾍﾞ","ﾎﾞ","ﾊﾟ","ﾋﾟ","ﾌﾟ","ﾍﾟ","ﾎﾟ","ｳﾞ"] + 
        "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯ".split(''),
    :zenkaku_katakana => "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ".split(''),
    :zenkaku_hiragana => "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽヴあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっ".split('')
  })
  
  ALPHABET = Convertor.new({
    :hankaku_alphabet => ('a'..'z').to_a + ('A'..'Z').to_a,
    :zenkaku_alphabet => ("ａ".."ｚ").to_a + ("Ａ".."Ｚ").to_a
  })
  
  NUMERIC = Convertor.new({
    :hankaku_numeric => ('0'..'9').to_a,
    :zenkaku_numeric => ("０".."９").to_a
  })
  
  SIGN = Convertor.new({
    :hankaku_sign => "!\"\#$%&'()*+,-./:;<=>?@[\\]^_`{|}~".split(''),
    :zenkaku_sign => "！”＃＄％＆’（）＊＋，－．／：；＜＝＞？＠［￥］＾＿｀｛｜｝～".split('')
  })
  
  def self.convert(str, conversions)
    result = str.dup
    convertor_options = Convertor.find_all(conversions)
    convertor_options.each_pair{|convertor, options|
      options.each_pair{ |k, v| convertor.convert!(result, k, v)  }
    }
    return result
  end
  
end
