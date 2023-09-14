import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect
import tmp from 'tmp';

describe('test uinqueness', () => {
    let values_not_unique = [ '🥚 eggs', '🍎 apple', '🥩 ham', '🧀 cheese', 
        '🍎 apple', '🧀 cheese', '🥦 broccoli', '🥦 broccoli' ];
    let values_unique = [ '🥚 eggs', '🍎 apple', '🥩 ham', '🧀 cheese', '🥦 broccoli' ];
    let checklist = new Checklist( values_not_unique, { 
        name: 'unique test',
        unique: true,
    });
    // values done
    it('check if it filters non unique values', () =>{
        assert.deepEqual(checklist.getValues(), values_unique)
    })
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});

