/* global EM */
import Dates from '../util/Dates';
import CSV from '../util/CSV';
import _ from 'underscore';

export default class DomainProcessor{
    constructor(dateFormat){
        this.dateFormat = dateFormat;
    }

    process(csv){
        let output = { d1: null, d2: null, d3: null, d4: null };

        let source = CSV.asObjectArray(csv);
        let headerRow = this.formatHeader(csv[0]);

        output.d1 = [headerRow, ...this.processDomain1(source, EM.domain1.obj)];
        output.d2 = [headerRow, ...this.processDomain2(source, EM.domain2.obj)];
        return output;
    }

    processDomain1(source, ref){
        let output = [];        
        source.forEach((row, rowIndex) => {
            let baseRow = this.processCommon(row);  
            baseRow.Domain = 1;          

            //Set Sites_Planned
            if (!baseRow['Sites_Planned'] && baseRow['Sourcing_Strategy_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)'] === 'Insourced'){
                let match = ref.sitesPlanned.find((spRow) => {
                    return spRow['Phase Group'].toLowerCase() === baseRow['Phase_Group'].toLowerCase();
                });    
                if (match) {
                    baseRow['Sites_Planned'] = match['Sites_Planned'];
                }
            }

            //Set Study Distribution
            if (baseRow['Sourcing_Strategy_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)'] === 'Outsourced'){
                let match = ref.studyDistribution.find((sdRow) => {
                    return (sdRow['TA'].toLowerCase() + sdRow['Phase Group'].toLowerCase()) === (baseRow['TA'].toLowerCase() + baseRow['Phase_Group'].toLowerCase());
                });    
                if (match) {
                    baseRow['NA_Study_Dist_Assump'] = match['NA_Study_Dist_Assump'];
                    baseRow['EUAPAC_Study_Dist_Assump'] = match['EUAPAC_Study_Dist_Assump'];
                }
            }

            //Set Site Distribution
            if (baseRow['Sourcing_Strategy_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)'] === 'Insourced'){
                let match = ref.siteDistribution.find((sdRow) => {
                    return (sdRow['Phase Group'].toLowerCase()) === (baseRow['Phase_Group'].toLowerCase());
                });    
                if (match) {
                    baseRow['NA_Site_Dist_Assump'] = match['NA_Site_Dist_Assump'];
                    baseRow['EUAPAC_Site_Dist_Assump'] = match['EUAPAC_Site_Dist_Assump'];
                }
            }              
            
            //Set CarT
            let ctMatch = ref.carT.find((ctRow) => {
                return baseRow['Compound'].indexOf(ctRow.CarT) > -1;
            }); 
            if (ctMatch){
                baseRow.CarT = 'Yes';
            }else{
                baseRow.CarT = 'No';
            }

            ref.activities.forEach((activityRef) => {
                //Set begin/end dates generically
                let activityRow = this.processActivity(ref, activityRef, baseRow);

                //Set begin date overrides
                if (!activityRow.Begin && activityRef.Activity === 'Planning'){
                    let dt = Dates.fromStr(activityRow['PA'], this.dateFormat);
                    let match = ref['planningBegin'].find((pBRow) => {
                        return activityRow['Phase Group'] === pBRow['Phase Group'];
                    }); 
                    if (match){
                        activityRow.Begin = dt.plus({ days: -1 * (match.Days) });
                    }else{
                        activityRow.Begin = dt.plus({ days: -286 });
                    }
                }

                //Set begin date overrides
                if (!activityRow.End && activityRef.Activity === 'Analysis & Reporting'){
                    let fld = activityRow['Final_CSR'] || activityRow['Primary_CSR'];
                    activityRow.End = Dates.fromStr(fld, this.dateFormat);
                }                

                //Set end date overrides
                if (!activityRow.End && activityRef.Activity === 'Post-Completion'){
                    let fld = activityRow['Final_CSR'] || activityRow['Primary_CSR'];                    
                    let dt = Dates.fromStr(fld, this.dateFormat);                    
                    dt = this.roundDate(dt, 'up');
                    activityRow.Begin = dt;
                    activityRow.End = dt.plus({ days: 180 });
                }
                
                this.processSupport(ref.roleSupport, activityRow);

                output.push(activityRow);
            });            
        });

        //Process program-level activity
        let compoundGroups = _.groupBy(source, 'Compound');        
        let programRows = [];
        let baseRow = {};
        Object.keys(compoundGroups).forEach(compound => {
            let grp = compoundGroups[compound];
            let row = {
                Compound: compound,
                Study_ID: compound,
                Activity: 'Program Level',
                TA: grp[0].TA,
                CarT: grp[0].CarT,
                Molecule_Type: grp[0].Molecule_Type,
                'Supported_By_SIM': baseRow['Supported_By_SIM'], 
                'Supported_By_CTM': baseRow['Supported_By_CTM'], 
                'Supported_By_CTA': baseRow['Supported_By_CTA'], 
                'Supported_By_CRA/CRM_(NA)': baseRow['Supported_By_CRA/CRM_(NA)'], 
                'Supported_By_CRA/CRM_(EU/APAC)': baseRow['Supported_By_CRA/CRM_(EU/APAC)'], 
                'Supported_By_CTPA-Analyst': baseRow['Supported_By_CTPA-Analyst'], 
                'Supported_By_DM': baseRow['Supported_By_DM'], 
                'Supported_By_CP': baseRow['Supported_By_CP'], 
                'Supported_By_LCRA': baseRow['Supported_By_LCRA'] 
            };            
            let min = _.min(grp, (item) => {
                let dtStr = item.SA || item.PA;
                item._begin = Dates.fromStr(dtStr, this.dateFormat).plus({ days: item.SA ? 0 : -286 });
                return item._begin;
            });
            console.log(min);
            if (min)row.Begin = min._begin;        

            let max = _.min(grp, (item) => {
                item._end = Dates.fromStr(item.LSLD, this.dateFormat);
                return item._end;
            });
            if (max)row.End = max._end;

            this.processSupport(ref.roleSupport, row);
            programRows.push(row);
        });

        Array.prototype.push.apply(output, programRows);
        return output.map(item => {
            return this.formatRow(item);
        });
    }

    processDomain2(source, ref){
        let output = [];
        source.forEach((row, rowIndex) => {
            let baseRow = this.processCommon(row);
            baseRow.Domain = 2;     

            ref.activities.forEach((activityRef) => {
                //Set begin/end dates generically
                let activityRow = this.processActivity(ref, activityRef, baseRow);            

                this.processSupport(ref.roleSupport, activityRow);

                let formattedActivityRow = this.formatRow(activityRow);
                output.push(formattedActivityRow);
            });            
        });
        return output;
    }    

    processCommon(row){
        Object.keys(row).forEach((key, keyIndex) => {
            if (key.indexOf('Complexity') === 0){
                this.processComplexity(row, key);
            }

            if (key.indexOf('Sourcing_Strategy') === 0){
                this.processSourcingStrategy(row, key);
            }
        });
        
        return row;
    }

    processComplexity(row, field){
        if (!row[field].trim())row[field] = 'Medium';
    }

    processSourcingStrategy(row, field){
        let ref = EM.common.obj;
        if (!row[field].trim() || row[field].toLowerCase() === 'Mixed Model'){
            let match = ref.sourcing.find((sourcingRow) => {
                return row['Phase Group'] === sourcingRow['Phase_Group'];
            });
            if (match){
                row[field] = match['Sourcing Strategy'];
            }
        }
    }

    processSupport(ref, row){
        let refIndex = _.indexBy(ref, 'Role');
        console.log(refIndex);
        Object.keys(row).forEach((key, keyIndex) => {
            if (key.indexOf('Supported_By') === 0){
                let role = key.slice(13);
                let act = row.Activity;                
                let supportObj = refIndex[role];
                if (supportObj){
                    if (supportObj[act] === 'Y'){
                        row[key] = 'Y';
                    }else{
                        row[key] = 'N';
                    }
                }else{
                    row[key] = 'N';
                }                
            }
        });
        
        return row;        
    }

    processActivity(ref, activityRef, row){        
        let output = Object.assign({}, row, {
            Activity: activityRef.Activity 
        });

        if (activityRef.Begin && row[activityRef.Begin]){
            output.Begin = Dates.fromStr(row[activityRef.Begin], this.dateFormat);
            if (activityRef['Modify Begin']){
                let mod = parseInt(activityRef['Modify Begin']);
                if (!isNaN(mod))output.Begin = output.Begin.plus({ days: activityRef['Modify Begin'] });
            }
            if (activityRef['Round Begin']){
                output.Begin = this.roundDate(output.Begin, activityRef['Round Begin']);
            }
        }else{
            output.Begin = null;
        }

        if (activityRef.End && row[activityRef.End]){
            output.End = Dates.fromStr(row[activityRef.End], this.dateFormat);
            if (activityRef['Modify End']){
                let mod = parseInt(activityRef['Modify End']);
                if (!isNaN(mod))output.End = output.End.plus({ days: activityRef['Modify End'] });
            }            
            if (activityRef['Round End']){
                output.End = this.roundDate(output.End, activityRef['Round End']);
            }
        }else{
            output.End = null;
        }

        return output;
    } 

    formatHeader(headerRow){
        return [
            headerRow[0],
            headerRow[1],
            'Work Item',
            'Activity',
            'Begin',
            'End',
            'Sourcing_Strategy_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)',
            'Sourcing_Strategy_CTM_CTA',
            'Domain',
            'Disease',
            'Indication',
            'POR',
            'Study_Managed_By',
            'Sponsor',
            'Molecule_Type',
            'Subjects_Planned',
            'Subjects_Actual',
            'Sites_Planned',
            'Sites_Actual',
            'Committee_PRAD_only',
            'Phase',
            'Phase_Group',
            'Complexity',
            'NA_Study_Dist_Assump',
            'EUAPAC_Study_Dist_Assump',
            'NA_Site_Dist_Assump',          
            'EUAPAC_Site_Dist_Assump',
            'CarT',
            'Study_Title',
            'Source_System',
            'Study_Approval_Status',
            'Project_Status_(PRAD Only)',
            'Task_ID', 
            'Priority',
            'Complexity_DM-CP', 
            'Complexity_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)', 
            'Program_Lead',
            'Supported_By_SIM', 
            'Supported_By_CTM', 
            'Supported_By_CTA', 
            'Supported_By_CRA/CRM_(NA)', 
            'Supported_By_CRA/CRM_(EU/APAC)', 
            'Supported_By_CTPA-Analyst', 
            'Supported_By_DM', 
            'Supported_By_CP', 
            'Supported_By_LCRA', 
        ];
    }    
    
    formatRow(row){
        return [
            row.TA,
            row['Compound'],
            row['Study_ID'],
            row.Activity,
            row.Begin ? row.Begin.toLocaleString() : '',
            row.End ? row.End.toLocaleString() : '',
            row['Sourcing_Strategy_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)'],
            row['Sourcing_Strategy_CTM_CTA'],
            row['Domain'],
            row['Disease'],
            row['Indication'],
            row['POR'],
            row['Study_Managed_By'],
            row['Sponsor'],
            row['Molecule_Type'],
            row['Subjects_Planned'],
            row['Subjects_Actual'],
            row['Sites_Planned'],
            row['Sites_Actual'],
            row['Committee_PRAD_only'],
            row['Phase'],
            row['Phase_Group'],
            row['Complexity'],
            row['NA_Study_Dist_Assump'],
            row['EUAPAC_Study_Dist_Assump'],
            row['NA_Site_Dist_Assump'],            
            row['EUAPAC_Site_Dist_Assump'],
            row['CarT'],
            null,
            row['Source_System'],
            row['Study_Approval_Status'],
            row['Project_Status_(PRAD Only)'],
            row['Task_ID'], 
            row['Priority'],
            row['Complexity_DM-CP'], 
            row['Complexity_CRA/CRM_(NA)_CRA/CRM_(EU/APAC)'], 
            row['Program_Lead'],
            row['Supported_By_SIM'], 
            row['Supported_By_CTM'], 
            row['Supported_By_CTA'], 
            row['Supported_By_CRA/CRM_(NA)'], 
            row['Supported_By_CRA/CRM_(EU/APAC)'], 
            row['Supported_By_CTPA-Analyst'], 
            row['Supported_By_DM'], 
            row['Supported_By_CP'], 
            row['Supported_By_LCRA'], 
        ];
    }

    roundDate(dt, rounding){
        if (rounding.toLowerCase() === 'up'){
            return dt.plus({ months: 1 }).startOf('month');
        }

        if (rounding.toLowerCase() === 'down'){
            return dt.startOf('month');
        }  
        
        return dt;
    }
}