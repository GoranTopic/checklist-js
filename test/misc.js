import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect
import tmp from 'tmp';

describe('return 0 when there are no done values', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let checklist = new Checklist(values, { 
        name: 'return 0 when done is empty',
    });
    // values done
    it('valuesDone() === 0', () => 
        assert.equal(checklist.valuesDone(), 0)
    )
});
