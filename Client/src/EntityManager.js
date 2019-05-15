import CSV from './util/CSV';
export default class EntityManager{ 
    constructor(){}

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
}
