import CSV from './util/CSV';
import Dates from './util/Dates';
const { DateTime, Settings } = require("luxon");

export default class EntityManager{ 
    constructor(){        
    }

    async init(){
        this.qs = this.getQsParams();
    
        this.electionDates = await this.fetchStaticJson('data/election-dates.json');
        this.holidaysRaw = await this.fetchStaticJson('data/holidays.json');
        this.holidays = [];        
        Object.keys(this.holidaysRaw).forEach(topKey => {
            Array.prototype.push.apply(this.holidays, this.getHolidaysFromTopKey(topKey));
        });
    }

    getHolidaysFromTopKey(topKey){
        let output = [];
        Object.keys(this.holidaysRaw[topKey].static).forEach(dt => {
            try{
                let bits = dt.split('/');
                let start1 = DateTime.local(2019, parseInt(bits[0]), parseInt(bits[1]));
                let start2 = DateTime.local(2020, parseInt(bits[0]), parseInt(bits[1]));
                let title = this.holidaysRaw[topKey].static[dt];
                output.push({
                    start: start1.toISODate(),
                    end: start1.toISODate(),
                    title: title
                });  
                output.push({
                    start: start2.toISODate(),
                    end: start2.toISODate(),
                    title: title
                }); 
            }catch(e){
                console.log(topKey, dt);
            }           
        });
        Object.keys(this.holidaysRaw[topKey].dynamic).forEach(dt => {
            try{
                let bits = dt.split('/');
                let start1 = DateTime.local(parseInt(bits[2]), parseInt(bits[0]), parseInt(bits[1]));
                let title = this.holidaysRaw[topKey].dynamic[dt];
                output.push({
                    start: start1.toISODate(),
                    end: start1.toISODate(),
                    title: title
                });
            }catch(e){
                console.log(topKey, dt);
            }           
        });        
        return output;
    }

    async fetchStaticJson(url, options){   
        return await fetch(url, options)
            .then(response => {
                return response.json()
            })     
            .catch(function (ex, b) {
                console.log('Fetch Static Error:', ex);
                throw ex;
            });
    } 

    async fetchStaticText(url, options){   
        return await fetch(url, options)
            .then(response => {            
                return response.text();
            })   
            .then((responseText) => {
                return CSV.fromString(responseText);                
            })  
            .catch(function (ex, b) {
                console.log('Fetch Static Error:', ex);
                throw ex;
            });
    }     

    getQsParams() {
        var query = window.location.search.substring(1);
        var output = {};
        if (query.length > 0){
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                var value = pair[1] ? decodeURIComponent(pair[1]) : null;
                output[decodeURIComponent(pair[0])] = value ? value : true;
            }
        }
        return output;
    }
    
    getQs(key){
        if (this.qs[key]){
            return this.qs[key];
        }else{
            return false;
        }
    }    
}
