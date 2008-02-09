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


Date.Era = Class.create();
Object.extend(Date.Era, {
	create: function(longName, shortName, initialChar, beginDateStr, endDateStr) {
		var beginDate = beginDateStr ? (new Date(beginDateStr)).toBeginOfDate() : null;
		var endDate = endDateStr ? (new Date(endDateStr)).toEndOfDate() : null;
		var range = new ObjectRange(beginDate, endDate);
		return new Date.Era(longName, shortName, initialChar, range);
	},
	captionProperties: ["initialChar", "shortName", "longName"]
});
Date.Era.prototype = {
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
Date.Era.ADEra = Class.create();
Object.extend(Date.Era.ADEra.prototype, Date.Era.prototype);
Object.extend(Date.Era.ADEra.prototype, {
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

Date.EraGroup = Class.create();
Object.extend(Date.EraGroup.prototype, Enumerable);
Object.extend(Date.EraGroup.prototype, {
	initialize: function() {this.eras = [];},
	add: function() {
		for(var i = 0; i< arguments.length; i++){
			this.eras.push(arguments[i]);
		}
	},
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
		for(var i = 0; i < Date.Era.captionProperties.length; i++) {
			var captionProperty = Date.Era.captionProperties[i];
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
		captionProperty = captionProperty || Date.Era.captionProperties[0];
		for(var i = 0; i < this.eras.length; i++) {
			var era = this.eras[i];
			var propertyValue = era[captionProperty];
			if (propertyValue && eraDateStr.substring(0, propertyValue.length) == propertyValue)
				return era;
		}
		return null;
	},
	parse: function(eraDateStr, yearDelim, monthDelim, dayDelim) {
	    if (!eraDateStr || eraDateStr.strip()=="")
	       return null;
		for(var i = Date.Era.captionProperties.length -1; i > -1 ; i--) {
			var captionProperty = Date.Era.captionProperties[i];
			var era = this.getEraOf(eraDateStr, captionProperty);
			if (!era)
				continue;
			var eraStr = era[captionProperty];
			var tenmpDateStr = eraDateStr.substring(eraStr.length);
			var d = Date.parseDate(tenmpDateStr, yearDelim, monthDelim, dayDelim);
			return new Date( era.toADYear(d.year), d.month -1, d.date );
		}
		return new Date(eraDateStr);
	},
	
	updateEraAndYear: function(date){
	   var era = this.getEraByDate(date);
	   if (!era)
	       return;
	   date.setEraAndYear(era,era.getEraYear(date));
	}
});
Date.EraGroup.DEFAULT = new Date.EraGroup();
Date.EraGroup.DEFAULT.add(new Date.Era.ADEra());


Object.extend(Date.prototype, {
	clone: function() {
	    var result = new Date(this.getTime());   
		result.era = this.era;
		return result;
	},
	getEra: function(){return this.era;},
	setEra: function(era){this.era = era;},
	
	setEraAndYear: function(era,year){
		if (!this.era)this.era = Date.Era.AD;
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

