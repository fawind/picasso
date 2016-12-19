import Store from './store';

export default class BucketQueue {

  static constitute() { return [Store]; }

  constructor(store) {
    this.store = store;
    this._keys = {
      QUEUE_LENGTH: 'queue_size',
    };
  }

  peak() {
    const queue = this._getQueue();
    if (queue.length === 0) {
      return undefined;
    }
    return queue[0];
  }

  remove() {
    const queue = this._getQueue();
    const entry = queue.shift();
    this._setQueue(queue);
    return entry;
  }

  add(entry) {
    const queue = this._getQueue();
    queue.push(entry);
    this._setQueue(queue);
  }

  addAll(entries) {
    const queue = this._getQueue();
    this._setQueue(queue.concat(entries));
  }

  get(index) {
    return this.store.get(index);
  }

  update(index, elem) {
    if (index >= this.getSize() || index < 0) {
      throw new RangeError('Index is out of range.');
    }
    this.store.set(index, elem);
  }

  getSize() {
    return this.store.get(this._keys.QUEUE_LENGTH) || 0;
  }

  _setSize(size) {
    this.store.set(this._keys.QUEUE_LENGTH, size);
  }

  _getQueue() {
    const queue = [];
    for (let i = 0; i < this.getSize(); i += 1) {
      queue.push(this.get(i));
    }
    return queue;
  }

  _setQueue(queue) {
    this._clearBuckets();
    queue.forEach((entry, i) => this._setBucket(i, entry));
    this._setSize(queue.length);
  }

  _clearBuckets() {
    for (let i = 0; i < this.getSize(); i += 1) {
      this.store.remove(i);
    }
    this._setSize(0);
  }

  _setBucket(index, entry) {
    this.store.set(index, entry);
  }
}
