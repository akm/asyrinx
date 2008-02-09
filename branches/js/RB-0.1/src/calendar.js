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
  	this.eraGroup = eraGroup || Date.EraGroup.DEFAULT;
		this.setValue(value||new Date());
		this.observers = null;
		Object.Aspect.after(this, 
            ["setValue", "setDate", "setMonth", "setEraYear", "setYear", "setEra", "nextDate"], 
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
		this.value = date;
  	    this.eraGroup.updateEraAndYear(this.value);
	},
	
	getEra: function(){return (this.value)?this.value.getEra():null;},
	setEra: function(era){
	   if (!this.value) this.value = new Date();
	   this.value.setEraAndYear(era,this.getEraYear());
	},
	
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
	setEraYear: function(yy){ 
	    if (!this.value) this.value = new Date();
	    this.value.setEraYear(yy);
	},
	
	getMonth: function(){ return (this.value)?(this.value.getMonth() + 1):null; },
	setMonth: function(mm){
	    if (!this.value) this.value = new Date();
	    this.value.setMonth(mm - 1); 
	    this.eraGroup.updateEraAndYear(this.value);
	},
	
	getDate: function(){ return (this.value)?this.value.getDate():null; },
	setDate: function(dd){
	    if (!this.value) this.value = new Date();
	    this.value.setDate(dd); 
	    this.eraGroup.updateEraAndYear(this.value);
	},
	
	getYear: function(){ return (this.value)?this.value.getFullYear():null; },
	setYear: function(yy){
	    if (!this.value) this.value = new Date();
	    this.value.setFullYear(yy);
	    this.eraGroup.updateEraAndYear(this.value);
	},
	
	prevYear: function(value){ this.nextYear( -(value || 1) ); },
	nextYear: function(value){ 
	    this.setYear( (this.getYear()||(new Date()).getFullYear()) + (value || 1) );
	},
	
	prevMonth: function(value){ this.nextMonth( - (value || 1) ); },
	nextMonth: function(value){ 
	    this.setMonth( (this.getMonth()||(new Date()).getMonth()+1) + (value || 1) ); 
    },
	
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

Date.Calendar.KeyController = Class.create();
Date.Calendar.KeyController.DefaultOptions = {
    activateSoon: true
};
Date.Calendar.KeyController.Methods = {
    initialize: function(field, model, options) {
        this.field = $(field);
        this.model = model;
        this.options = Object.extend({}, Date.Calendar.KeyController.DefaultOptions);
        this.options = Object.extend(this.options, options||{});
        this.model.attachEvent(this.modelChanged.bind(this));
        if (this.options.activateSoon)
            this.activate();
    },
    
    prevDate : function(event){ this.model.prevDate(); }, 
    nextDate : function(event){ this.model.nextDate(); }, 
    prevWeek : function(event){ this.model.prevWeek(); }, 
    nextWeek : function(event){ this.model.nextWeek(); }, 
    prevMonth: function(event){ this.model.prevMonth(); }, 
    nextMonth: function(event){ this.model.nextMonth(); }, 
    prevYear : function(event){ this.model.prevYear(); }, 
    nextYear : function(event){ this.model.nextYear(); },
    
    activate: function() {
        if (this.keyHandler) {
            this.keyHandler.activate();
            return;
        }
        this.keyHandler = new Event.KeyHandler(this.field, this.getActions());
    },
    
    getActions: function() {
        var actions = [
            {shift: false, key: Event.KEY_LEFT , method: this.prevDate.bindAsEventListener(this) },
            {shift: false, key: Event.KEY_RIGHT, method: this.nextDate.bindAsEventListener(this) },
            {shift: false, key: Event.KEY_UP   , method: this.prevWeek.bindAsEventListener(this) },
            {shift: false, key: Event.KEY_DOWN , method: this.nextWeek.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_LEFT , method: this.prevMonth.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_RIGHT, method: this.nextMonth.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_UP   , method: this.prevYear.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_DOWN , method: this.nextYear.bindAsEventListener(this) },
            {matchAll: true, method: this.keyup.bindAsEventListener(this), stopEvent: false }
        ];
        actions.each(function(action){
            action.event = "keydown";
            action.ctrl = true;
            // action.shift = false;
            action.alt = false;
        });
        return actions;
    },
    
    deactivate: function() {
        if (this.keyHandler)
            this.keyHandler.deactivate();
    },
    
    keyup: function(){
        if (this.lastUpdateModelId){
            clearTimeout(this.lastUpdateModelId);
            this.lastUpdateModelId = null;
        }
        this.lastUpdateModelId = setTimeout(this.updateModel.bind(this), 500);
    },
    
    updateModel: function() {
        this.lastUpdateModelId = null;
        var str = this.field.value;
        if (this.model.isValid(str))
            this.model.setAsString(str);
    },
    
    modelChanged: function() {
        var s = this.model.getAsString();
        if (this.field.value != s)
            this.field.value = s;
    }
};
Object.extend(Date.Calendar.KeyController.prototype, Date.Calendar.KeyController.Methods);


Date.Calendar.DefaultOptions = {
	ja: {
	    MonthNames: [
	        "1月","2月","3月","4月","5月","6月",
	        "7月","8月","9月","10月","11月","12月"],
	    shortMonthNames: [
	        "1","2","3","4","5","6","7","8","9","10","11","12"],
		WeekDayNames: [ "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"  ],
		ShortWeekDayNames: ["日", "月", "火", "水", "木", "金", "土" ],
	    firstDayOfWeek: 0, //Sunday
		minimalDaysInFirstWeek: 1,
		clearButtonCaption:"クリア"
	},
	en: {
	    MonthNames: [
			"January", "February", "March",     "April"  , "May"     , "June",
			"July",	   "August",   "September",	"October", "November",	"December"],
	    shortMonthNames: [
	    	"jan", "feb", "mar", "apr", "may", "jun", 
	    	"jul", "aug", "sep", "oct", "nov", "dec"],
		WeekDayNames: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
		ShortWeekDayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	    firstDayOfWeek: 0, //Monday
		minimalDaysInFirstWeek: 4,
		clearButtonCaption:"clear"
	}
};

Date.Calendar.View = Class.create();
Date.Calendar.View.DefaultOptions = {
    weekColVisible: false
};
Object.extend(Date.Calendar.View.DefaultOptions,
    (/ja/.test(navigator.language||navigator.userLanguage||navigator.systemLanguage||"en"))?
        Date.Calendar.DefaultOptions.ja : Date.Calendar.DefaultOptions.en
);

Object.extend(Date.Calendar.View, {
	weekNumber: function(view, date) {
		var dow = date.getDay();
		var doy = Calendar.dayOfYear(date);
		var year = date.getFullYear();
	
		// Compute the week of the year. Valid week numbers run from 1 to 52
		// or 53, depending on the year, the first day of the week, and the
		// minimal days in the first week. Days at the start of the year may
		// fall into the last week of the previous year; days at the end of
		// the year may fall into the first week of the next year.
		var relDow = (dow + 7 - view.options.firstDayOfWeek) % 7; // 0..6
		var relDowJan1 = (dow - doy + 701 - view.options.firstDayOfWeek) % 7; // 0..6
		var week = Math.floor((doy - 1 + relDowJan1) / 7); // 0..53
		if ((7 - relDowJan1) >= view.options.minimalDaysInFirstWeek) {
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
			if (((6 - lastRelDow) >= view.minimalDaysInFirstWeek)
				&& ((doy + 7 - relDow) > lastDoy)) {
				week = 1;
			}
		} else if (week == 0) {
			// We are the last week of the previous year.
			var prevDoy = doy + Date.getDaysOfYear(year - 1);
			week = Calendar.weekOfPeriod(view, prevDoy, dow);
		}
		return week;
	},
	
	weekOfPeriod: function (view, dayOfPeriod, dayOfWeek) {
		// Determine the day of the week of the first day of the period
		// in question (either a year or a month). Zero represents the
		// first day of the week on this calendar.
		var periodStartDayOfWeek =
			(dayOfWeek - view.firstDayOfWeek - dayOfPeriod + 1) % 7;
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
		if ((7 - periodStartDayOfWeek) >= view.minimalDaysInFirstWeek) {
			++weekNo;
		}
		return weekNo;
	}
});


Date.Calendar.View.prototype = {
    initialize: function(element, options){
        this.element = element;
        this.options = Object.extend({}, Date.Calendar.View.DefaultOptions);
        this.options = Object.extend(this.options, options||{});
        this.model = this.options["model"]||new Date.Calendar.Model();
        this.eraGroup = this.model["eraGroup"]||this.options["eraGroup"]||Date.EraGroup.DEFAULT_WAREKI;
        this.build();
    },
    build: function(){
		this.createHeader(this.element);
		this.createBody(this.element);
		this.createFooter(this.element);
		//
		this.update();
		if (!this.modelOnChangeHandler)
		    this.modelOnChangeHandler = this.modelOnChange.bind(this);
		this.model.attachEvent(this.modelOnChangeHandler);
    },
	
	modelOnChange: function() {
    	this.update();
	},
	
	switchModel: function(newModel){
	    if (this.model == newModel)
	        return;
	    if (this.modelOnChangeHandler)
	        this.model.detachEvent(this.modelOnChangeHandler);
	    this.model = newModel;
		if (!this.modelOnChangeHandler)
		    this.modelOnChangeHandler = this.modelOnChange.bind(this);
	    this.model.attachEvent(this.modelOnChangeHandler);
	},
	
	update: function(){
	    if (this.updating)
	        return;
	    this.updating = true;
	    try{
    		this.updateBody();
    		this.updateHeader();
	    }finally{
    	    this.updating = false;
	    }
	},
	
	createHeader: function(parentNode) {
     var eraSelect = 
       (this.eraGroup.size() < 2) ? null :
         {tagName:"select", className:"era", body: 
             this.eraGroup.collect(function(era, index){
                 return {
                     tagName:"option", value:index, body: era["longName"], 
                     selected:(index == this.eraGroup.size() -1)
                 };
             }.bind(this)),
             afterBuild: function(element){ this.eraSelection = element; }.bind(this)
         };
     var yearField = 
         {tagName:"input", className: "year", value: this.model.getYear(), size:4,
             afterBuild: function(element){ this.yearField = element; }.bind(this)
         };
     
     return Element.build({
	       tagName:"div", className:"calendarHeader",
	       body: [
	           {tagName:"table", boder:0, cellSpacing:0, body:
	               {tagName:"tbody", body:[
                     (
                       eraSelect ? 
                         {tagName:"tr", body:[
                             {tagName:"td", className:"labelContainer", colSpan: 2, align:"center", body: eraSelect},
                             {tagName:"td", className:"labelContainer", colSpan: 2, align:"center", body: yearField}
                         ]} : null
                     ),
	                   {tagName:"tr", body:[
    	                   {tagName:"td", align:"right", body:
        	                   {tagName:"button", className:"prevMonth", body:"<<",
        	                       afterBuild:function(element){ this.prevMonthButton = element; }.bind(this)
            	               }
        	               },
                         (eraSelect ? null :
                            {tagName:"td", className:"labelContainer", align:"center", body: yearField}
    	                   ),
                         {tagName:"td", className:"labelContainer", colSpan:2, align:"center", body:
        	                   {tagName:"select", className:"month", body:
    	                           this.options.MonthNames.collect(function(monthName, index){
    	                               return {
    	                                   tagName:"option", value:index+1, body: monthName, 
    	                                   selected:(index == this.model.getMonth())
    	                               };
    	                           }.bind(this)),
        	                       afterBuild: function(element){ this.monthSelection = element; }.bind(this)
            	               }
        	               },
                         {tagName:"td", align:"left", body:
        	                   {tagName:"button", className:"nextMonth", body:">>",
        	                       afterBuild: function(element){ this.nextMonthButton = element; }.bind(this)
            	               }
        	               }
    	               ]}
	               ]}
	           }
	       ]
	   },parentNode);
	},
	updateHeader: function (model) {
		model = model || this.model;
		if (!this.element)
			return ;
	    var d = model.getValue() || new Date();
	    var era = this.eraGroup.getEraByDate(d);
		var eraIndex = this.eraGroup.indexOf(era);
		this.eraGroup.updateEraAndYear(d);
		if (this.eraSelection)
      Form.Element.setValue(this.eraSelection, eraIndex);
		Form.Element.setValue(this.yearField, d.getEraYear());
		Form.Element.setValue(this.monthSelection, d.getMonth() + 1);
	},


	createBody: function(parentNode) {
		this.dateSlot = new Array(42);
		this.weekSlot = new Array(6);
		//
	    var headerCells = [];
		if (this.includeWeek)
		    headerCells.push({ tagName: "th", className:"weekNumberHead", body: "w"});
		for(i=0; i < 7; ++i)
		    headerCells.push({ tagName: "th", className:"weekDayHead", 
		      body: this.options.ShortWeekDayNames[(i + this.options.firstDayOfWeek)%7] });
	    var bodyRows = [];
		for(var week=0;week<6;++week) {
		    var tr={tagName:"tr", body:[]};
    		bodyRows.push(tr);
    		if (this.includeWeek){
    		    var td = {
    		        tagName: "td", className:"weekNumber", align:"center", body: String.fromCharCode(160),
    		        afterBuild: function(element){ 
    		            var w = element.parentNode.rowIndex;
    		            this.weekSlot[w] = {tag:"WEEK", value:-1, textNode:element.firstChild}; 
    		        }.bind(this)
    		    };
    		    tr.body.push(td);
    		}
			for(var day=0; day<7; ++day) {
    		    var td = {
    		        tagName: "td", className:"weekNumber", align:"center", body:String.fromCharCode(160),
    		        style:"cursor:" + ((/MSIE/.test(navigator.appVersion))?"hand":"pointer"),
    		        afterBuild: function(element){
    		            var w = element.parentNode.rowIndex -1;
    		            var d = element.cellIndex - (this.includeWeek?1:0);
    		            this.dateSlot[(w*7)+d] = {tag:"DATE", value:-1, textNode:element.firstChild}; 
    		        }.bind(this)
    		    };
    		    tr.body.push(td);
			}
		}
		return Element.build(
		    {tagName:"div", className:"calendarBody", body:
	           {tagName:"table", className:"grid", boder:0, cellPadding:3, cellSpacing:0,
                   afterBuild: function(element){ this.calendarBodyTable = element; }.bind(this),
	               body: [
    	               {tagName:"thead", body: {tagName:"tr", body: headerCells} },
    	               {tagName:"tbody", body: bodyRows}
    	           ]
	           }
	        },parentNode
	   );
	},
	
	updateBody: function() {
		if (!this.element)
			return ;
		// Calculate the number of days in the month for the selected date
		var date = this.model.getValue()||new Date();
		var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
		var monthLength = Date.getDaysOfMonth(date.getFullYear(), date.getMonth());
		// Find out the weekDay index for the first of this month
		var firstIndex = (firstDayOfMonth.getDay() - this.options.firstDayOfWeek) % 7;
		if (firstIndex < 0) 
			firstIndex += 7;
		var index = 0;
		while (index < firstIndex) {
			this.dateSlot[index].value = -1;
			var textNode = this.dateSlot[index].textNode;
			textNode.data = String.fromCharCode(160);
			Element.removeClassName(textNode.parentNode, "today");
			Element.removeClassName(textNode.parentNode, "current");
			index++;
		}
		var today = (new Date()).toISODate();
		var current = date.toISODate();
		for (var i = 1; i <= monthLength; i++, index++) {
			var firstDayOfMonthIsoDate = firstDayOfMonth.toISODate();
			this.dateSlot[index].value = i;
			var textNode = this.dateSlot[index].textNode;
			textNode.data = i;
			Element.removeClassName(textNode.parentNode, "today");
			Element.removeClassName(textNode.parentNode, "current");
			if (firstDayOfMonthIsoDate == today) {
				Element.addClassName(textNode.parentNode, "today");
			}
			if (firstDayOfMonthIsoDate == current && this.model.getValue()) {
				Element.addClassName(textNode.parentNode, "current");
			}
			firstDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate()+1);
		}
		var lastDateIndex = index;
		while(index < 42) { //42 days means 6 weeks
			this.dateSlot[index].value = -1;
			var textNode = this.dateSlot[index].textNode;
			textNode.data = String.fromCharCode(160);
			Element.removeClassName(textNode.parentNode, "today");
			Element.removeClassName(textNode.parentNode, "current");
			++index;
		}
		// Week numbers
		if (this._includeWeek) {
			firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
			for (var i=0; i < 6; ++i) {
    			var textNode = this.weekSlot[i].textNode;
				if (i == 5 && lastDateIndex < 36) {
					textNode.data = String.fromCharCode(160);
					textNode.parentNode.style.borderRight = "none";
				} else {
					week = Calendar.weekNumber(this, firstDayOfMonth);
					textNode.data = week;
					textNode.parentNode.style.borderRight = "1px solid WindowText";
				}
				firstDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate()+7);
			}
		}
	},
	
	createFooter: function(parentNode) {
		var today = new Date();
		return Element.build({
	        tagName:"div", className:"calendarFooter",
	        body: [
	           {tagName:"table", className:"footerTable", boder:0, cellSpacing:0, body:
	               {tagName:"tbody", body: 
	                   {tagName:"tr", body: [
    	                   {tagName:"td", body:
    	                       {tagName:"button", body: today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate(),
        	                       afterBuild:function(element){this.todayButton = element;}.bind(this)
   	                           }
    	                   },
    	                   {tagName:"td", body: 
    	                       {tagName:"button", body: this.options.clearButtonCaption,
        	                       afterBuild:function(element){this.clearButton = element;}.bind(this)
    	                       }
    	                   }
	                   ]}
                   }
	           }
	        ]
	   },parentNode);
	}
};

Date.Calendar.ViewController = Class.create();
Date.Calendar.ViewController.DefaultOptions = {
    activateSoon: true
}
Date.Calendar.ViewController.Methods = {
    initialize: function(view, options){
        this.active = false;
        this.view = view;
        this.model = this.view.model;
        this.options = Object.extend({}, Date.Calendar.ViewController.DefaultOptions);
        this.options = Object.extend(this.options, options||{});
        if (this.options.activateSoon)
            this.activate();
    },
    activate: function() {
        Event.observe(this.view.element, "click", this.paneClick.bindAsEventListener(this));
        //Event.observe(this.view.element, "dblclick", this.paneDblClick.bindAsEventListener(this));
        if (this.view.eraSelection)
          Event.observe(this.view.eraSelection, "change", this.eraChanged.bindAsEventListener(this));
        Event.observe(this.view.monthSelection, "change", this.monthChanged.bindAsEventListener(this));
        var keyHandlingElement = this.options["keyHandlingElement"] || this.view.element; 
        this.keyHandler = new Event.KeyHandler(keyHandlingElement, this.getActions());
    },
    getActions: function() {
        var actions = [
            {shift: false, key: Event.KEY_LEFT , method: this.prevDate.bindAsEventListener(this) },
            {shift: false, key: Event.KEY_RIGHT, method: this.nextDate.bindAsEventListener(this) },
            {shift: false, key: Event.KEY_UP   , method: this.prevWeek.bindAsEventListener(this) },
            {shift: false, key: Event.KEY_DOWN , method: this.nextWeek.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_LEFT , method: this.prevMonth.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_RIGHT, method: this.nextMonth.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_UP   , method: this.prevYear.bindAsEventListener(this) },
            {shift: true , key: Event.KEY_DOWN , method: this.nextYear.bindAsEventListener(this) },
            {matchAll: true, method: this.keyup.bindAsEventListener(this), stopEvent: false }
        ];
        actions.each(function(action){
            action.event = "keydown";
            action.ctrl = true;
            // action.shift = false;
            action.alt = false;
        });
        return actions;
    },
    activateKeys: function(){
        if (this.keyHandler)
            this.keyHandler.activate();
        else
            this.activate();
    },
    deactivateKeys: function(){
        if (this.keyHandler)
            this.keyHandler.deactivate();
    },
    
    paneClick: function(event){
        var element = Event.element(event);
        if (element == this.view.prevMonthButton)
            this.model.prevMonth();
        else if (element == this.view.nextMonthButton)
            this.model.nextMonth();
        else if (element == this.view.todayButton)
            this.model.setValue(new Date());
        else if (element == this.view.clearButton)
            this.model.setValue(null);
        else { 
            if (!Element.hasClassName(element, 'weekNumber')) {
                return null;
			}
    		var dateNumber = Number(element.firstChild.data);
    		if (isNaN(dateNumber) || dateNumber <= 0 || dateNumber == null)
    			return;
    	    this.dateCellClicked(event, element, dateNumber);
        }
    },
    
    dateCellClicked: function(event, td, dateNumber){
		var d = (this.model.getValue())?new Date(this.model.getValue().getTime()):new Date();
		d.setDate(dateNumber);
		this.model.setValue(d);
    },
    
    eraChanged: function(event){
		var selectedEraIndex = this.view.eraSelection.value;
		if (selectedEraIndex < 0)
			return null;
		var era = this.view.eraGroup.get(selectedEraIndex);
		this.model.setEra(era);
    },
    monthChanged: function(event){
        this.model.setMonth(this.view.monthSelection.value);
    }, 
    keyup: function(event){
        if (this.lastUpdateModelId){
            clearTimeout(this.lastUpdateModelId);
            this.lastUpdateModelId = null;
        }
        var element = Event.element(event);
        if (element.tagName != "INPUT")
            throw $break;
        if (element == this.view.yearField)
            this.lastUpdateModelId = setTimeout(this.updateEraYear.bind(this), 500);
    },

    updateEraYear: function() {
        this.lastUpdateModelId = null;
        this.model.setEraYear(this.view.yearField.value * 1);
    },

    prevMonth: function(event){ this.model.prevMonth(); }, 
    nextMonth: function(event){ this.model.nextMonth(); }, 
    prevYear : function(event){ this.model.prevYear(); }, 
    nextYear : function(event){ this.model.nextYear(); },
    
    prevDate : function(event){ 
        var element = Event.element(event);
        //if (element.tagName == "INPUT")
        if (element == this.view.yearField)
            throw $break;
        this.model.prevDate(); 
    }, 
    nextDate : function(event){ 
        var element = Event.element(event);
        //if (element.tagName == "INPUT")
        if (element == this.view.yearField)
            throw $break;
        this.model.nextDate(); 
    }, 
    prevWeek : function(event){ 
        var element = Event.element(event);
        if (element.tagName == "SELECT")
            throw $break;
        this.model.prevWeek(); 
    }, 
    nextWeek : function(event){ 
        var element = Event.element(event);
        if (element.tagName == "SELECT")
            throw $break;
        this.model.nextWeek(); 
    }
}
Object.extend(Date.Calendar.ViewController.prototype, Date.Calendar.ViewController.Methods);


Date.Calendar.PullDown = Class.create();
Date.Calendar.PullDown.DefaultPaneStyle ={
	"width": "160px",
	"max-height": "250px",
	"overflow": "hidden"
};
Date.Calendar.PullDown.DefaultPaneOptions ={
	"style": Date.Calendar.PullDown.DefaultPaneStyle
};
Date.Calendar.PullDown.DefaultOptions = {
    activateSoon: true,
    hideOnPaneClick: false,
    toggleOnDblClick: true,
	pane: Date.Calendar.PullDown.DefaultPaneOptions,
	closeOnClick: false,
	closeOnDblClick: true
}
Object.extend(Date.Calendar.PullDown, {
    invokeActivePullDown: function(event, methodName){
        if (!this.activePullDown)
            return;
        var f = this.activePullDown[methodName];
        f.call(this.activePullDown, event);
    }
});
Date.Calendar.PullDown.Methods = {};
Object.extend(Date.Calendar.PullDown.Methods, HTMLInputElement.PullDown.Methods);
Object.extend(Date.Calendar.PullDown.Methods, {
    initialize: function(field, options) {
        this.field = $(field);
        options = Object.extend( Object.extend( {}, Date.Calendar.PullDown.DefaultOptions), options || {});
        HTMLInputElement.PullDown.Methods.initialize.apply(this, [options]);
        this.eraGroup = this.options["eraGroup"]||Date.EraGroup.DEFAULT;
	    var d = this.eraGroup.parse(this.field.value);
	    this.model = new Date.Calendar.Model(d, this.eraGroup);
        if (this.options.activateSoon)
            this.activate();
    },
    getPaneHolder: function(){
        return Date.Calendar.PullDown;
    },
	createPane: function(paneHolder) {
		var result = HTMLInputElement.PullDown.Methods.createPane.apply(this, arguments);
        paneHolder.view = new Date.Calendar.View(result, {"model":this.model} );
        paneHolder.viewController = new Date.Calendar.ViewController(paneHolder.view, {activateSoon:false, keyHandlingElement: document});
        Object.extend(paneHolder.viewController, {
            getActions: function() {
                var result = Date.Calendar.ViewController.Methods.getActions.apply(paneHolder.viewController, arguments);
                result.unshift({event:"keyup", ctrl: true , key: Event.KEY_SPACE , 
                    method: paneHolder.invokeActivePullDown.bindAsEventListener(paneHolder, "toggle") });
                result.unshift({event:"keyup", ctrl: false, key: Event.KEY_RETURN, 
                    method: paneHolder.invokeActivePullDown.bindAsEventListener(paneHolder, "hide") });
                result.unshift({event:"keyup", ctrl: false, key: Event.KEY_ESC   ,
                    method: paneHolder.invokeActivePullDown.bindAsEventListener(paneHolder, "rollback") });
                return result;
            }.bind(this),
            
            dateCellClicked: function(event, td, dateNumber){
                var result = Date.Calendar.ViewController.Methods.dateCellClicked.apply(paneHolder.viewController, arguments);
                if (this.options.closeOnClick)
                    this.hide();
                return result;
            }.bind(this)
        });
        if (this.options.closeOnDblClick)
            Event.observe(paneHolder.view.calendarBodyTable, "dblclick", this.hide.bindAsEventListener(this), false);
		this.pane = result;
		this.calendarBodyTable = paneHolder.view.calendarBodyTable
		return result;
	},
    activate: function() {
        var visibleHandlingMatcher = this.matchWhenVisible.bind(this);
        this.fieldKeyController = new Date.Calendar.KeyController(this.field, this.model, {activateSoon:false});
        Object.extend(this.fieldKeyController, {
            getActions: function() {
                var result = Date.Calendar.KeyController.Methods.getActions.apply(this.fieldKeyController, arguments);
                result.unshift(
                    {event:"keyup", ctrl: true , key: Event.KEY_SPACE, method: this.toggle.bindAsEventListener(this) });
                return result;
            }.bind(this)
        });
        this.fieldKeyController.activate();
        Event.observe(this.field, "blur", this.hide.bindAsEventListener(this) , false);
        if (this.options.toggleOnDblClick) 
            Event.observe(this.field, "dblclick", this.toggle.bindAsEventListener(this) , false);
    },
    matchWhenVisible: function(action, event, keyCode, keyHandler) {
        return (this.visible && keyHandler.matchAction(action, event, keyCode));
    },
    
    clickDocument: function(event) {
        var element = Event.element(event);
        if (Element.childOf(element, this.pane) || element == this.field) {
            if (this.options.closeOnClick && Element.childOf(element, this.calendarBodyTable)){
                this.hide();
            }
            return;
        }
        this.hide();
    },

    _hide: function(event) {
        HTMLInputElement.PullDown.Methods._hide.apply(this, arguments);
        var paneHolder = this.getPaneHolder();
        if (!this.visible){
            if (paneHolder.viewController)
                paneHolder.viewController.deactivateKeys();
            this.fieldKeyController.activate();
            if (this.clickDocumentHandler) {
                Event.stopObserving(document, "click", this.clickDocumentHandler, false);
                this.clickDocumentHandler = null;
            }
        }
        this.lastFieldValue = null;
    },
    hide: function(event) {
        HTMLInputElement.PullDown.Methods.hide.apply(this, arguments);
    },
    rollback: function(event){
        this.field.value = this.lastFieldValue;
        this.hide();
    },
    show: function(event) {
        this.lastFieldValue = this.field.value;
        HTMLInputElement.PullDown.Methods.show.apply(this, arguments);
        var paneHolder = this.getPaneHolder();
        paneHolder.activePullDown = this;
        paneHolder.view.switchModel(this.model);
        paneHolder.viewController.model = this.model;
        paneHolder.view.update();
        if (this.visible) {
            if (!this.clickDocumentHandler) {
                this.clickDocumentHandler = this.clickDocument.bindAsEventListener(this);
                Event.observe(document, "click", this.clickDocumentHandler, false);
            }
            this.fieldKeyController.deactivate();
            paneHolder.viewController.activateKeys();
        }
    }
	
});
Object.extend(Date.Calendar.PullDown.prototype, Date.Calendar.PullDown.Methods);
