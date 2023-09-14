import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect
import tmp from 'tmp';

describe('test whether the shuffle option is false', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let checklist = new Checklist( values, { 
        name: 'shuffle test false',
        shuffle: false,
    });
    // values done
    it('Shuffle false, Array consevers order', () =>{
        let list_from_checklist = []
        for (let i = 0; i < values.length; i++) 
            list_from_checklist.push(checklist.next())
        assert.deepEqual(list_from_checklist, values)
    })
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});

describe('test whether the shuffle option is true', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let checklist = new Checklist( values, { 
        name: 'shuffle test true',
        shuffle: true,
    });
    it('Shuffle true, Array does not consevers order', () =>{
        let list_from_checklist = []
        for (let i = 0; i < values.length; i++) 
            list_from_checklist.push(checklist.next())
        assert.notDeepEqual(list_from_checklist, values)
    })
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});
