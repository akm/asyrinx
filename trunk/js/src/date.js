/**
 * date.js
 * 
 * require 
 *     prototype.js 
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

Object.extend(Date.prototype, {
	clone: function() {
		return new Date(this.getTime());
	},
	toISODate: function() {
		var s = this.getFullYear();
		var m = this.getMonth() + 1;
		if (m<10)
			m = "0" + m;
		var day = this.getDate();
		if (day<10)
			day = "0" + day;
		return String(s) + String(m) + String(day);
	},
	inc: function(property,value){
	   var d = this.clone();
	   var setter="set"+property, getter="get"+property;
	   d[setter](this[getter]()+(value||1));
	   return d;
	},
	
	succYear: function(){return this.inc("FullYear");},
	succMonth: function(){return this.inc("Month");},
	succDate: function(){return this.inc("Date");},
	succHours: function(){return this.inc("Hours");},
	succMinutes: function(){return this.inc("Minutes");},
	succSeconds: function(){return this.inc("Seconds");},
	succMilliseconds: function(){return this.inc("Milliseconds");},
	
	toBeginOfDate:function(){
	   var d=this.clone();
	   d.setHours(0);
	   d.setMinutes(0);
	   d.setSeconds(0);
	   d.setMilliseconds(0);
	   return d;
	},
	toEndOfDate:function(){
	   var d=this.clone();
	   d.setHours(23);
	   d.setMinutes(59);
	   d.setSeconds(59);
	   d.setMilliseconds(999);
	   return d;
	}
});
Date.prototype.succ=Date.prototype.succDate;

Object.extend(Date, {
	msecOfADay: 24 * 60 * 60 * 1000,
	isLeapYear: function(year) {
		return ((year%4==0)&&((year%100!=0)||(year%400==0)));
	},
	getDaysOfYear: function(year) {
		return (Date.isLeapYear(year))?366:365;
	},
	getDaysOfMonth: function(year, month) {
		var d1 = new Date(year, month, 1);
		var d2 = new Date(year, month + 1, 1);
		return Math.round((d2-d1)/Date.msecOfADay);
	},
	
	parseDate: function(dateString, yearDelim, monthDelim, dayDelim) {
		if (!dateString) return null;
		var result = {year:0,month:1,date:1};
		var tempStr = dateString;
		var delim;
		var idx = -1;
		//year
		delim = yearDelim || "/";
		idx = tempStr.indexOf(delim);
		if (idx < 0) return result;
		result.year = tempStr.substring(0, idx) * 1;
		tempStr = tempStr.substring(idx + delim.length );
		//month
		delim = monthDelim || "/";
		idx = tempStr.indexOf(delim);
		if (idx < 0) return result;
		result.month = tempStr.substring(0, idx) * 1;
		tempStr = tempStr.substring(idx + delim.length );
		//day
		delim = dayDelim || "/";
		idx = tempStr.indexOf(delim);
		result.date = ((idx < 0) ? tempStr : tempStr.substring(0, idx)) * 1;
		return result;
	},
	isValid: function(date){
	   return !/NaN|Invalid/.test(String(date));
	}
});


DateEra = Class.create();
Object.extend(DateEra, {
	create: function(longName, shortName, initialChar, beginDateStr, endDateStr) {
		var beginDate = beginDateStr ? (new Date(beginDateStr)).toBeginOfDate() : null;
		var endDate = endDateStr ? (new Date(endDateStr)).toEndOfDate() : null;
		var range = new ObjectRange(beginDate, endDate);
		return new DateEra(longName, shortName, initialChar, range);
	},
	captionProperties: ["initialChar", "shortName", "longName"]
});
DateEra.prototype = {
	initialize: function(longName, shortName, initialChar, dateRange) {
		this.longName = longName;
		this.shortName = shortName;
		this.initialChar = initialChar;
		this.dateRange = dateRange;
	},
	contains: function(date) {
		return this.dateRange.include(date);
	},
	getBeginYear: function() {
		return this.dateRange.start ? this.dateRange.start.getFullYear() : null;
	},
	toADYear: function(eraYear) {
		return this.getBeginYear() + ((eraYear>1900)?eraYear-1900:eraYear) -1;
	},
	getEraYear: function(date) {
		if (!date)
			return null;
		var dy = date.getFullYear();
		var baseY = this.getBeginYear();
		return dy - baseY + 1;
	},
	setEraYear: function(date, eraYear) {
		var baseY = this.getBeginYear();
		var y = eraYear + baseY - 1;
		date.setFullYear(y);
	},
	format: function(date, captionProperty, yearDelim, monthDelim, dayDelim) {
		if (!date)
			return null;
		captionProperty = captionProperty || "initialChar";
		yearDelim = yearDelim || "/";
		monthDelim = monthDelim || "/"; 
		dayDelim = dayDelim || "";
		var ey = this.getEraYear(date);
		var eraStr = captionProperty ? this[captionProperty] : "";
		return eraStr + ey + yearDelim + (date.getMonth() + 1) + monthDelim + date.getDate() + dayDelim;
	},
	formatByLongName: function(date) {return this.format(date,"longName");},
	formatByShortName: function(date) {return this.format(date, "shortName");},
	formatByInitialChar: function(date) {return this.format(date, "initialChar");},
	
	toString: function(){
	   return this.longName;
	}
}
DateEra.ADEra = Class.create();
Object.extend(DateEra.ADEra.prototype, DateEra.prototype);
Object.extend(DateEra.ADEra.prototype, {
	contains: function(date) {
		return date.getFullYear() > 0;
	},
	getBeginYear: function() {
		return 1;
	},
	toADYear: function(eraYear) {
		return eraYear;
	},
	format: function(date, captionProperty, yearDelim, monthDelim, dayDelim) {
		if (!date)
			return null;
		captionProperty = captionProperty || "initialChar";
		yearDelim = yearDelim || "/";
		monthDelim = monthDelim || "/"; 
		dayDelim = dayDelim || "";
		return date.getFullYear() + yearDelim + (date.getMonth() + 1) + monthDelim + date.getDate() + dayDelim;
	}
});

DateEraGroup = Class.create();
Object.extend(DateEraGroup, {
	_createDefault: function() {
		DateEraGroup.ALL = new DateEraGroup();
		var userLanguage = navigator.language || navigator.userLanguage || navigator.systemLanguage;
		if (userLanguage && (userLanguage.indexOf("ja") > -1)) {
			DateEra.MEIJI = DateEra.create("明治", "明", "M", "1868/01/01", "1912/07/29");
			DateEra.TAISHO = DateEra.create("大正", "大", "T", "1912/07/30", "1926/12/24");
			DateEra.SHOWA = DateEra.create("昭和", "昭", "S", "1926/12/25", "1989/01/07");
			DateEra.HEISEI = DateEra.create("平成", "平", "H", "1989/01/08", "2050/12/31");
			DateEra.SEIREKI = new DateEra.ADEra("西暦", "西", "AD", "0001/01/01", "2050/12/31");
			//
			DateEraGroup.DEFAULT_WAREKI = new DateEraGroup();
			this._addToEraGroup(DateEraGroup.DEFAULT_WAREKI, [
				DateEra.MEIJI,DateEra.TAISHO,DateEra.SHOWA,DateEra.HEISEI
			]);
			//
			DateEraGroup.DEFAULT_SEIREKI = new DateEraGroup();
			this._addToEraGroup(DateEraGroup.DEFAULT_SEIREKI, [
				DateEra.SEIREKI
			]);
			//
			DateEraGroup.DEFAULT_WAREKI_SEIREKI = new DateEraGroup();
			this._addToEraGroup(DateEraGroup.DEFAULT_WAREKI_SEIREKI, [
				DateEra.MEIJI,DateEra.TAISHO,DateEra.SHOWA,DateEra.HEISEI,DateEra.SEIREKI
			]);
			DateEraGroup.DEFAULT_ja = DateEraGroup.DEFAULT_SEIREKI;
			DateEraGroup.DEFAULT = DateEraGroup.DEFAULT_ja;
			//
			this._addToEraGroup(DateEraGroup.ALL, [
				DateEra.MEIJI,DateEra.TAISHO,DateEra.SHOWA,DateEra.HEISEI,DateEra.SEIREKI
			]);
		}
		DateEra.AD = new DateEra.ADEra("AD", "AD", "AD", "0001/01/01", null);
		DateEraGroup.DEFAULT_en = DateEra.AD;
		if (!DateEraGroup.DEFAULT)
			DateEraGroup.DEFAULT = DateEraGroup.DEFAULT_en;
		this._addToEraGroup(DateEraGroup.ALL, [ DateEra.AD ]);
	},
	
	_addToEraGroup: function(group, eras) {
		for(var i = 0; i < eras.length; i++) {
			group.add(eras[i]);
		}
	}
});
Object.extend(DateEraGroup.prototype, Enumerable);
Object.extend(DateEraGroup.prototype, {
	initialize: function() {this.eras = [];},
	add: function(dateEra) {this.eras.push(dateEra);},
	remove: function(dateEra) {this.eras.remove(dateEra);},
	get: function(index) {return this.eras[index];},
	indexOf: function(era) {return this.eras.indexOf(era);},
	size: function() {return this.eras.length;},
	last: function() {return this.eras[this.eras.length-1];},
	
    _each: function(iterator) {
        for (var i = 0; i < this.eras.length; i++)
            iterator(this.eras[i]);
    },
    
	getEra: function(name) {
		for(var i = 0; i < DateEra.captionProperties.length; i++) {
			var captionProperty = DateEra.captionProperties[i];
			for(var j = 0; j < this.eras.length; j++) {
				var era = this.eras[j];
				if (era[captionProperty] == name)
					return era;
			}
		}
		return null;
	},
	getEraByDate: function(date) {
	    if (!date)
	        return null;
		for(var i = 0; i < this.eras.length; i++) {
			var era = this.eras[i];
			if (era.contains(date))
				return era;
		}
		return null;
	},
	format: function(date) {
	    if (!date)
	        return "";
		for(var i = 0; i < this.eras.length; i++) {
			var era = this.eras[i];
			if (era.contains(date))
				return era.format(date);
		}
		return null;
	},
	getEraOf: function(eraDateStr, captionProperty) {
		captionProperty = captionProperty || DateEra.captionProperties[0];
		for(var i = 0; i < this.eras.length; i++) {
			var era = this.eras[i];
			var propertyValue = era[captionProperty];
			if (eraDateStr.substring(0, propertyValue.length) == propertyValue)
				return era;
		}
		return null;
	},
	parse: function(eraDateStr, yearDelim, monthDelim, dayDelim) {
	    if (!eraDateStr || eraDateStr.strip()=="")
	       return null;
		for(var i = DateEra.captionProperties.length -1; i > -1 ; i--) {
			var captionProperty = DateEra.captionProperties[i];
			var era = this.getEraOf(eraDateStr, captionProperty);
			if (!era)
				continue;
			var eraStr = era[captionProperty];
			var tenmpDateStr = eraDateStr.substring(eraStr.length);
			var d = Date.parseDate(tenmpDateStr, yearDelim, monthDelim, dayDelim);
			
			logger.debug("parse d", d, 2);
			
			return new Date( era.toADYear(d.year), d.month -1, d.date );
		}
		return new Date(eraDateStr);
	}
});

DateEraGroup._createDefault();


Object.extend(Date.prototype, {
	clone: function() {
	    var result = new Date(this.getTime());   
		result.era = this.era;
		return result;
	},
	getEra: function(){return this.era;},
	setEra: function(era){this.era = era;},
	
	setEraAndYear: function(era,year){
		if (!this.era)this.era = DateEra.AD;
		if (this.era){
			var adYear = (era)?era.toADYear(year):year;
			this.setFullYear(adYear);
		}
		this.era = era;
	},

	getEraYear: function() {
		var era = this.getEra();
		return (era)?era.getEraYear(this):this.getFullYear();
	},
	
	setEraYear: function(eraYear) {
		var era = this.getEra();
		if (era) {
			era.setEraYear(this,eraYear);
		} else {
			this.setFullYear(eraYear);
		}
	}
});

