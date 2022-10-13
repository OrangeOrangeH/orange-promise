export class OrangePromise1 {
  _fulfillmentTasks = [];
  _rejectionTasks = [];
  _promiseResult = undefined;
  _promiseState = 'pending';

  then(onFulfilled, onRejected) {
    const fulfillmentTask = () => {
      onFulfilled(this._promiseResult);
    };
    const rejectionTasks = () => {
      onRejected(this._promiseResult);
    }
    switch(this._promiseState) {
      case 'pending':
        this._fulfillmentTasks.push(fulfillmentTask);
        this._rejectionTasks.push(rejectionTasks);
        break;
      case 'fulfilled':
        addToTaskQueue(fulfillmentTask);
        break;
      case 'rejected':
        addToTaskQueue(rejectionTasks);
        break;
      default:
        throw new Error();
    }
  }

  resolve(value) {
    console.log('xxx', this._promiseState);
    if(this._promiseState !== 'pending') return this;
    this._promiseState = 'fulfilled';
    this._promiseResult = value;
    this._clearAndEnqueueTask(this._fulfillmentTasks);
    return this; // enable chaining
  }

  reject(error) {
    if(this._promiseState !== 'pending') return this;
    this._promiseState = 'rejected';
    this._promiseResult = error;
    this._clearAndEnqueueTask(this._rejectionTasks);
    return this; // enable chaining
  }

  _clearAndEnqueueTask(tasks) {
    this._fulfillmentTasks = undefined;
    this._rejectionTasks = undefined;
    tasks.map(addToTaskQueue);
  }
}

function addToTaskQueue(task) {
  setTimeout(task, 0);
}