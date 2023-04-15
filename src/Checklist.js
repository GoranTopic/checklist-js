import { read_json, write_json, 
    delete_json, mkdir, file_exists } from 'files-js'
import hash from 'object-hash';
import tmp from 'tmp';

let tmp_path = '/tmp/checklists';

/* this class makes a checklist for value that need to be check,
 * it takes a check function whihc goes throught the values. */
class Checklist{
    /* this function takes list of name name to check and */
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
                if(this._isObject(value))
                    value = JSON.stringify(value)
                this._checklist[value] = false
            }
        }else // if we found checklist in memory
            this._values = Object.keys(this._checklist);
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
        this._values = Object.keys(this._checklist);
        this._values.forEach( value  => {
            if(this._isObject(value))
                value = JSON.stringify(value)
            if(! this._checklist[value] )
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
        // convert value to json
        if(this._isObject(value)) value = JSON.stringify(value)
        // check with mark
        this._checklist[value] = mark;
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
        // convert value to json
        if(this._isObject(value)) value = JSON.stringify(value)
        // uncheck with the value
        this._checklist[value] = false;
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
        if(this._isObject(value)) value = JSON.stringify(value)
        // if it is not in the list, or overwrite is true
        if(!this._checklist[value] || overwrite)
            this._checklist[value] = false;
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
        if(this._isObject(value)) value = JSON.stringify(value)
        delete this._checklist[value];
        this._calcMissing();
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
        if(this._isObject(value))
            value = JSON.stringify(value)
        return this._checklist[value]
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

    toString(){
        /* print the checklist */
        Object.entries(this._checklist)
            .reduce( (str, entry) => 
        str + `${entry[1]} : ${entry[0]}\n`, ''
            ).trim()
    }
    log = this.toString
    print = this.toString

}

export default Checklist;
