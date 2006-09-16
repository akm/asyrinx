/**
 * calendar.js
 * 
 * require 
 *     prototype.js 
 *     prototype_ext.js
 *     date.js 
 *
 * @author T.Akima
 * @copyright T.Akima
 * @license LGPL
 */

Date.Calendar={};

Date.Calendar.Model = Class.create();
Date.Calendar.Model.prototype = {
	initialize: function(value, eraGroup){
		this.eraGroup = eraGroup || DateEraGroup.DEFAULT;
		this.setValue(value||new Date());
		this.observers = null;
		Object.Aspect.after(this, 
            ["setValue", "setDate", "setMonth", "setEraYear", "setYear", "nextDate"], 
            this.notify.bind(this));
	},
	
	//changing notification
	
	notify: function(){
		if (!this.observers)
			return ;
		for(var i = 0; i < this.observers.length; i++){
			var observer = this.observers[i];
			observer.apply(null,[this]);
		}
	},
	attachEvent: function(observingFunction){
		if (!this.observers)
			this.observers = [];
		this.observers.push(observingFunction);
	},
	detachEvent: function(observingFunction){
		if (!this.observers)
			return;
		this.observers.remove(observingFunction);
	},
	
	getValue: function(){ return this.value; },
	setValue: function(date){
		if (date){
			var newEra = this.eraGroup.getEraByDate(date);
			if (date.getEra()!=newEra)
				date.setEra(newEra);
		}
		this.value = date;
	},
	
	getEra: function(){ return this.value.getEra(); },
	setEra: function(era){ this.value.setEraAndYear(era,this.getEraYear()); },
	
	getEraYear: function(){
		if (this.value){
			if (this.value.getEra()){
				if (this.eraGroup.indexOf( this.value.getEra() ) < 0){
					this.value.setEra( this.eraGroup.last() );
				}
				return this.value.getEraYear();
			} else {
				var lastEra = this.eraGroup.last();
				return lastEra.getEraYear( this.value );
			}
		} else {
			return null;
		}
	},
	setEraYear: function(yy){ this.value.setEraYear(yy); },
	
	getMonth: function(){ return this.value.getMonth() + 1; },
	setMonth: function(mm){ this.value.setMonth(mm - 1); },
	
	getDate: function(){ return this.value.getDate(); },
	setDate: function(dd){ this.value.setDate(dd); },
	
	getYear: function(){ return this.value.getFullYear(); },
	setYear: function(yy){ this.value.setFullYear(yy); },
	
	prevYear: function(value){ this.nextYear( -(value || 1) ); },
	nextYear: function(value){ this.setYear( this.getYear() + (value || 1) ); },
	
	prevMonth: function(value){ this.nextMonth( - (value || 1) ); },
	nextMonth: function(value){ this.setMonth( this.getMonth() + (value || 1) ); },
	
	prevWeek: function(value){ this.nextWeek( -(value || 1) ); },
	nextWeek: function(value){ this.nextDate( 7 * (value || 1) ); },
	
	prevDate: function(value){ this.nextDate( -(value || 1) ); },
	nextDate: function(value){
		var time = Date.msecOfADay * (value || 1);
		var t = (this.value || new Date()).getTime();
		this.setValue(new Date(t + time));
	},
	
	getAsString: function(){ return this.eraGroup.format(this.value); },
	setAsString: function(value){ 
	   if (!value || value.strip() == ""){
	       this.setValue(null);
	   }else{
	       var d = this.eraGroup.parse(value);
    	   this.setValue(d);
	   }
	},
	isValid: function(str){
	   try{
	       var d = this.eraGroup.parse(str);
	       return Date.isValid(d);
	   }catch(ex){
	       return false;
	   }
	}
}

Date.Calendar.MonthlyController = Class.create();
Object.extend(Date.Calendar.MonthlyController, {
	_createDefaultSetting: function() {
		var userLanguage = navigator.language || navigator.userLanguage || navigator.systemLanguage;
		if (userLanguage && (userLanguage.indexOf("ja") > -1)) {
			return {
				_includeWeek: false,
				_firstDayOfWeek: 0, //Monday
				_minimalDaysInFirstWeek: 1,
				_monthNames: [
					"1月",	"2月",	"3月",	"4月",
					"5月",	"6月",	"7月",	"8月",
					"9月",	"10月",	"11月",	"12月"
				],
				_shortMonthNames: [ 
					"1", "2", "3", "4", "5", "6", 
					"7", "8", "9", "10", "11", "12"
				],
				// Week days start with Sunday=0, ... Saturday=6
				_weekDayNames: [ "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"  ],
				_shortWeekDayNames: ["日", "月", "火", "水", "木", "金", "土" ],
				_defaultFormat: "yyyy/MM/dd",
				_format: "yyyy/MM/dd"
			};
		} else {
			return {
				_includeWeek: false,
				_firstDayOfWeek: 1, //Monday
				_minimalDaysInFirstWeek: 4,
				_monthNames: [
					"January",		"February",		"March",	"April",
					"May",			"June",			"July",		"August",
					"September",	"October",		"November",	"December"
				],
				_shortMonthNames: [ 
					"jan", "feb", "mar", "apr", "may", "jun", 
					"jul", "aug", "sep", "oct", "nov", "dec"
				],
				// Week days start with Sunday=0, ... Saturday=6
				_weekDayNames: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"  ],
				_shortWeekDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
				_defaultFormat: "yyyy-MM-dd",
				_format: "yyyy-MM-dd"
			};
		}
	},
	
	// Accumulated days per month, for normal and for leap years.
	// Used in week number calculations.	
	NUM_DAYS: [0,31,59,90,120,151,181,212,243,273,304,334], 
	
	LEAP_NUM_DAYS: [0,31,60,91,121,152,182,213,244,274,305,335],
	
	setCursor: function (obj) {
		if (navigator.appName == "Microsoft Internet Explorer") {
			obj.style.cursor = "hand";
		} else { // is mozilla/netscape
			obj.style.cursor = "pointer";
		}
	},
	
	weekNumber: function(cal, date) {
		var dow = date.getDay();
		var doy = Calendar.dayOfYear(date);
		var year = date.getFullYear();
	
		// Compute the week of the year. Valid week numbers run from 1 to 52
		// or 53, depending on the year, the first day of the week, and the
		// minimal days in the first week. Days at the start of the year may
		// fall into the last week of the previous year; days at the end of
		// the year may fall into the first week of the next year.
		var relDow = (dow + 7 - cal.getFirstDayOfWeek()) % 7; // 0..6
		var relDowJan1 = (dow - doy + 701 - cal.getFirstDayOfWeek()) % 7; // 0..6
		var week = Math.floor((doy - 1 + relDowJan1) / 7); // 0..53
		if ((7 - relDowJan1) >= cal.getMinimalDaysInFirstWeek()) {
			++week;
		}
	
		if (doy > 359) { // Fast check which eliminates most cases
			// Check to see if we are in the last week; if so, we need
			// to handle the case in which we are the first week of the
			// next year.
			var lastDoy = Calendar.getDaysOfYear(year);
			var lastRelDow = (relDow + lastDoy - doy) % 7;
			if (lastRelDow < 0) {
				lastRelDow += 7;
			}
			if (((6 - lastRelDow) >= cal.getMinimalDaysInFirstWeek())
				&& ((doy + 7 - relDow) > lastDoy)) {
				week = 1;
			}
		} else if (week == 0) {
			// We are the last week of the previous year.
			var prevDoy = doy + Date.getDaysOfYear(year - 1);
			week = Calendar.weekOfPeriod(cal, prevDoy, dow);
		}
	
		return week;
	},
	
	weekOfPeriod: function (cal, dayOfPeriod, dayOfWeek) {
		// Determine the day of the week of the first day of the period
		// in question (either a year or a month). Zero represents the
		// first day of the week on this calendar.
		var periodStartDayOfWeek =
			(dayOfWeek - cal.getFirstDayOfWeek() - dayOfPeriod + 1) % 7;
		if (periodStartDayOfWeek < 0) {
			periodStartDayOfWeek += 7;
		}
		// Compute the week number. Initially, ignore the first week, which
		// may be fractional (or may not be). We add periodStartDayOfWeek in
		// order to fill out the first week, if it is fractional.
		var weekNo = Math.floor((dayOfPeriod + periodStartDayOfWeek - 1) / 7);
	
		// If the first week is long enough, then count it. If
		// the minimal days in the first week is one, or if the period start
		// is zero, we always increment weekNo.
		if ((7 - periodStartDayOfWeek) >= cal.getMinimalDaysInFirstWeek()) {
			++weekNo;
		}
		return weekNo;
	}
});
Date.Calendar.MonthlyController.Setting = Date.Calendar.MonthlyController._createDefaultSetting();
Date.Calendar.MonthlyController.prototype = {
	initialize: function( model, calDiv ) {
		this._showing = false;
		this.controlShowing = false;
		this.closeOnClick = false;
		this.closeOnDblClick = true;
		this.closeOnEnterKey = true;
		this.selectedModel = model;
		this.selectedModel.attachEvent( this._selectedModelOnChange.bindAsEventListener(this) );
		//this.eraGroup = this.selectedModel.eraGroup || DateEraGroup.DEFAULT;
		this._currentModel = new Date.Calendar.Model( this.selectedModel.getValue() || new Date(), model.eraGroup || DateEraGroup.DEFAULT );
		this._currentModel.attachEvent( this._currentModelOnChange.bindAsEventListener(this) );
		for(var prop in Date.Calendar.MonthlyController.Setting) {
			this[prop] = Date.Calendar.MonthlyController.Setting[prop];
		}
		this._dateSlot = new Array(42);
		this._weekSlot = new Array(6);
		//
		this._calDiv = calDiv || this.createCalendarDiv();
		this._createContents();
	},
	
	_currentModelOnChange: function( model ) {
		this._updateBody();
		this._updateHeader( this._currentModel );
	},
	
	_selectedModelOnChange: function( model ) {
		var selectedValue = this.selectedModel.getValue();
		if (!selectedValue)
			return;
		if (this._currentModel.getYear() == this.selectedModel.getYear() && 
			this._currentModel.getMonth() == this.selectedModel.getMonth() ) {
			this._updateBody();
			this._updateHeader( this.selectedModel );
		} else {
			this._currentModel.setValue( selectedValue );
		}
	},
	
	getCurrentDate: function() {
		return this._currentModel.getValue();
	},
	
	isShowing: function() {
		return this._showing;
	},
	
	getEraGroup: function() {
		return this.selectedModel.eraGroup || DateEraGroup.DEFAULT;
	},
	
	_updateHeader: function ( model ) {
		model = model || this._currentModel;
		if (!this._calDiv)
			return ;
		var eraIndex = this.getEraGroup().indexOf( model.getEra() );
		Form.Element.setValue(this._eraSelect, eraIndex);
		var ey = model.getEraYear();
		this._yearSelect.value = ey;
		var m = model.getMonth();
		Form.Element.setValue(this._monthSelect, m);
	},

	_updateBody: function() {
		if (!this._calDiv)
			return ;
		// Calculate the number of days in the month for the selected date
		var date = this.getCurrentDate();
		if (!date)
			date = new Date();
		var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
		var monthLength = Date.getDaysOfMonth(date.getFullYear(), date.getMonth());
		// Find out the weekDay index for the first of this month
		var firstIndex = (firstDayOfMonth.getDay() - this._firstDayOfWeek) % 7 ;
		if (firstIndex < 0) 
			firstIndex += 7;
		var index = 0;
		while (index < firstIndex) {
			this._dateSlot[index].value = -1;
			this._dateSlot[index].data.data = String.fromCharCode(160);
			this._dateSlot[index].data.parentNode.className = "";
			this._dateSlot[index].data.parentNode.style.fontWeight = "normal";
			this._dateSlot[index].data.parentNode.style.border= "none";
			index++;
		}
		var today = (new Date()).toISODate();
		var current = date.toISODate();
		var selected = (this.selectedModel.getValue()) ? this.selectedModel.getValue().toISODate() : "";
		for (i = 1; i <= monthLength; i++, index++) {
			var firstDayOfMonthIsoDate = firstDayOfMonth.toISODate();
			this._dateSlot[index].value = i;
			this._dateSlot[index].data.data = i;
			this._dateSlot[index].data.parentNode.className = "";
			this._dateSlot[index].data.parentNode.style.fontWeight = "normal";
			this._dateSlot[index].data.parentNode.style.border= "none";
			if (firstDayOfMonthIsoDate == today) {
				this._dateSlot[index].data.parentNode.className = "today";
				this._dateSlot[index].data.parentNode.style.fontWeight = "bold";
			}
			if (firstDayOfMonthIsoDate == current) {
				this._dateSlot[index].data.parentNode.className += " current";
				this._dateSlot[index].data.parentNode.style.border= "1px dotted WindowText";
			}
			if (firstDayOfMonthIsoDate == selected) {
				this._dateSlot[index].data.parentNode.className += " selected";
				this._dateSlot[index].data.parentNode.style.border= "1px solid WindowText";
			}
			firstDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate()+1);
		}
		var lastDateIndex = index;
		while(index < 42) { //42 days means 6 weeks
			this._dateSlot[index].value = -1;
			this._dateSlot[index].data.data = String.fromCharCode(160);
			this._dateSlot[index].data.parentNode.className = "";
			this._dateSlot[index].data.parentNode.style.fontWeight = "normal";
			this._dateSlot[index].data.parentNode.style.border= "none";
			++index;
		}
		// Week numbers
		if (this._includeWeek) {
			firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
			for (i=0; i < 6; ++i) {
				if (i == 5 && lastDateIndex < 36) {
					this._weekSlot[i].data.data = String.fromCharCode(160);
					this._weekSlot[i].data.parentNode.style.borderRight = "none";
				} else {
					week = Calendar.weekNumber(this, firstDayOfMonth);
					this._weekSlot[i].data.data = week;
					this._weekSlot[i].data.parentNode.style.borderRight = "1px solid WindowText";
				}
				firstDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate()+7);
			}
		}
	},
	
	_getSelectedEra: function() {
		var selectedEraIndex = this._eraSelect.value;
		if (selectedEraIndex < 0)
			return null;
		return this.getEraGroup().get(selectedEraIndex);
	},
	
	_previousMonth_onclick: function () {
		this._currentModel.prevMonth();
	},

	_nextMonth_onclick: function () {
		this._currentModel.nextMonth();
	},

	_todayButton_onclick: function () {
		this.selectedModel.setValue(new Date());
		//this.hide();
	},

	_clearButton_onclick: function () {
		this.selectedModel.setValue(null);
		//this.hide();
	},

	_calDiv_onselectstart: function (event) {
		var t = Event.element(event);
		if (t == this._yearSelect) {
			return true;
		} else {
			Event.stop(event);
			return false;
		}
	},
	
	_select_onClickTable: function( e ) {
		var t = Event.element(e);
		var td = Element.findAncestorByTagName(t, "TD");
		if (!td)
			return;
		var date = this.getCurrentDate();
		if (!date)
			date = new Date();
		var d = new Date( date.getTime() );
		var n = Number(td.firstChild.data);
		if (isNaN(n) || n <= 0 || n == null)
			return;
		if (td.className == "weekNumber")
			return;
		d.setDate(n);
		this.selectedModel.setValue(d);
		this._currentModel.setValue(d);
		if (!this._alwaysVisible && this._hideOnSelect) {
			this.hide();
			Event.stop(e);
		}
	},
	
	_table_onclick: function (e) {
		this._select_onClickTable( e );
		if (this.closeOnClick)
			this.hide();
	},
	
	_table_ondblclick: function (e) {
		this._select_onClickTable( e );
		if (this.closeOnDblClick)
			this.hide();
	},
	
	_calDiv_onkeydown: function (e) {
		if (e == null) 
			e = document.parentWindow.event;
		var keyCode = e.keyCode != null ? e.keyCode : e.charCode;
		if(keyCode == Event.KEY_RETURN || keyCode == Event.KEY_ENTER) {
			//var d = new Date(this.getCurrentDate()).valueOf();
			this.selectedModel.setValue(this.getCurrentDate());
			if (this.closeOnEnterKey) 
				this.hide();
			Event.stop(e);
			return false;
		}
		var t = Event.element(e);
		if ((t.tagName == "SELECT") || (t.tagName == "INPUT" && t.type == "text") )
			return true;
		switch (keyCode) {
			case Event.KEY_LEFT: 
				this._currentModel.prevDate();
				break;
			case Event.KEY_RIGHT: 
				this._currentModel.nextDate();
				break;
			case Event.KEY_UP: 
				this._currentModel.prevWeek();
				break;
			case Event.KEY_DOWN: 
				this._currentModel.nextWeek();
				break;
			default:
				return true;
		}
		Event.stop(e);
		return false;
	},
	
	// ie6 extension
	_calDiv_onmousewheel: function (e) {
		if (e == null) 
			e = document.parentWindow.event;
		var n = - e.wheelDelta / 120;
		var d = new Date(this.getCurrentDate());
		var m = d.getMonth() + n;
		d.setMonth(m);
		this.setCurrentDate(d);
		Event.stop(e);
		return false;
	},
	
	_monthSelect_onchange: function(e) {
		this._currentModel.setMonth(this._monthSelect.value);
	},

	_monthSelect_onclick: function(e) {
		Event.stop(e);
	},
	
	_yearSelect_onkeyup: function(e) {
		if ((!this._yearSelect.value) || (this._yearSelect.value == "NaN") || (this._yearSelect.value == "null")) {
			//this.setYear( (new Date()).getFullYear() );
		} else {
			var inputYear = this._yearSelect.value * 1;
			if (!inputYear)
				return;
			this._currentModel.setEraYear(inputYear);
		}
	},
	
	_eraSelect_onchange: function(e) {
		var era = this._getSelectedEra();
		this._currentModel.setEra( era );
	},
	
	createCalendarDiv: function() {
		// Create the top-level div element
		this._calDiv = document.createElement("div");
		this._calDiv.className = "calendar";
		this._calDiv.style.position = "absolute";
		this._calDiv.style.display = "none";
		this._calDiv.style.border = "1px solid WindowText";
		this._calDiv.style.textAlign = "center";
		this._calDiv.style.background = "Window";
		this._calDiv.style.zIndex = "400";
		document.body.appendChild(this._calDiv);
		this.controlShowing = true;
		return this._calDiv;
	},
	
	_createContents: function() {
		// Create header div
		this._createHeaderDiv();
		// Create the inside of calendar body
		this._createBodyDiv();
		// Calendar Footer
		this._createFooterDiv();
		this._updateBody();
		this._updateHeader( this._currentModel );
		// IE55+ extension	
		this._previousMonth.hideFocus = true;
		this._nextMonth.hideFocus = true;
		this._todayButton.hideFocus = true;
		// observe events
		Event.observe(this._previousMonth, "click", this._previousMonth_onclick.bindAsEventListener(this), false);
		Event.observe(this._nextMonth, "click", this._nextMonth_onclick.bindAsEventListener(this), false);
		Event.observe(this._todayButton, "click", this._todayButton_onclick.bindAsEventListener(this), false);
		Event.observe(this._clearButton, "click", this._clearButton_onclick.bindAsEventListener(this), false);
		Event.observe(this._calDiv, "selectstart", this._calDiv_onselectstart.bindAsEventListener(this), false);
		Event.observe(this._table, "click", this._table_onclick.bindAsEventListener(this), false);
		Event.observe(this._table, "dblclick", this._table_ondblclick.bindAsEventListener(this), false);
		Event.observe(this._calDiv, "keydown", this._calDiv_onkeydown.bindAsEventListener(this), false);
		Event.observe(this._calDiv, "mousewheel", this._calDiv_onmousewheel.bindAsEventListener(this), false);
		Event.observe(this._monthSelect, "change", this._monthSelect_onchange.bindAsEventListener(this), false);
		Event.observe(this._monthSelect, "click", this._monthSelect_onclick.bindAsEventListener(this), false);
		Event.observe(this._eraSelect, "change", this._eraSelect_onchange.bindAsEventListener(this), false);
		Event.observe(this._yearSelect, "keyup", this._yearSelect_onkeyup.bindAsEventListener(this), true);
	},
	
	_createHeaderDiv: function() {
		var div = document.createElement("div");
		div.className = "calendarHeader";
		div.style.background = "ActiveCaption";
		//div.style.padding = "3px";
		div.style.padding = "0px";
		div.style.borderBottom = "1px solid WindowText";
		this._calDiv.appendChild(div);
		var table = document.createElement("table");
		table.border = 0;
		table.style.cellSpacing = 0;
		div.appendChild(table);
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		//header row 1
		var tr = document.createElement("tr");
		tbody.appendChild(tr);
		// Create the era drop down
		var td = document.createElement("td");
		td.className = "labelContainer";
		td.colSpan = 2;
		td.align = "right";
		tr.appendChild(td);
		this._eraSelect = document.createElement("select");
		var eraGroup = this.getEraGroup();
		for(var i=0; i < eraGroup.size(); ++i) {
			var era = eraGroup.get(i);
			var opt = document.createElement("option");
			opt.innerHTML = era["longName"];
			opt.value = i; //eraIndex
			opt.selected = (i == eraGroup.size() -1);
			this._eraSelect.appendChild(opt);
		}
		td.appendChild(this._eraSelect);
		// Create the year text input
		td = document.createElement("td");
		td.className = "labelContainer";
		td.colSpan = 2;
		td.align = "left";
		tr.appendChild(td);
		this._yearSelect = document.createElement("input");
		this._yearSelect.value = this.getCurrentDate().getFullYear();
		this._yearSelect.size = 4;
		td.appendChild(this._yearSelect);
		//header row 2
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		// Previous Month Button
		td = document.createElement("td");
		td.align = "right";
		this._previousMonth = document.createElement("button");
		this._previousMonth.className = "prevMonthButton"
		this._previousMonth.appendChild(document.createTextNode("<<"));
		//this._previousMonth.appendChild(document.createTextNode(String.fromCharCode(9668)));
		td.appendChild(this._previousMonth);
		tr.appendChild(td);
		// Create the month drop down 
		td = document.createElement("td");
		td.className = "labelContainer";
		td.colSpan = 2;
		td.align = "center";
		tr.appendChild(td);
		this._monthSelect = document.createElement("select");
		for (var i = 0 ; i < this._monthNames.length ; i++) {
			var opt = document.createElement("option");
			opt.innerHTML = this._monthNames[i];
			opt.value = i +1; //??1????
			if (i == this.getCurrentDate().getMonth()) {
				opt.selected = true;
			}
			this._monthSelect.appendChild(opt);
		}
		td.appendChild(this._monthSelect);
		td = document.createElement("td");
		td.align = "left";
		this._nextMonth = document.createElement("button");
		this._nextMonth.appendChild(document.createTextNode(">>"));
		//this._nextMonth.appendChild(document.createTextNode(String.fromCharCode(9654)));
		this._nextMonth.className = "nextMonthButton";
		td.appendChild(this._nextMonth);
		tr.appendChild(td);
	},
	
	_createBodyDiv: function() {
		// Calendar body
		var div = document.createElement("div");
		div.className = "calendarBody";
		this._calDiv.appendChild(div);
		this._table = div;
		var table = document.createElement("table");
		//table.style.width="100%";
		table.className = "grid";
		table.style.font 	 	= "small-caption";
		table.style.fontWeight 	= "normal";
		table.style.textAalign	= "center";
		table.style.color		= "WindowText";
		table.style.cursor		= "default";
		table.cellPadding		= "3";
		table.cellSpacing		= "0";
		div.appendChild(table);
		var thead = document.createElement("thead");
		table.appendChild(thead);
		var tr = document.createElement("tr");
		thead.appendChild(tr);
		// weekdays header
		if (this._includeWeek) {
			var td = document.createElement("th");
			var text = document.createTextNode("w");
			td.appendChild(text);
			td.className = "weekNumberHead";
			td.style.textAlign = "left";
			tr.appendChild(td);
		}
		for(i=0; i < 7; ++i) {
			var td = document.createElement("th");
			var text = document.createTextNode(this._shortWeekDayNames[(i+this._firstDayOfWeek)%7]);
			td.appendChild(text);
			td.className = "weekDayHead";
			td.style.fontWeight = "bold";
			td.style.borderBottom = "1px solid WindowText";
			tr.appendChild(td);
		}
		// Date grid
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		for(week=0; week<6; ++week) {
			var tr = document.createElement("tr");
			tbody.appendChild(tr);
			if (this._includeWeek) {
				var td = document.createElement("td");
				td.className = "weekNumber";
				td.style.fontWeight = "normal";
				td.style.borderRight = "1px solid WindowText";
				td.style.textAlign = "left";
				var text = document.createTextNode(String.fromCharCode(160));
				td.appendChild(text);
				//Date.Calendar.MonthlyController.setCursor(td);
				td.align="center";
				tr.appendChild(td);
				var tmp = new Object();
				tmp.tag = "WEEK";
				tmp.value = -1;
				tmp.data = text;
				this._weekSlot[week] = tmp;
			}
			for(day=0; day<7; ++day) {
				var td = document.createElement("td");
				var text = document.createTextNode(String.fromCharCode(160));
				td.appendChild(text);
				Date.Calendar.MonthlyController.setCursor(td);
				td.align="center";
				td.style.fontWeight="normal";
				
				tr.appendChild(td);
				var tmp = new Object();
				tmp.tag = "DATE";
				tmp.value = -1;
				tmp.data = text;
				this._dateSlot[(week*7)+day] = tmp;
			}
		}
	},
	
	_createFooterDiv: function() {
		var div = document.createElement("div");
		div.className = "calendarFooter";
		this._calDiv.appendChild(div);
		var table = document.createElement("table");
		//table.style.width="100%";
		table.className = "footerTable";
		table.cellSpacing = 0;
		div.appendChild(table);
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		var tr = document.createElement("tr");
		tbody.appendChild(tr);
		// The TODAY button	
		var td = document.createElement("td");
		this._todayButton = document.createElement("button");
		var today = new Date();
		//var buttonText =  today.getDate() + " " + this._monthNames[today.getMonth()] + ", " + today.getFullYear();
		var buttonText = today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate();
		this._todayButton.appendChild(document.createTextNode(buttonText));
		td.appendChild(this._todayButton);
		tr.appendChild(td);
		// The CLEAR button
		var td = document.createElement("td");
		this._clearButton = document.createElement("button");
		var today = new Date();
		this._clearButton.appendChild(document.createTextNode("Clear"));
		td.appendChild(this._clearButton);
		tr.appendChild(td);
	},

	getMinimalDaysInFirstWeek: function () {
		return this._minimalDaysInFirstWeek;
	},

	getFirstDayOfWeek: function () {
		return this._firstDayOfWeek;
	},
	
	_getShim: function() {
		if (!this._shim) {
			this._shim = new HTMLIFrameElement.Shim(this._calDiv);
		}
		return this._shim;
	},

	isShowing: function() {
		return this._showing;
	},
	
	show: function(x, y) {
		if (!this.controlShowing)
			return;
		if(this._showing) 
			return;
		this._calDiv.style.display = "block";
		this._calDiv.style.top = y + "px";
		this._calDiv.style.left = x + "px";
		this._getShim().enableShim();
		this._showing = true;
		if (this._calDiv.focus)
			this._calDiv.focus();
		if (this.onshow)
			this.onshow();
	},

	hide: function() {
		if (!this.controlShowing)
			return;
		if(!this._showing) 
			return;
		this._calDiv.style.display = "none";
		this._getShim().disableShim();
		this._showing = false;
		if (this.onhide)
			this.onhide();
	}
	
}

Date.Calendar.MonthlyFieldController = Class.create();
Date.Calendar.MonthlyFieldController.prototype = {
	initialize: function(field, eraGroup, model, calendarControl) {
		this.eventInitialized = false;
		this.showOnFocusIfEmpty = true;
		this.showOnFocus = false;
		this.focusFieldOnHide = true;
		this.field = field;
		this.eraGroup = eraGroup;
		this.model = model;
		this._attachModel();
		this.calendarControl = calendarControl;
		Event.observe(this.field, "focus", this._fieldFocused.bindAsEventListener(this), false);
	},
	
	_attachModel: function() {
		if (!this.model) 
			return;
		this.model.attachEvent( this._modelOnChange.bindAsEventListener(this) );
		this._modelOnChange( this.model );
	},

	updateModel: function() {
		var fieldDate = (this.field.value) ? this.getEraGroup().parse( this.field.value ) : null;
		this.model.setValue( fieldDate );
	},
	
	updateField: function() {
		var d = this.model.getValue();
		this.field.value = (d) ? this.getEraGroup().format( d ) : "";
	},
	
	getEraGroup: function() {
		return this.eraGroup || DateEraGroup.DEFAULT;
	},

	initializeEventListeners: function() {
		if (!this.model) {
			var fieldDate = (this.field.value) ? this.getEraGroup().parse( this.field.value ) : null;
			this.model = new Date.Calendar.Model(fieldDate, this.getEraGroup());
			this._attachModel();
		}
		if (!this.calendarControl) {
			this.calendarControl = new Date.Calendar.MonthlyController(this.model, null);
			this.calendarControl.onhide = this._calendarHide.bindAsEventListener(this);
		}
		Event.observe(this.field, "change", this._fieldChange.bindAsEventListener(this), false);
		Event.observe(this.field, "keydown", this._fieldKeyDown.bindAsEventListener(this), true);
		Event.observe(this.field, "dblclick", this._fieldDblClicked.bindAsEventListener(this), false);
		Event.observe(document, "click", this._documentClick.bindAsEventListener(this), false);
		this.eventInitialized = true;
	},
	
	_calendarHide: function() {
		if (!this.focusFieldOnHide)
			return;
		// onfocusイベントは、focusメソッドを呼び出した直後ではなく、
		// このイベントハンドラを抜けた後に実行されるので、try...finallyではなく
		// setTimoutでフォーカスが移った後（のはず）に、calendarHidingをfalseに戻す
		this.calendarHiding = true;
		this.field.focus();
		setTimeout(this._finishCalendarHiding.bind(this), 100);
	},
	
	_finishCalendarHiding: function() {
		this.calendarHiding = false;
	},
	
	_fieldFocused: function(event) {
		if (this.calendarHiding)
			return;
		if (!this.eventInitialized) {
			this.initializeEventListeners();
			this.updateModel();
		}
		if (!this.showOnFocus && !(this.showOnFocusIfEmpty && !(this.field.value)))
			return;
		
		this.showCalendar();
	},
	
	_modelOnChange: function( model ) {
		this.updateField();
	},
	
	_fieldChange: function(event) {
		this.updateModel();
	},
	
	_fieldKeyDown: function(event) {
		var keyCode = Event.getKeyCode(event);
		switch(keyCode) {
			case Event.KEY_SPACE:
				if (event.ctrlKey) {
					this.toggleCalendar();
					Event.stop(event);
					return false;
				}
			default:
				return true;
		}
	},
	
	_fieldDblClicked: function(event) {
		this.toggleCalendar();
	},
	
	_documentClick: function( event ) {
		var t = Event.element(event);
		if (t == this.field)
			return;
		if (!this.calendarControl.isShowing() )
			return;
		if (Element.childOf(t, this.calendarControl._calDiv))
			return;
		this.hideCalendar();
	},
	
	showCalendar: function() {
		var p = Position.positionedOffset(this.field);
		this.calendarControl.show(p[0], p[1] + this.field.offsetHeight + 1);
	},
	
	hideCalendar: function() {
		this.calendarControl.hide();
	},
	
	toggleCalendar: function() {
		if (this.calendarControl.isShowing())
			this.hideCalendar();
		else
			this.showCalendar();
	}
	
}
