import fs from 'fs';
import osPath from 'path';
import parsePath from '../utils/parsePath.js';      
import { Mutex } from 'async-mutex';
import jsonsStorage from './modules/jsonsStorage.js';
import cvsStorage from './modules/cvsStorage.js';
import sqliteStorage from './modules/sqliteStorage.js';
import jsonStorage from './modules/jsonStorage.js';

/*
// hash a new name based on the values
this._name = ( name ? name :  
    hash(values, { unorderedArrays: true } )) + ".json"

let tmp_path = '';
// if it is windows, set the tmp path to the user temp folder
if(os.platform() === 'win32') tmp_path = os.tmpdir();
// if it is on linux, set the tmp path to /tmp/checklists
else if(os.platform() === 'linux') tmp_path = '/tmp/';
// if it is on mac, set the tmp path to /tmp/checklists
else if(os.platform() === 'darwin') tmp_path = '/tmp/';

// try to read the file from memeory
try{  // get the check list form memory
    let string_file = fs.readFileSync(this._filename);
    let json_list = JSON.parse(string_file);
    // shuffe if is enabled
    if(shuffle) 
        json_list = [ ...json_list].sort(() => Math.random() - 0.5);
    this._checklist = new Map(json_list);
}catch(e){ // otherwise make a new checklist
    this._checklist = new Map();
}

// if you want to mantain the original missing list of value after checks
        this._filename = osPath.join( this._tmp_path, this._name);

// if custom path is not defined
       if(path === undefined) // make a tmp folder
            this._tmp_path = tmp_path
        else // set the directory path
            this._tmp_path = path
*/

class Storage {
    constructor({ type, path, keyValue }) {
        this.keyValue = keyValue;
        this.path = path;
        this.type = type;
    }

    open(name) {
        return new Store({ 
            type: this.type, 
            path: this.path,
            keyValue: this.keyValue,
            name: name
        });
    }
}


class Store {
    constructor({ type, path, keyValue, name }) {
        // handle type
        if(type === 'json') 
            this.storage = new jsonStorage(path);
        else if(type === 'jsons')
            this.storage = new jsonsStorage(path);
        else if(type === 'cvs')
            this.storage = new cvsStorage(path);
        else if(type === 'sqlite')
            this.storage = new sqliteStorage(path);
        // handle path
        if(path){
            let { dir, name } = parsePath(path);
            // if path is not an dir
            if(name === 'file') throw new Error('path must be a directory');
            // if path is dir
            path = dir;
        } else  // working dir + /sotrage
            path = osPath.join(process.cwd(), 'storage');
        // create the directory if it does not exist
        if(!fs.existsSync(path)) fs.mkdirSync(path);
        // directory with name
        path = osPath.join(path, name);
        // if the file does not exist
        if(!fs.existsSync(path)) fs.mkdirSync(path);
        
        // handle mutex
        this.mutex = new Mutex();

    }

    set(first, second) {
        if(this.keyValue) {
            let key = first;
            let value = second;
            this.storage.set(key, value);
        } else {
            let key = ++index;
            let value = first;
            this.storage.set(key, value);
        }
    }

    get(key) {
        return this.storage.getItem(key);
    }

    getAll() {
        return this.storage.getItem(key);
    }

    remove(key) {
        this.storage.removeItem(key);
    }

    clear(key) {
        this.storage.clear();
    }
    delete() {
        fs.unlinkSync(this._filename);
    }
}
