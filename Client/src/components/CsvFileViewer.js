import React from 'react';
import _ from 'underscore';

const CsvFileViewer = ({data, errors, statuses, cellFormatter}) => {
    if (!data)return null;

    let errMsgGroups = _.indexBy(errors, (item, index) => {
        return item[0];
    });

    return (
        <table className="table table-bordered table table-bordered table-striped file-checker">   
            <tbody>
                {data.map((items, rowIndex) => {    
                    return(        
                        <tr key={'row' + rowIndex}>
                            <td key="col-1">{rowIndex + 1}</td>
                            {items.map((value, colIndex) => { 
                                let msgs = errMsgGroups[rowIndex + ':' + colIndex];
                                if (msgs){
                                    return <td key={'col' + colIndex} className={msgs[2]||'error'} title={msgs[1]||'Error'}>{cellFormatter?cellFormatter(rowIndex, colIndex, value):value}</td>
                                }else{
                                    return <td key={'col' + colIndex}>{cellFormatter?cellFormatter(rowIndex, colIndex, value):value}</td>
                                }
                            })}
                            { statuses ? 
                                <td key="col+1" className={"status " + statuses[rowIndex]}>
                                    {rowIndex === 0 ? 'Status' : statuses[rowIndex]}
                                </td>
                            : null }
                        </tr>  
                    );    
                })}
            </tbody>         
        </table>
    );
};

export default CsvFileViewer;