import { isArray } from './utils/isArray.js';
import hash from 'object-hash';
import Storage from './storages/storage.js';

/* this class makes a checklist for value that need to be check,
 * it takes a check function which goes throught the values. */
class Checklist{
    /* this function takes list of  name to check and */
    constructor(values=[], options = {}){
        // get options
        let { 
            id, // name of the checklist to save
            path, // path to save the checklist at
            recalc_on_check, // recalcuate the missing values on check
            save_every_check, // save the checklist every n checks
            enqueue, // if false, do not add missing values to the end of the list
            shuffle, // if true, shuffle the values before checking
            type, // type of storage to use
        } = options;
        // set the enqueue
        this.enqueue = enqueue ?? true;
        // set the save_every_check
        this.check_call_count = 0;
        // save every 1 checks
        this.save_every_check = save_every_check ?? 1;
        // shuffle values if it is enabled
        if(shuffle) values = [ ...values].sort(() => Math.random() - 0.5);
        // set _recalc_on_check to default 
        this._recalc_on_check = recalc_on_check ?? false;
        // create a new storage object
        this.storage = new Storage({ 
            type: type ?? 'jsonFile',
            path: path ?? null,
        });

        // if path is not passed, use the id
        if( path ){
            // make the storage db
            this.storage.open( path ?? './checklists', id ?? hash(values) );
        }
            
        // try to read the file from memeory
        try{  // get the check list form memory
            let string_file = fs.readFileSync(this._filename);
            let json_list = JSON.parse(string_file);
            // shuffe if is enabled
            this._checklist = new Map(json_list);
        }catch(e){ // otherwise make a new checklist
            this._checklist = new Map();
        }

        // set the values, if passed
        this._values = values ?? [];
        // missing value are empty
        // until the are calcualted with this._calcMissing()
        this._missing_values = [];
        // if checklist is empty, add values to it
        if(this._checklist.size === 0)
            for(let value of this._values){
                //console.log('adding', value)
                this._checklist.set( JSON.stringify(value), false );
            }
        else // if the cheklist is not empty, get the values from it
            this._values = Array.from( this._checklist.keys() )
                .map( JSON.parse ); 
        // calculate the missing values
        this._calcMissing();
        // save new checklist
        this.storage.save();
    }

    _saveChecklist = () => { 
        return fs.writeFileSync(this._filename, 
            JSON.stringify(
                Array.from( this._checklist.entries() )
            )
        )
    }

    save = () => this.storage.save()

    _calcMissing = () => {
        /* this inner function recalcuates the missing values from the checklist */
        this._missing_values = [];
        // get the values from the checklist
        this._values = Array.from(this._checklist.keys()).map(JSON.parse);
        // check each value
        this._values.forEach( value => {
            // convert value to string
            let key = JSON.stringify(value);
            //console.log(this._checklist.get(key))
            if( this._checklist.get(key) === false )
                this._missing_values.push(value)
        })
    }

    getCheckedValues = () =>
        /* this function returns the checked values array */
        this._values.filter(v => !this._missing_values.includes(v));

    valuesDone = () => 
        /* this function returns then number of values that have been checked */
        this._values.length - this._missing_values.length;

    getMissingValues = () =>
        /* this function returns the missing values array */
        this._missing_values;

    missingLeft = () =>
        /* return the number of missing values left */
        this._missing_values.length

    next = () => {
        /* returns the next missing values */
        let value = this._missing_values.shift();
        // add to the need of the _missing_values
        if(this.enqueue) this._missing_values.push(value);
        // return the value 
        return value
    }

    check = (values, mark = true) => {
        /* checks a list of values or a single value */
        this.check_call_count++
        if(isArray(values)) // if passed an array
            for(let value of values) this._check(value, mark);
        else // single file
            this._check(values, mark);
    }

    _check = (value, mark) => {
        /* checks a value on the list as done */
        if(value === undefined || value === null) return;
        // convert value to json
        let key = JSON.stringify(value)
        // check with mark
        this._checklist.set(key, mark);
        // recalcuate the missing value 
        if(this._recalc_on_check) this._calcMissing();
        // write to disk
        if(this.check_call_count % this.save_every_check === 0 || this._missing_values.length === 0)
            this.storage.set(key, mark);
    }

    uncheck = values => {
        /* unchecks a list of values or a single value */
        if(isArray(values)) // if passed an array
            for(let value of values) this._uncheck(value);
        else // single file
            this._uncheck(values);
    }

    _uncheck = value => {
        /* unchecks a value on on the list which might have been done */
        if(value === undefined || value === null) return;
        // convert value to json
        let key = JSON.stringify(value);
        // uncheck with the value
        this._checklist.set(key, false);
        // recalcuate the missing value 
        if(this._recalc_on_check) this._calcMissing();
        // write to disk
        this.storage.set(key, false);
    }
    
    /* returns all key values */
    getValues = () => this._values

    /* returns length of all the values */
    valuesCount = () => this._values.length

    _add = (value, overwrite = true) => {
        /* add a value as not done to the list
         * if overwrite is true, it writes over any truely value */
        if(value === undefined || value === null) return;
        // convert value to json
        let key = JSON.stringify(value);
        // if it is not in the list, or overwrite is true
        if(!this._checklist.has(key) || overwrite)
            this._checklist.set(key, false);
        // recalcuate the missing values
        this._calcMissing();
        // save to disk
        return this.storage.set(key, false);
    }

    add = (values, overwrite = true) => {
        /* adds a list of values as not done to the list */
        // if passed an array
        if(isArray(values))
            for(let value of values)
                this._add(value, overwrite);
        else // single file
            this._add(values, overwrite);
        return true;
    }

    _remove = value => {
        /* removes the value from the list */
        // if value is null or undefined
        if(value === undefined || value === null) return;
        // convert value to json
        let key = JSON.stringify(value)
        // remove the value from the list
        this._checklist.delete(key);
        //  recalcuate the missing values
        this._calcMissing();
        // save to disk
        return this.storage.clear(key);
    }

    remove = values => {
        /* removes a list of values as not done to the list*/
        // if passed an array
        if(isArray(values))
            for(let value of values)
                this._remove(value);
        else // single file
            this._remove(values);
        return true;
    }

    isChecked = value => {
        /* Checks if all value has been already been checked off */
        let key = JSON.stringify(value);
        return this._checklist.get(key);
    }

    isDone = () =>
        /* checks if all the value on the checklist are done */
        Array.from(this._checklist.values()).every(v => v)

    isNotDone = () =>
        /* checks if some value on the checklist are is not done */
        Array.from(this._checklist.values()).some(v => v === false)

    delete = () =>  {
        /* delete the checklist from disk*/
        this._values = [];
        this._checklist.clear();
        this._checklist = null;
        this._missing_values = [];
        this.storage.delete();
    }

    // function to print the checklist
    toString({true_emoji = '✅', false_emoji = '❌'} = {}){
        /* print the checklist */
        // string to return
        let str = '';
        // get the longest key from the checklist
        let longestKey = Array.from(this._checklist.keys())
            .reduce((a, b) => a.length > b.length ? a : b)
        .length;
        // loop through the checklist
        Array.from(this._checklist.entries())
            .forEach( entry => {
                // get the key and value
                let [ key, value ] = entry;
                // add padding to the key 
                str += `${key.padEnd(longestKey)}: ` + `${
                    // if the value is true, add the true emoji
                    value === true? true_emoji :
                    // if the value is false, add the false emoji
                    value === false? false_emoji : 
                    // else print the value
                    value}` + 
                    `\n`;
            })
        return str;
    }

    log = () => console.log(this.toString())
    print = () => console.log(this.toString())
}

export default Checklist;
