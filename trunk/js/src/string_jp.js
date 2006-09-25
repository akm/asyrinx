/**
 * string_jp.js
 * 
 * require 
 *    prototype.js
 *    prototype_ext.js
 *
 * @copyright T.Akima
 * @license LGPL
 */

String.Japanese = {};
String.Japanese.Chars = {
    HANKAKU_NUMERIC: "0123456789".split(""),
    HANKAKU_SIGNS: "`-=[]\\;',./~!@#$%^&*()_+{}|:\"<>?".split(""),
    HANKAKU_ALPHABET_UPPER: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    HANKAKU_ALPHABET_LOWER: "abcdefghijklmnopqrstuvwxyz".split(""),
    HANKAKU_KATAKANA: ["ｶﾞ","ｷﾞ","ｸﾞ","ｹﾞ","ｺﾞ","ｻﾞ","ｼﾞ","ｽﾞ","ｾﾞ","ｿﾞ","ﾀﾞ","ﾁﾞ","ﾂﾞ","ﾃﾞ","ﾄﾞ","ﾊﾞ","ﾋﾞ","ﾌﾞ","ﾍﾞ","ﾎﾞ","ﾊﾟ","ﾋﾟ","ﾌﾟ","ﾍﾟ","ﾎﾟ","ｳﾞ"].pushAll("ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯ".split("")),

    ZENKAKU_NUMERIC: "０１２３４５６７８９".split(""),
    ZENKAKU_SIGNS: "｀－＝［］￥；’，．／～！＠＃＄％＾＆＊（）＿＋｛｝｜：”＜＞？".split(""),
    ZENKAKU_ALPHABET_UPPER: "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ".split(""),
    ZENKAKU_ALPHABET_LOWER: "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ".split(""),
    ZENKAKU_KATAKANA: "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォャュョッ".split(""),
    ZENKAKU_HIRAGANA: "がぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽヴあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんぁぃぅぇぉゃゅょっ".split("")
};
(function(){
    var sources = {};
    var replaces = {};
    sources.toKatakana = String.Japanese.Chars.ZENKAKU_HIRAGANA;
    replaces.toKatakana = String.Japanese.Chars.ZENKAKU_KATAKANA;
    sources.toHiragana = String.Japanese.Chars.ZENKAKU_KATAKANA;
    replaces.toHiragana = String.Japanese.Chars.ZENKAKU_HIRAGANA;
    
    sources.toZenkaku = []
        .pushAll(String.Japanese.Chars.HANKAKU_KATAKANA)
        .pushAll(String.Japanese.Chars.HANKAKU_NUMERIC)
        .pushAll(String.Japanese.Chars.HANKAKU_SIGNS)
        .pushAll(String.Japanese.Chars.HANKAKU_ALPHABET_UPPER)
        .pushAll(String.Japanese.Chars.HANKAKU_ALPHABET_LOWER);
    replaces.toZenkaku = []
        .pushAll(String.Japanese.Chars.ZENKAKU_KATAKANA)
        .pushAll(String.Japanese.Chars.ZENKAKU_NUMERIC)
        .pushAll(String.Japanese.Chars.ZENKAKU_SIGNS)
        .pushAll(String.Japanese.Chars.ZENKAKU_ALPHABET_UPPER)
        .pushAll(String.Japanese.Chars.ZENKAKU_ALPHABET_LOWER);
    
    sources.toHankaku = []
        .pushAll(String.Japanese.Chars.ZENKAKU_NUMERIC)
        .pushAll(String.Japanese.Chars.ZENKAKU_SIGNS)
        .pushAll(String.Japanese.Chars.ZENKAKU_ALPHABET_UPPER)
        .pushAll(String.Japanese.Chars.ZENKAKU_ALPHABET_LOWER)
        .pushAll(String.Japanese.Chars.ZENKAKU_KATAKANA)
        .pushAll(String.Japanese.Chars.ZENKAKU_HIRAGANA);
    replaces.toHankaku = []
        .pushAll(String.Japanese.Chars.HANKAKU_NUMERIC)
        .pushAll(String.Japanese.Chars.HANKAKU_SIGNS)
        .pushAll(String.Japanese.Chars.HANKAKU_ALPHABET_UPPER)
        .pushAll(String.Japanese.Chars.HANKAKU_ALPHABET_LOWER)
        .pushAll(String.Japanese.Chars.HANKAKU_KATAKANA)
        .pushAll(String.Japanese.Chars.HANKAKU_KATAKANA);
    var regExps = {};
    var expSigns="()[]{}^|:.+*?$\\";
    for(var sourceName in sources){
        var chars = sources[sourceName].clone();
        for(var i=0;i<chars.length;i++){
            if (expSigns.indexOf(chars[i])>-1)
                chars[i] = "\\" + chars[i];
        }
        regExps[sourceName] = new RegExp(chars.join("|"), "g");
    }
    
    String.Japanese.Sources = sources;
    String.Japanese.Replaces = replaces;
    String.Japanese.RegExps = regExps;
})();

Object.extend(String.Japanese, {
    replace: function(str, methodName){
        var sources = String.Japanese.Sources[methodName];
        var replaces = String.Japanese.Replaces[methodName];
        return str.replace(String.Japanese.RegExps[methodName], 
            function(matchChar, strIndex, str){
                var index = sources.indexOf(matchChar);
                return replaces[index];
            });
    }
});

String.Japanese.Methods = {
    toKatakana: function(){return String.Japanese.replace(this,"toKatakana");},
    toHiragana: function(){return String.Japanese.replace(this,"toHiragana");},
    toZenkaku: function(){return String.Japanese.replace(this,"toZenkaku");},
    toHankaku: function(){return String.Japanese.replace(this,"toHankaku");}
};
Object.extend(String.prototype, String.Japanese.Methods);


String.Japanese.Romaji = Class.create();
String.Japanese.Romaji.prototype = {
    initialize: function(baseMap, ttChar, nnChar){
        this.convertLastN = true;
        this.ttChar = ttChar;
        this.nnChar = nnChar;
        this.maps = this.toMaps(baseMap);
    },
    toMaps: function(baseMap){
        var maxKeyLength = 0;
        for(var key in baseMap){
            if (maxKeyLength < key.length)
                maxKeyLength = key.length;
        }
        var result = new Array(maxKeyLength + 1); //+1はttの分
        result = result.collect( function(){return {};} );
        for(var i=0;i<maxKeyLength;i++){
            for(var key in baseMap){
                if (key.length!=(i+1))
                    continue;
                var kana = baseMap[key];
                result[i][key] = kana;
    			var headChar = key.charAt(0);
    			if ((headChar!='l')&&(headChar!='n')&&(headChar!='x')){
    				result[i+1][headChar+key] = this.ttChar + kana;
    			}
            }
        }
        this.maxKeyLength = maxKeyLength + 1;
        return result;
    },
    
    toKana: function(str){
        var result = "", t = str;
        while(t.length > 0){
            var mapped = null;
            for(var i=this.maps.length-1;i>-1;i--){
                var searching = t.substring(0,i+1);
                mapped = this.maps[i][searching];
                if (mapped){
                    result += mapped;
                    t = t.substring(i+1);
                    break;
                }
            }
            if (!mapped){
                result +=  ( (this.convertLastN && /^n$|^n\b/.test(t)) ? this.nnChar : t.charAt(0) );
                t = t.substring(1);
            }
        }
        return result;
    }
};
Object.extend(String.Japanese.Romaji, {
    Convertors: {},
    
	getConvertors: function(kanaType) {
	   var result = String.Japanese.Romaji.Convertors[kanaType];
	   if (!result){
	       result = this.create(kanaType);
	       String.Japanese.Romaji.Convertors[kanaType] = result;
	   }
	   return result;
	},

    create: function(kanaType){
        var baseMap = this.createBeseMap();
        if (kanaType=="katakana"){
            for(var key in baseMap)
                baseMap[key] = baseMap[key].toKatakana();
        }
        if (kanaType=="katakana")
            return new String.Japanese.Romaji(baseMap, "ッ", "ン");
        else
            return new String.Japanese.Romaji(baseMap, "っ", "ん");
    },
    
	pattern_h: function(baseAlphabet,baseHira){
		var result = {};
		result[baseAlphabet+"a"] = baseHira+"ゃ";
		result[baseAlphabet+"i"] = baseHira;
		result[baseAlphabet+"u"] = baseHira+"ゅ";
		result[baseAlphabet+"e"] = baseHira+"ぇ";
		result[baseAlphabet+"o"] = baseHira+"ょ";
		return result;
	},
	pattern_w: function(baseAlphabet,baseHira){
		var result = {};
		result[baseAlphabet+"a"] = baseHira+"ぁ";
		result[baseAlphabet+"i"] = baseHira+"ぃ";
		result[baseAlphabet+"u"] = baseHira+"ぅ";
		result[baseAlphabet+"e"] = baseHira+"ぇ";
		result[baseAlphabet+"o"] = baseHira+"ぉ";
		return result;
	},
	pattern_y: function(baseAlphabet,baseHira){
		var result = {};
		result[baseAlphabet+"a"] = baseHira+"ゃ";
		result[baseAlphabet+"i"] = baseHira+"ぃ";
		result[baseAlphabet+"u"] = baseHira+"ゅ";
		result[baseAlphabet+"e"] = baseHira+"ぇ";
		result[baseAlphabet+"o"] = baseHira+"ょ";
		return result;
	},
	
	
	createBeseMap: function() {
	   var result = {};
	   Object.extend(result, {
	       '-':'ー',
		   'a':'あ',
    	   'ba':'ば', 'bi':'び', 'bu':'ぶ', 'be':'べ', 'bo':'ぼ'
	   });
	   Object.extend(result, this.pattern_y("by", "び"));
	   Object.extend(result, {
    	   'ca':'か', 'ci':'し', 'cu':'く', 'ce':'せ', 'co':'こ'
	   });
	   Object.extend(result, this.pattern_y("cy", "ち"));
	   Object.extend(result, this.pattern_h("ch", "ち"));
	   
	   Object.extend(result, {
    	   'da':'だ', 'di':'ぢ', 'du':'づ', 'de':'で', 'do':'ど'
	   });
	   Object.extend(result, this.pattern_y("dy", "ぢ"));
	   Object.extend(result, this.pattern_y("dh", "で"));
	   Object.extend(result, this.pattern_w("dw", "ど"));
	   Object.extend(result, {
	       'e':'え',
    	   'fa':'ふぁ', 'fi':'ふぃ', 'fu':'ふ', 'fe':'ふぇ', 'fo':'ふぉ'
	   });
	   Object.extend(result, this.pattern_y("fy", "ふ"));
	   Object.extend(result, this.pattern_w("fw", "ふ"));
	   Object.extend(result, {
    	   'ga':'が', 'gi':'ぎ', 'gu':'ぐ', 'ge':'げ', 'go':'ご'
	   });
	   Object.extend(result, this.pattern_y("gy", "ぎ"));
	   Object.extend(result, this.pattern_w("gw", "ぐ"));
	   Object.extend(result, {
    	   'ha':'は', 'hi':'ひ', 'hu':'ふ', 'he':'へ', 'ho':'ほ'
	   });
	   Object.extend(result, this.pattern_y("hy", "ひ"));
	   Object.extend(result, {
	       'i':'い',
    	   'ja':'じゃ', 'ji':'じ', 'ju':'じゅ', 'je':'じぇ', 'jo':'じょ'
	   });
	   Object.extend(result, this.pattern_y("jy", "じ"));
	   Object.extend(result, {
    	   'ka':'か', 'ki':'き', 'ku':'く', 'ke':'け', 'ko':'こ',
    	   'kwa':'くぁ'
	   });
	   Object.extend(result, this.pattern_y("ky", "き"));
	   Object.extend(result, {
    	   'la':'ぁ', 'li':'ぃ', 'lu':'ぅ', 'le':'ぇ', 'lo':'ぉ',
    	   'lka':'ヵ',
    	   'ltu':'っ',
    	   'ltsu':'っ',
    	   'lya':'ゃ', 'lyu':'ゅ', 'lyo':'ょ', 
    	   'lwa':'ゎ'
	   });
	   Object.extend(result, {
    	   'ma':'ま', 'mi':'み', 'mu':'む', 'me':'め', 'mo':'も'
	   });
	   Object.extend(result, this.pattern_y("my", "み"));
	   Object.extend(result, {
    	   'na':'な', 'ni':'に', 'nu':'ぬ', 'ne':'ね', 'no':'の',
    	   'nn':'ん' //, 'n':'ん'
	   });
	   Object.extend(result, this.pattern_y("ny", "に"));
	   Object.extend(result, {
    	   'o':'お',
    	   'pa':'ぱ', 'pi':'ぴ', 'pu':'ぷ', 'pe':'ぺ', 'po':'ぽ'
	   });
	   Object.extend(result, this.pattern_y("py", "ぴ"));
	   Object.extend(result, {
    	   'qa':'くぁ', 'qi':'くぃ', 'qu':'く', 'qe':'くぇ', 'qo':'くぉ'
	   });
	   Object.extend(result, this.pattern_y("qy", "く"));
	   Object.extend(result, this.pattern_w("qw", "く"));
	   Object.extend(result, {
    	   'ra':'ら', 'ri':'り', 'ru':'る', 're':'れ', 'ro':'ろ'
	   });
	   Object.extend(result, this.pattern_y("ry", "り"));
	   Object.extend(result, {
    	   'sa':'さ', 'si':'し', 'su':'す', 'se':'せ', 'so':'そ'
	   });
	   Object.extend(result, this.pattern_h("sh", "し"));
	   Object.extend(result, this.pattern_y("sy", "し"));
	   Object.extend(result, this.pattern_w("sw", "す"));
	   Object.extend(result, {
    	   'ta':'た', 'ti':'ち', 'tu':'つ', 'te':'て', 'to':'と',
    	   'tsu':'つ'
	   });
	   Object.extend(result, this.pattern_y("ty", "ち"));
	   Object.extend(result, this.pattern_y("th", "て"));
	   Object.extend(result, this.pattern_w("tw", "と"));
	   Object.extend(result, {
    	   'u':'う',
    	   'va':'ヴぁ', 'vi':'ヴぃ', 'vu':'ヴ', 've':'ヴぇ', 'vo':'ヴぉ'
	   });
	   Object.extend(result, this.pattern_y("vy", "ヴ"));
	   Object.extend(result, {
    	   'wa':'わ', 'wi':'うぃ', 'wu':'う', 'we':'うぇ', 'wo':'を',
    	   'wha':'うぁ', 'whi':'うぃ', 'whu':'う', 'whe':'うぇ', 'who':'うぉ',
    	   'xa':'ぁ', 'xi':'ぃ', 'xu':'ぅ', 'xe':'ぇ', 'xo':'ぉ',
    	   'xka':'ヵ', 
    	   'xtu':'っ', //'xtsu':'ｘつ',
    	   'xya':'ゃ', 'xyi':'ぃ', 'xyu':'ゅ', 'xye':'ぇ', 'xyo':'ょ',
    	   'xwa':'ゎ',
    	   'ya':'や', 'yi':'い', 'yu':'ゆ', 'ye':'いぇ', 'yo':'よ',
    	   'za':'ざ', 'zi':'じ', 'zu':'ず', 'ze':'ぜ', 'zo':'ぞ'
	   });
	   Object.extend(result, this.pattern_y("zy", "じ"));
	   return result;
	},
	
    toKatakana: function(str){
        var convertor = this.getConvertors("katakana");
        return convertor.toKana(str);
    },
    toHiragana: function(str){
        var convertor = this.getConvertors("hiragana");
        return convertor.toKana(str);
    }
});
