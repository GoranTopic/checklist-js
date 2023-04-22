import { read_json, write_json, 
    delete_json, mkdir, file_exists } from 'files-js'
import hash from 'object-hash';
import tmp from 'tmp';

let tmp_path = '/tmp/checklists';

/* this class makes a checklist for value that need to be check,
 * it takes a check function which goes throught the values. */
class Checklist{
    /* this function takes list of  name to check and */
    constructor(values=[], options = {}){
        // get options
        let { name, path, recalc_on_check } = options;
        // hash a new name based on the values
        this._name = ( name ? name :  
            hash(values, { unorderedArrays: true } )) + ".json"
        // if custom path is not defined
        if(path === undefined) // make a tmp folder
            path = file_exists(tmp_path)? // if tmp dir does not exists
                tmp_path : tmp.dirSync({ name: 'checklists' }).name
        // set the directory path
        this._dir_path = path;
        // set _recalc_on_check to default 
        this._recalc_on_check = 
            (recalc_on_check === undefined || recalc_on_check === true)? 
            true : false;
        //console.log(recalc_on_check)
        //console.log(this._recalc_on_check)
        // if you want to mantain the original missing list of value after checks
        this._filename = this._dir_path + '/' + this._name
        this._checklist = read_json(this._filename) ?? {};
        this._values = values ?? [];
        this._missing_values = [];
        // make checklist
        if(!this._checklist){
            this._checklist = {};
            for(let value of this._values){
                let key = JSON.stringify(value)
                this._checklist[key] = false
            }
        }else // if we found checklist in memory
            this._values = Object.keys(this._checklist)
                .map(JSON.parse); 
        // calculate the missing values
        this._calcMissing();
        // save new checklist
        write_json(this._checklist, this._filename);
    }

    _isObject = objValue => {
        /* this inner function check if paramter is a js object 
         * this is used to handle values which are not objects */
        return ( objValue && 
            (typeof objValue === 'object') && 
            (objValue.constructor === Object) );
    }

    _isArray = arrayValue => {
        /* this inner function check if paramter is an Array 
         * this is used to handle args which might be an array */
        return ( arrayValue && 
            (typeof arrayValue === 'object') && 
            (arrayValue.constructor === Array) );
    }

    _calcMissing = () => {
        /* this inner function recalcuates the missing values from the checklist */
        this._missing_values = [];
        this._values = Object.keys(this._checklist)
            .map(JSON.parse);
        this._values.forEach( value => {
            let key = JSON.stringify(value);
            if(! this._checklist[key] )
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

    next = () =>
        /* returns the next missing values */
        this._missing_values.shift();

    check = (values, mark = true) => {
        /* checks a list of values or a single value */
        if(this._isArray(values)) // if passed an array
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
        this._checklist[key] = mark;
        // recalcuate the missing value 
        if(this._recalc_on_check) this._calcMissing();
        // write to disk
        return write_json(this._checklist, this._filename);
    }

    uncheck = values => {
        /* unchecks a list of values or a single value */
        if(this._isArray(values)) // if passed an array
            for(let value of values) this._check(value);
        else // single file
            this._uncheck(values);
    }

    _uncheck = value => {
        /* unchecks a value on on the list which might have been done */
        if(value === undefined || value === null) return;
        // convert value to json
        let key = JSON.stringify(value)
        // uncheck with the value
        this._checklist[key] = false;
        // recalcuate the missing value 
        if(this._recalc_on_check) this._calcMissing();
        // write to disk
        return write_json(this._checklist, this._filename);
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
        let key = JSON.stringify(value)
        // if it is not in the list, or overwrite is true
        if(!this._checklist[key] || overwrite)
            this._checklist[key] = false;
        // recalcuate the missing values
        this._calcMissing();
        // save to disk
        return write_json(this._checklist, this._filename);
    }

    add = (values, overwrite = true) => {
        /* adds a list of values as not done to the list */
        // if passed an array
        if(this._isArray(values))
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
        delete this._checklist[key];
        //  recalcuate the missing values
        this._calcMissing();
        // save to disk
        return write_json(this._checklist, this._filename);
    }

    remove = values => {
        /* removes a list of values as not done to the list*/
        // if passed an array
        if(this._isArray(values))
            for(let value of values)
                this._remove(value);
        else // single file
            this._remove(values);
        return true;
    }

    isChecked = value => {
        /* Checks if all value has been already been checked off */
        let key = JSON.stringify(value)
        return this._checklist[key]
    }

    isDone = () =>
        /* checks if all the value on the checklist are done */
        Object.values(this._checklist).every(v => v)

    isNotDone = () =>
        /* checks if some value on the checklist are is not done */
        Object.values(this._checklist).some(v => v === false)

    delete = () =>  {
        /* delete the checklist from disk*/
        this._values = [];
        this._checklist = {};
        this._missing_values = [];
        delete_json(this._filename);
    }

    // function to print the checklist
    toString({true_emoji = '✅', false_emoji = '❌'} = {}){
        /* print the checklist */
        // string to return
        let str = '';
        // get the longest key from the checklist
        let longestKey = Object.keys(this._checklist)
            .reduce((a, b) => a.length > b.length ? a : b)
        .length;
        // loop through the checklist
        Object.entries(this._checklist)
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
