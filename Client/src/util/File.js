/* global EM */
import CSV from './CSV';

const File = {
    read: (ctrl) => {
        var reader = new FileReader();
        return new Promise(function(resolve, reject){
            reader.onload = function(){
                resolve(reader.result);
            };

            reader.onerror = function (event) {
                reject();
            };
    
            reader.readAsText(ctrl.files[0]);
        });
    },

    readCSV: async (ctrl) => {
        let fileContents = await File.read(ctrl);
        if (!fileContents){
            throw new Error(EM.t('error.csv-no-data'));
        }

        let csvContents = CSV.fromString(fileContents.trim());                     
        if (csvContents.length < 2){
            throw new Error(EM.t('error.csv-no-data'));
        }

        return csvContents;
    }
}

export default File;
