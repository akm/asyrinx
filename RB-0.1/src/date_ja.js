(function(){
	Date.EraGroup.ALL = new Date.EraGroup();
	var userLanguage = navigator.language || navigator.userLanguage || navigator.systemLanguage || "";
	if (userLanguage.indexOf("ja") > -1) {
		Date.Era.MEIJI = Date.Era.create("ñæé°", "ñæ", "M", "1868/01/01", "1912/07/29");
		Date.Era.TAISHO = Date.Era.create("ëÂê≥", "ëÂ", "T", "1912/07/30", "1926/12/24");
		Date.Era.SHOWA = Date.Era.create("è∫òa", "è∫", "S", "1926/12/25", "1989/01/07");
		Date.Era.HEISEI = Date.Era.create("ïΩê¨", "ïΩ", "H", "1989/01/08", "2050/12/31" );
		Date.Era.SEIREKI = new Date.Era.ADEra("êºóÔ", "êº", "AD", "0001/01/01", "2050/12/31" );
		//
		Date.EraGroup.DEFAULT_WAREKI = new Date.EraGroup();
		Date.EraGroup.DEFAULT_WAREKI.add(
			Date.Era.MEIJI,Date.Era.TAISHO,Date.Era.SHOWA,Date.Era.HEISEI
		);
		//
		Date.EraGroup.DEFAULT_SEIREKI = new Date.EraGroup();
		Date.EraGroup.DEFAULT_SEIREKI.add(Date.Era.SEIREKI);
		//
		Date.EraGroup.DEFAULT_WAREKI_SEIREKI = new Date.EraGroup();
		Date.EraGroup.DEFAULT_WAREKI_SEIREKI.add(
			Date.Era.MEIJI,Date.Era.TAISHO,Date.Era.SHOWA,Date.Era.HEISEI,Date.Era.SEIREKI
		);
		Date.EraGroup.DEFAULT_ja = Date.EraGroup.DEFAULT_WAREKI_SEIREKI;
		Date.EraGroup.DEFAULT = Date.EraGroup.DEFAULT_ja;
		//
		Date.EraGroup.ALL.add(
			Date.Era.MEIJI,Date.Era.TAISHO,Date.Era.SHOWA,Date.Era.HEISEI,Date.Era.SEIREKI
		);
	}
	Date.Era.AD = new Date.Era.ADEra("AD", "AD", "AD", "0001/01/01", null);
	Date.EraGroup.DEFAULT_en = Date.Era.AD;
	if (!Date.EraGroup.DEFAULT)
		Date.EraGroup.DEFAULT = Date.EraGroup.DEFAULT_en;
	Date.EraGroup.ALL.add(Date.Era.AD);
})();
