import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect

let values = [ 
'🥚 eggs',
'🥩 ham',
'🧀 cheese',
'🍎 apple',
'🥦 broccoli',
]

//slogan when you need to keep track of things persitetly
//

// test adding values
describe('basic functionality', () => {
    let checklist = new Checklist(values);
    checklist.check(values[1])
    it('check(value)', () => {
        let value = checklist._checklist[values[1]]
        assert.equal(value , true)
    })
    // isChecked
    it('uncheck()', () => 
        assert.equal(checklist.isChecked(values[1]), true)
    )
    // values done
    it('valuesDone()', () => 
        assert.equal(checklist.valuesDone(), 1)
    )
    // get missing values
    it('getMissingValues()', () => 
        assert.deepEqual(
            checklist.getMissingValues(), 
            values.filter(e => e !== values[1])
        )
    )
    // missing left()
    it('missingLeft()', () => 
        assert.equal(checklist.missingLeft(), 4)
    )
    // next missing()
    it('nextMissing()', () => 
        assert.equal(checklist.nextMissing(), values[0])
    )
    // uncheck
    it('uncheck()', () => {
        checklist.uncheck(values[1])
        assert.equal(checklist.isChecked(values[1]), false)
    })
    // getValues
    it('getValues()', () => {
        assert.deepEqual(checklist.getValues(), values)
    })
    // valuesCount
    it('valuesCount()', () => {
        assert.equal(checklist.valuesCount(), 5)
    })
    // add
    it('add()', () => {
        checklist.add('🥓 bacon')
        expect(checklist.getValues()).to.include('🥓 bacon')
    })
    // remove
    it('remove()', () => {
        checklist.remove('🥓 bacon')
        console.log(checklist.getValues())
        expect(checklist.getValues()).to.not.include('🥓 bacon')
    })
    

    


});
// test 
//


// test recalc on check

//test saves to disk

//test accept ay tyoe of value
