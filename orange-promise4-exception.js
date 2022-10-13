// features:
// Turn exceptions in user code into rejections

export class OrangePromise4 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = 'pending';
  _settledOrLockedIn = false;

  then(onFulfilled, onRejected) {
    const resultPromise = new OrangePromise4();

    // Runs if the Promise is fulfilled(now or later)
    const fulfillmentTask = () => {
      if (typeof onFulfilled === 'function') {
        this._runReactionSafely(resultPromise, onFulfilled); // [new]
      } else {
        // `onFulfilled` is missing
        // => we must pass on the fulfillment value
        resultPromise.resolve(this._promiseResult);
      }
    }

    const rejectionTask = () => {
      if (typeof onRejected === 'function') {
        this._runReactionSafely(resultPromise, onRejected);
      } else {
        // `onRejected` is missing
        // => we must pass on the rejection value
        resultPromise.reject(this._promiseResult);
      }
    }

    switch (this._promiseState) {
      // TODO: figure out when tasks in _fulfillmentTasks called?
      case 'pending':
        this._fulfillmentTasks.push(fulfillmentTask);
        this._rejectionTasks.push(rejectionTask);
        break;
      case 'fulfilled':
        addToTaskQueue(fulfillmentTask);
        break;
      case 'rejected':
        addToTaskQueue(rejectionTask);
      default:
        throw new Error();
    }
    return resultPromise;
  }

  _runReactionSafely(resultPromise, reaction) {// [new]
    try {
      let returned = reaction(this._promiseResult);
      resultPromise.resolve(returned);
    } catch (e) {
      resultPromise.reject(e);
    }
  }

  resolve(value) {
    if (this._settledOrLockedIn) return this;
    this._settledOrLockedIn = true;
    this._coreResolve(value);
    return this;
  }

  _coreResolve(value) {
    // Is `value` a thenable?
    if (typeof value === 'object' && value !== null && 'then' in value) {
       // Forward fulfillments and rejections from `value` to `this`.
      // The callbacks are always executed asynchronously
      value.then(
        (result) => this._coreResolve(result),
        (error) => this._coreReject(error));
    } else {
      this._promiseState = 'fulfilled';
      this._promiseResult = value;
      this._clearAndEnqueueTasks(this._fulfillmentTasks);
    }
  }

  reject(error) {
    if (this._settledOrLockedIn) return this;
    this._settledOrLockedIn = true;
    this._coreReject(error);
    return this;
  }

  // Only a separate method because it’s called from ._coreResolve()
  _coreReject(error) {
    this._promiseState = 'rejected';
    this._promiseResult = error;
    this._clearAndEnqueueTasks(this._rejectionTasks);
  }

  _clearAndEnqueueTasks(tasks) {
    this._fulfillmentTasks = undefined;
    this._rejectionTasks = undefined;
    task.map(addToTaskQueue);
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0)
}