import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect

// hashing values 
describe('windows ', () => {
    let values = [ '0495120100757  ' ];
    let checklist = new Checklist(values);
    checklist.check(values[0]);
    it('checking same values array', () => {
        let checklist1 = new Checklist(values);
        assert(checklist.isChecked(values[0]), true)
    })
    it('delete', () => {
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});
