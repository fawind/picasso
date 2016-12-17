import Store from './store';


const KEYS = {
  QUEUE_LENGTH: 'queue-length',
};

export default class BucketQueue {

  static peak() {
    const queue = BucketQueue._getQueue();
    if (queue.length === 0) {
      return undefined;
    }
    return queue[0];
  }

  static remove() {
    const queue = BucketQueue._getQueue();
    const entry = queue.shift();
    BucketQueue._setQueue(queue);
    return entry;
  }

  static add(entry) {
    const queue = BucketQueue._getQueue();
    queue.push(entry);
    BucketQueue._setQueue(queue);
  }

  static addAll(entries) {
    const queue = BucketQueue._getQueue();
    BucketQueue._setQueue(queue.concat(entries));
  }

  static get(index) {
    return Store.get(index);
  }

  static update(index, elem) {
    if (index >= BucketQueue.getSize() || index < 0) {
      throw new RangeError('Index is out of range.');
    }
    Store.set(index, elem);
  }

  static getSize() {
    return Store.get(KEYS.QUEUE_LENGTH) || 0;
  }

  static _setSize(size) {
    Store.set(KEYS.QUEUE_LENGTH, size);
  }

  static _getQueue() {
    const queue = [];
    for (let i = 0; i < BucketQueue.getSize(); i++) {
      queue.push(BucketQueue._getBucket(i));
    }
    return queue;
  }

  static _setQueue(queue) {
    BucketQueue._clearBuckets();
    queue.forEach((entry, i) => BucketQueue._setBucket(i, entry));
    BucketQueue._setSize(queue.length);
  }

  static _clearBuckets() {
    for (let i = 0; i < BucketQueue.getSize(); i++) {
      BucketQueue._setBucket(i, null);
    }
    BucketQueue._setSize(0);
  }

  static _getBucket(index) {
    return Store.get(index) || {};
  }

  static _setBucket(index, entry) {
    Store.set(index, entry);
  }

  static _getKeys() {
    return KEYS;
  }
}
