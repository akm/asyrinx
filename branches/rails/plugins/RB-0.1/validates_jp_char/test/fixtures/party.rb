require 'nkf'

class Party < ActiveRecord::Base
  validates_jp_char :name_kana, :deny => [:kanji, :alphabet], 
    :conversions => {
      :hankaku_katakana => :zenkaku_katakana,
      :zenkaku_hiragana => :zenkaku_katakana
    }
  
  validates_jp_char :tel, :accept => [:hankaku_numeric, "+-"], 
    :conversions => {
      :zenkaku_numeric => :hankaku_numeric,
      :zenkaku_sign => :hankaku_sign
    }
  
end
