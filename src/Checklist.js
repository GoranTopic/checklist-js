import { read_json, write_json, delete_json, mkdir } from 'files-js'

// get data directory
let data_directory =  process.cwd();

/* this class makes a checklist for value that need to be check,
 * it takes a check function whihc goes throught the values. */
class Checklist{
    /* this function takes list of name name to check and */
    constructor(values, options = { 
        name: null, path: null, recalc_on_check: true 
    }){
        let { name, path, recalc_on_check } = options;
        // get options
        //console.log(recalc_on_check)
        // only for script
        this.dir_path = path ?? data_directory + '/resources/checklists';
        mkdir(this.dir_path);
        // if you want to mantain the original missing list of value after checks
        this._recalc_on_check = options.recalc_on_check;
        this._name = name + ".json";
        this._filename = this.dir_path + '/' + this.name
        this._checklist = read_json(this._filename);
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
            (objValue.constructor === Array) );
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

    valuesDone = () => 
        /* this function returns then number of values that have been checked */
        this._values.length - this._missing_values.length;

    getMissingValues = () =>
        /* this function returns the missing values array */
        this._missing_values;

    missingLeft = () =>
        /* return the number of missing values left */
        this._missing_values.length

    nextMissing = () =>
        /* returns the next missing values */
        this._missing_values.shift();

    check = (value, mark = true) => {
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

    uncheck = value => {
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

    isChecked = value => {
        /* Checks if all value has been already been checked off */
        if(this._isObject(value))
            value = JSON.stringify(value)
        return this._checklist[value]
    }

    /* returns all key values */
    getValues = () => this._values

    /* returns length of all the values */
    valuesCount = () => this._values.length

    isDone = () =>
        /* checks if all the value on the checklist are done */
        Object.values(this._checklist).every(v => v)

    remove = value => {
        /* removes the value from the list */
        if(this._isObject(value)) value = JSON.stringify(value)
        delete this._checklist[value];
        this._calcMissing();
    }

    delete = () =>  {
        /* delete the checklist from disk*/
        this._values = []
        this._checklist = []
        delete_json(this._filename)
    }

    toString = () => {
        /* print the checklist */

    }

}

export default Checklist;
