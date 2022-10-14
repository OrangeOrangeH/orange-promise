import * as assert from 'assert';

import { OrangePromise1 } from '../orange-promise1-single.js';
import { OrangePromise2 } from '../orange-promise2-chaining.js';
import { OrangePromise3 } from '../orange-promise3-flattening.js';
import { OrangePromise4 } from '../orange-promise4-exception.js';

thenWorksBeforeAndAfterSettlement(OrangePromise1, OrangePromise2, OrangePromise3, OrangePromise4);
youCanOnlySettleOnce(OrangePromise1, OrangePromise2, OrangePromise3, OrangePromise4);
simpleChaining(OrangePromise2, OrangePromise3, OrangePromise4)
flatteningPromise(OrangePromise3, OrangePromise4);
rejectingByThrowingInReactions(OrangePromise4);

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
    // 这里 then 也能拿到写在后面的 resolve 的值
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

function youCanOnlySettleOnce(...OrangePromises) {
  for (const OrangePromise of OrangePromises) {
    test(`You can only resolve once (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.resolve('first');
      op.then((value) => {
        assert.equal(value, 'first');
        op.resolve('second');
        op.then((value) => {
          assert.equal(value, 'first');
          done();
        });
      });
    });
    test(`You can only reject once (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.reject('firstError');
      op.then(null, (value) => {
        assert.equal(value, 'firstError');
        op.reject('secondError');
        op.then(null, (value) => {
          assert.equal(value, 'firstError'); // unchanged
          done();
        });
      });
    });
  }
}


function simpleChaining(...OrangePromiseClasses) {
  for (const OrangePromise of OrangePromiseClasses) {
    test(`Fulfilling via onFulfilled (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.resolve();
      op
        .then(value1 => {
          assert.equal(value1, undefined);
          return 123;
        })
        .then((value2) => {
          assert.equal(value2, 123);
          done();
        });
    });
    test(`Fulfilling via onRejected (${OrangePromise.name})`, (done) => {
      const op = new OrangePromise;
      op.reject();
      op
        .then(null, (reason) => {
          assert.equal(reason, undefined);
          return 123;
        })
        .then((value) => {
          assert.equal(value, 123);
          done();
        });
    });
    test(`Missing onFulfilled is skipped ($(orangePromise.name})`, (done) => {
      const op = new OrangePromise();
      op.resolve('a');
      op
        .then((value1) => {
          assert.equal(value1, 'a');
          return 'b';
        })
        // Missing onFulfilled: value is passed on to next .then();
        .then(null, (reason) => {
          // Never called
          assert.fail();
        })
        .then(value2 => {
          assert.equal(value2, 'b');
          done();
        })
    });
  }
}

function flatteningPromise(...OrangePromiseClasses) {
  for(const OrangePromise of OrangePromiseClasses) {
    test(`Chaining with a promise (${OrangePromise.name})`, (done) => {
      const op1 = new OrangePromise();
      const op2 = new OrangePromise();
      op1.resolve(op2);
      op2.resolve(123);
      op1.then((value) => {
        assert.equal(value, 123);
        done();
      });
    });
  }
}

function rejectingByThrowingInReactions(...OrangePromiseClasses) {
  for (const OrangePromise of OrangePromiseClasses) {
    test(`Rejecting via onFulfilled (${OrangePromise.name})`, (done) => {
      let myError;
      const op = new OrangePromise();
      op.resolve();
      op
        .then((value) => {
          assert.equal(value, undefined);
          throw myError = new Error();
        })
        .catch((reason) => {
          assert.equal(reason, myError);
          done();
        });
    });
    test(`Rejecting via onRejected (${OrangePromise.name})`, (done) => {
      let myError;
      const op = new OrangePromise();
      op.reject();
      op
        .catch((reason1) => {
          assert.equal(reason1, undefined);
          throw myError = new Error();
        })
        .catch((reason2) => {
          assert.equal(reason2, myError);
          done();
        })
    })
  }
}

