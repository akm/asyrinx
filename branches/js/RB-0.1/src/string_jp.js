/**
 * string_jp.js
 * 
 * require prototype.js only
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
