import isArray from './utils/isArray.js';
import parsePath from './utils/parsePath.js';
import Store from './store/Store.js';
import fs from 'fs';
import hash from 'object-hash';
import osPath from 'path';
import os from 'os';


/* this class makes a checklist for value that need to be check,
 * it takes a check function which goes throught the values. */
class Checklist{
    /* this function takes list of  name to check and */
    constructor(values=[], options = {}){
        // get options
        let { 
            tag, // this is a tag to identify the checklist, 
            // if none is passed create one by hashing the values
            // this is tipicaly stores as the filename
            path, // path to save the checklist, 
            // if it has the filename, it will be in the specified path, witl the file name 
            // and the path will not be checked
            recalc_on_check, //recalcuate the missing values on check
            // this options will put the missing value on the front of the list every
            // a value is checked. default is false.
            // this function if for special cases where you need to check a value
            // in a certain order
            type, // this can either be a 'list', or a 'queue' when getting the missing values out
            // this will put the values gotter from next() to the end of the list
            // while list will not put the values back and one need to rerun the checklist
            // to get the missing values again. Default is 'queue'
            shuffle, // if true, shuffle the values in checklist
            persist, // if true, save the checklist to disk
        } = options;
        // set default values
        this.type = (type === 'list') ? 'list' : 'queue';
        this.persist = (persist === undefined) ? true : persist;
        this._recalc_on_check = (recalc_on_check === undefined) ? false : recalc_on_check;
        this._shuffle = (shuffle === undefined) ? false : shuffle;
        // this will set the values this._tag, this_path and this._filename
        this._filename = this._handleFilename(values, tag, path);
        // make the storage
        this._store = this._makeStore(this._filename);
        // if there are value in storage
        // use the values form the storage and ignore the passed values
        let valuesSaved = this._store.all();
        if(valuesSaved.length !== 0) this._values = valuesSaved;
        // else use the passed values, add false values to the checklist
        else this._values = values.map(v => ({ value: v, checked: false }));
        // make the cheklist from the values
        this._checklist = new Map();
        for(let v of this._values){
            // convert value to json
            let key = JSON.stringify(v.value);
            // if it is not in the list, or overwrite is true
            this._checklist.set(key, v.checked);
        }
        // update the missing values array
        this._updateMissingValue();
    }

    _updateMissingValue = () => {
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
        if(shuffle) // if shuffle is true, shuffle the values
            this._values = [ ...this._values].sort(() => Math.random() - 0.5);
    }

    _makeStore = filename => {
        if(!this.persist) return null;
        return new Store(filename);
    }

    getCheckedValues = () =>
        /* this function returns the checked values array */
        this._values.filter(v => !this._missing_values.includes(v));

    countChecked = () => 
        /* this function returns then number of values that have been checked */
        this._values.length - this._missing_values.length;
    countDone = this.countChecked;
    count_checked = this.countChecked;
    count_done = this.countChecked;


    getMissingValues = () =>
        /* this function returns the missing values array */
        this._missing_values;
    missingValues = this.getMissingValues;
    missing_values = this.getMissingValues;
    uncheckedValues = this.getMissingValues;
    unchecked_values = this.getMissingValues;

    missingLeft = () =>
        /* return the number of missing values left */
        this._missing_values.length
    countMissing = this.missingLeft;
    count_missing = this.missingLeft;
    missing_left = this.missingLeft;
    count_unchecked = this.missingLeft;
    countUnchecked = this.missingLeft;

    next = () => {
        /* returns the next missing values */
        let value = this._missing_values.shift();
        // add to the need of the _missing_values
        if(this.enqueue) this._missing_values.push(value);
        // return the value 
        return value
    }
    nextValue = this.next;
    next_value = this.next;
    nextMissing = this.next;
    next_missing = this.next;

    check = (values, mark = true) => {
        /* checks a list of values or a single value */
        this.check_call_count++
        if(isArray(values)) // if passed an array
            for(let value of values) this._check(value, mark);
        else // single file
            this._check(values, mark);
    }
    mark = this.check;

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
        if(this.persist) this.store.set(key, mark);
    }

    uncheck = values => {
        /* unchecks a list of values or a single value */
        if(isArray(values)) // if passed an array
            for(let value of values) this._uncheck(value);
        else // single file
            this._uncheck(values);
    }
    unmark = this.uncheck;

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
        if(this.persist) this.store.set(key, mark);
    }
    
    /* returns all key values */
    getValues = () => this._values
    values = this.getValues;

    /* returns length of all the values */
    countValues = () => this._values.length

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
        // write to disk
        if(this.persist) this.store.set(key, mark);
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
    push = this.add;


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
        if(this.persist) this.store.delete(key);
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
    pop = this.remove;

    isChecked = value => {
        /* Checks if all value has been already been checked off */
        let key = JSON.stringify(value);
        return this._checklist.get(key);
    }
    is_checked = this.isChecked;

    isDone = () =>
        /* checks if all the value on the checklist are done */
        Array.from(this._checklist.values()).every(v => v)
    is_done = this.isDone;
    isComplete = this.isDone;
    is_complete = this.isDone;
    isFinished = this.isDone;
    is_finished = this.isDone;

    isNotDone = () =>
        /* checks if some value on the checklist are is not done */
        Array.from(this._checklist.values()).some(v => v === false)
    is_not_done = this.isNotDone;
    isNotComplete = this.isNotDone;
    is_not_complete = this.isNotDone;
    isNotFinished = this.isNotDone;
    is_not_finished = this.isNotDone;

    delete = () =>  {
        /* delete the checklist from disk*/
        this._values = [];
        this._checklist.clear();
        this._checklist = null;
        this._missing_values = [];
        fs.unlinkSync(this._filename);
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
    
    _handleFilename(values, tag, path) {
        let tmp_path = '';
        // if it is windows, set the tmp path to the user temp folder
        if(os.platform() === 'win32') tmp_path = os.tmpdir();
        // if it is on linux, set the tmp path to /tmp/checklists
        else if(os.platform() === 'linux') tmp_path = '/tmp/';
        // if it is on mac, set the tmp path to /tmp/checklists
        else if(os.platform() === 'darwin') tmp_path = '/tmp/';
        // this function will take care of the filename
        // if the use has passed a path, use that path
        // else use the tmp path
        // if the user has passed a tag, use that tag
        // else use the hash of the values
        if( typeof path === 'string' && path.length > 0 ){
            // if path is a string, parse it
            let { base, dir }  = parsePath(path);
            if(base) this._tag = base;
            if(dir){
                // if the directory does not exist, make it
                if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                this._tmp_path = dir;
            }
        }else
            // if path is not a string, make a tmp folder
            this._tmp_path = tmp_path;
        // handle tag
        if(!this._tag) this._tag = hash(values, { unorderedArrays: true });
        // finally set the filename
        this._filename = osPath.join( this._tmp_path, this._tag);
    }

    log = () => console.log(this.toString())
    print = () => console.log(this.toString())
}

export default Checklist;
