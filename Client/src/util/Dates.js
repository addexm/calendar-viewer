const { DateTime, Settings } = require("luxon");

Settings.defaultZoneName = "utc";

const Dates = {
    isoCache: {},
    arbCache: {},
    arbCacheDayJs: {},
    DATETIME_MED: DateTime.DATETIME_MED,
    DATE_SHORT: 'L/d/y',
    MONTH_YEAR: { month: 'long', year: 'numeric' },
    epicMonthRange: null,
    now: () =>{
        return DateTime.local();
    },
    fromISO: (str) => {
        if (!Dates.isoCache[str]){
            Dates.isoCache[str] = DateTime.fromISO(str);
        }
        return Dates.isoCache[str];
    },
    fromStr: (str, format) => {
        if (!Dates.arbCache[str]){
            Dates.arbCache[str] = DateTime.fromFormat(str, format||Dates.DATE_SHORT);
        }
        return Dates.arbCache[str];
    }, 
    fromMs: (ms) => {
        return DateTime.fromMillis(ms);
    },
    toMonthYearStr(dt){
        return dt.toLocaleString(Dates.MONTH_YEAR);
    },
    toGroupedStr(dt, grouping){
        let g = grouping.toLowerCase();
        if (g === 'year'){
            return dt.year;
        }else if (g === 'quarter'){
            return 'Q' + dt.quarter + ' ' + dt.year;
        }else{
            return dt.toLocaleString(Dates.MONTH_YEAR);
        }        
    },    
    isValidDateStr: (str) => {
        let attempt = Dates.fromStr(str);
        return attempt.isValid;
    },
    isoToDateTime: (str) => {
        if (!str)return null;
        return Dates.fromISO(str).toLocaleString(Dates.DATETIME_MED);
    },
    _getArrayofMonthsInternal(begin, end){
        let output = [];
        let counter = begin; 
        while (counter <= end) {
            output.push(counter);
            counter = counter.plus({ months: 1 });
        }
        return output;
    },
    getArrayofMonths(begin, end){
        if (!Dates.epicMonthRange){
            let epicBegin = Dates.fromStr('1/1/1970').startOf('month');
            let epicEnd = Dates.fromStr('12/1/2100').startOf('month');
            Dates.epicMonthRange = Dates._getArrayofMonthsInternal(epicBegin, epicEnd);
        }

        let beginIndex = ((begin.year - 1970) * 12) + begin.month - 1;
        let endIndex = ((end.year - 1970) * 12) + end.month;   
    
        return Dates.epicMonthRange.slice(beginIndex, endIndex);
    },    
    currentMonthPlusYears(years){
        let today = DateTime.local();
        return [today, today.plus({ years: years })];
    },
    getMonthRangeFromMonthYearStrs(begin, end){
        let output = [];
        if (begin){
            output[0] = Dates.fromStr(begin, 'L/y');
        }else{
            output[0] = DateTime.local().startOf('month');
        }

        if (end){
            output[1] = Dates.fromStr(end, 'L/y');
        }else{
            output[1] = output[0].plus({ years: 3 });
        }

        return output;
    },
    doRangesOverlap(a, b, c, d){
        return (a >= c && a <= d) || (b >= c && b <= d);
    },
    /*getOverlapInMonths(a, b, c, d){
        if (Dates.doRangesOverlap(a, b, c, d)){
            let val = null;
            if (b >= d){
                val = a.diff(d);
            }else{
                if (a > c && b < d){
                    val = b.diff(a);
                }else{
                    val = b.diff(c);
                }
            }
            return Math.round(Math.abs(val.as('months')) - .05); 
        }else{
            return -1;
        }
    }*/
};

export default Dates;