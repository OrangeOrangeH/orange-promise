import * as assert from 'assert';

import { OrangePromise1 } from '../orange-promise1-single.js';
import { OrangePromise2 } from '../orange-promise2-chaining.js';
import { OrangePromise3 } from '../orange-promise3-flattening.js';
import { OrangePromise4 } from '../orange-promise4-exception.js';

thenWorksBeforeAndAfterSettlement(OrangePromise1, OrangePromise2, OrangePromise3, OrangePromise4);

function thenWorksBeforeAndAfterSettlement(...OrangePromiseClasses) {
  for (const OrangePromise of OrangePromiseClasses) {
    test(`Resolving before then() (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.resolve('abc');
      op.then((value) => {
        assert.equal(value, 'abc');
        done();
      })
    });
    test(`Resolving after then() (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.then((value) => {
        assert.equal(value, 'abc');
        done();
      });
      op.resolve('abc');
    });
    test(`Rejecting before then() (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.reject('err');
      op.then(null, (value) => {
        assert.equal(value, 'err');
        done();
      })
    });
    test(`Rejecting after then() (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.then(null, (value) => {
        assert.equal(value, 'err');
        done();
      });
      op.reject('err');
    })
  }
}
