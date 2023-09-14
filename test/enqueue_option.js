import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect
import tmp from 'tmp';

describe('Enqueue option', () => {
    let values = [ '🥚 eggs', '🍎 apple', '🥩 ham', '🧀 cheese', '🥦 broccoli' ];
    let repited_values = [ '🥚 eggs', '🍎 apple', '🥩 ham', '🧀 cheese', '🥦 broccoli',
        '🥚 eggs', '🍎 apple', '🥩 ham', '🧀 cheese', '🥦 broccoli' ];
    let checklist = new Checklist( values, { 
        name: 'enqueue option',
        enqueue: true, // default
    });
    let next_list = [];
    for (let i = 0; i < 10; i++) 
        next_list.push(checklist.next())
    // values done
    it('check if it filters non unique values', () => {
        assert.deepEqual(next_list, repited_values);
    })
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});

