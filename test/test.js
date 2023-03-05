import Checklist from '../index.js'
import assert from 'assert';
import chai from 'chai';
const expect = chai.expect

//slogan when you need to keep track of things persitetly

// test adding values
describe('basic functionality', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let other_values = [ '🥓 bacon' ];
    let checklist = new Checklist(values, { 
        //name: 'basic_functionality',
    });
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
        checklist.add(other_values[0])
        expect(checklist.getValues()).to.include(other_values[0])
    })
    // remove
    it('remove()', () => {
        checklist.remove(other_values[0])
        expect(checklist.getValues()).to.not.include(other_values[0])
    })
    // isDone
    it('isDone()', () => 
        expect(checklist.isDone()).to.equal(false)
    )
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});


// hashing values 
describe('hashing', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let values_unsorted = [ '🥩 ham', '🍎 apple', '🧀 cheese',  '🥦 broccoli', '🥚 eggs' ];
    let checklist = new Checklist(values);
    checklist.check(values[1]);
    it('checking same values array', () => { 
        let checklist1 = new Checklist(values);
        assert(checklist.isChecked(values[1]), true)
    })
    it('difrently sorted array', () => { 
        let checklist1 = new Checklist(values_unsorted);
        assert(checklist.isChecked(values[1]), true)
    })
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.isChecked(values[1]), null);
    })
});

// test adding values
describe('adding and removing multiple values', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let add_values = [ '🥓 bacon', '🍞 Bread', '🍆 Eggplant', '🥛 Milk']
    let remove_values = [  '🥚 eggs', '🥩 ham', '🥓 bacon', '🍞 Bread', '🥛 Milk']
    let checklist = new Checklist(values, { name: 'adding_removing' });
    it('adding multiple', () => { 
        checklist.add(add_values)
        assert.deepEqual( 
            checklist.getValues(), 
            values.concat(add_values)
        )
    })
    it('remove multiple', () => { 
        checklist.remove(remove_values)
        assert.deepEqual( 
            checklist.getValues(), 
            values.concat(add_values).filter(e => !remove_values.includes(e))
        )
    })
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.nextMissing(), undefined);
    })
});

// finishing check list
describe('finishing checklist', () => {
    let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
    let checklist = new Checklist(values, { name: 'finishing_values'});
    it('nextMissing()', () => { 
        let value = checklist.nextMissing();
        checklist.check(value);
        assert.equal(value, values[0]);
    });
    it('nextMissing()', () => { 
        let value = checklist.nextMissing();
        checklist.check(value);
        assert.equal(value, values[1]);
    });
    it('nextMissing()', () => { 
        let value = checklist.nextMissing();
        checklist.check(value);
        assert.equal(value, values[2]);
    });
    it('nextMissing()', () => { 
        let value = checklist.nextMissing();
        checklist.check(value);
        assert.equal(value, values[3]);
    });
    it('nextMissing()', () => { 
        let value = checklist.nextMissing();
        checklist.check(value);
        assert.equal(value, values[4]);
    });
    it('nextMissing()', () => { 
        let value = checklist.nextMissing();
        checklist.check(value);
        assert.equal(value, undefined);
    });
    it('isDone()', () => 
        assert.equal(checklist.isDone(), true)
    );
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.nextMissing(), undefined);
    })
});

// test recalc on check
describe('recalc_on_check option', () => {
    describe('recalc_on_check is false', () => {
        let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
        let checklist = new Checklist(values, { 
            name: 'recalc_on_check',
            recalc_on_check: false
        });
        let value0 = checklist.nextMissing();
        let value1 = checklist.nextMissing();
        let value2 = checklist.nextMissing();
        checklist.check(value1);
        it('nextMissing()', () => { 
            let value = checklist.nextMissing();
            assert.equal(value, values[3]);
        });
        it('nextMissing()', () => { 
            checklist.check(value2);
            let value = checklist.nextMissing();
            assert.equal(value, values[4]);
        });
        it('delete', () => { 
            checklist.delete();
            assert.deepEqual(checklist.nextMissing(), undefined);
        })
    });
    describe('recalc_on_check is true', () => {
        let values = [ '🥚 eggs', '🥩 ham', '🧀 cheese', '🍎 apple', '🥦 broccoli' ];
        let checklist = new Checklist(values, { 
            name: 'recalc_on_check',
            recalc_on_check: true
        });
        let value0 = checklist.nextMissing();
        let value1 = checklist.nextMissing();
        let value2 = checklist.nextMissing();
        checklist.check(value1);
        it('nextMissing()', () => { 
            let value = checklist.nextMissing();
            assert.equal(value, values[0]);
        });
        it('nextMissing()', () => { 
            checklist.check(value2);
            let value = checklist.nextMissing();
            assert.equal(value, values[0]);
        });
        it('delete', () => { 
            checklist.delete();
            assert.deepEqual(checklist.nextMissing(), undefined);
        })
    });
});

// TODO: retain the file structure in the checklist
// test difrent types of values in input value array
/*
describe('diffrent type of values', () => {
    let values = [ 
        'string',  // string
        12, // int
        8.3, // float
        {'some':'obj'}, // obj
        ['s', 2, { 'a':'s'} ] // list
    ];
    let other_values = [ {'🥓':'bacon'} ];
    let checklist = new Checklist(values, { 
        name: 'diffrent_values',
    });
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
    it('getMissingValues()', () => {
        console.log(checklist.getMissingValues())
        assert.deepEqual(
            checklist.getMissingValues(), 
            values
            .filter(e => e !== values[1])
        )
    })
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
        checklist.add(other_values[0])
        expect(checklist.getValues()).to.include(other_values[0])
    })
    // remove
    it('remove()', () => {
        checklist.remove(other_values[0])
        expect(checklist.getValues()).to.not.include(other_values[0])
    })
    // isDone
    it('isDone()', () => 
        expect(checklist.isDone()).to.equal(false)
    )
    it('delete', () => { 
        checklist.delete();
        assert.deepEqual(checklist.getValues(), []);
    })
});
*/

