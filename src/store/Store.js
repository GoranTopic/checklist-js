import { Level } from 'level';
import deasync from 'deasync';
import lz from 'lz-string';


class Store {
    /* let make a storage class that will store the data in the database */
    constructor(path){
        this.db = new Level('example', { valueEncoding: 'json' })
    }
    
    put(key, value){
        key = this._compress(key);
        // Put a value
        return this.db.put(key, value, (err) => {
            if (err) throw err;
        });
    }

    get(key, value){
        // get a value
        key = this._compress(key);
        return this.db.get(key, value, (err) => {
            if (err) throw err;
        });
    }
    
    delete(key){
        // Put a value
        key = this._compress(key);
        return this.db.del(key, (err) => {
            if (err) throw err;
        });
    }

    all(){
        let isFinished = false;
        let all = [];
        this.db.createReadStream({ keys: false, values: true })
            .on('data', function(data) {
                all.push({key: data.key, value: data.value});
            })
            .on('error', function(err) {
                console.error('Error:', err);
                isFinished = true;
            })
            .on('end', function() {
                isFinished = true;
            });
        // Busy-wait loop (not recommended!)
        while (!isFinished) 
            deasync.sleep(100); // Sleeps for 100ms
       return all; 
    }

    _compress = input => 
        lz.compressToBase64(input);

    _decompress = input => 
        lz.decompressFromBase64(input);

}

export default Store;
