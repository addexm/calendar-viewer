/* eslint no-cond-assign: 0 */
import saver from 'file-saver';
import _ from 'underscore';

export default {
    save: (filename, data) => {
        let csv_output = '';
        _.each(data, function (row) {
            let rowOutput = _.map(row, function (cell) {
                if (typeof cell !== "undefined" && cell != null) {
                    return cell.toString().replace(/"/g, '""');
                } else {
                    return '';
                }
            });
            csv_output += '"' + rowOutput.join('","') + '"\n';
        });

        let newName = filename;
        if (filename.slice(-4) !== '.csv'){
            newName = filename + '.csv';
        }
        saver.saveAs(new Blob([csv_output], { type: "text/csv" }), newName);
    },

    fromString: (strData, strDelimiter) => {
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );

        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;

        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ) {

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push([]);

            }

            var strMatchedValue;

            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[2]) {
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

                if (strMatchedValue === 'undefined') {
                    strMatchedValue = '';
                }
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[3];
            }

            // Now that we have our value string, let's add
            // it to the data array.
            arrData[arrData.length - 1].push(strMatchedValue?strMatchedValue.trim():strMatchedValue);
        }

        //Remove blank rows
        let outputArray = [];
        arrData.forEach((row) => {
            if (row.join('') === '')return;
            outputArray.push(row);
        });

        // Return the parsed data.
        return (outputArray);
    },

    asObjectArray(csv){
        let header = csv[0];
        let output = [];
        csv.slice(1).forEach((row, rowIndex) => {
            output.push(_.object(header, row));
        });
        return output;
    }
}
