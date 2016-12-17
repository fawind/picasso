import expect from 'expect';

import Store from '../../src/js/store';
import BucketQueue from '../../src/js/bucketQueue';

const KEYS = BucketQueue._getKeys();

describe('BucketQueue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('#_getQueue()', () => {
    it('should return the queue', () => {
      const expectedQueue = ['key1', 'key2', 'key3'];
      expectedQueue.forEach((elem, index) => Store.set(index, elem));
      Store.set(KEYS.QUEUE_LENGTH, expectedQueue.length);

      const queue = BucketQueue._getQueue();
      expect(queue).toEqual(expectedQueue);
    });

    it('should return an empty queue when no size is set', () => {
      const queue = BucketQueue._getQueue();
      expect(queue).toEqual([]);
    });
  });

  describe('#_setQueue()', () => {
    it('should set the queue in the buckets', () => {
      const queue = [
        { key: 1, val: '1' },
        { key: 2, val: '2' },
        { key: 3, val: '3' },
      ];
      BucketQueue._setQueue(queue);

      expect(queue.length).toBe(BucketQueue.getSize());
      queue.forEach((elem, index) => {
        expect(elem).toEqual(Store.get(index));
      });
    });

    it('should remove old elements when setting a smaller queue', () => {
      const oldQueue = [1, 2, 3, 4, 5, 6, 7];
      const newQueue = ['a', 'b', 'c'];
      const startIndex = newQueue.length + 1;
      const endIndex = oldQueue.length - 1;

      BucketQueue._setQueue(oldQueue);
      expect(BucketQueue.getSize()).toBe(oldQueue.length);
      expect(BucketQueue._getQueue()).toEqual(oldQueue);

      BucketQueue._setQueue(newQueue);
      expect(BucketQueue.getSize()).toBe(newQueue.length);
      expect(BucketQueue._getQueue()).toEqual(newQueue);

      for (let i = startIndex; i <= endIndex; i += 1) {
        expect(Store.get(i)).toNotExist();
      }
    });
  });

  describe('#peak()', () => {
    it('should return the first element', () => {
      const queue = [1, 2, 3, 4];
      BucketQueue._setQueue(queue);

      expect(BucketQueue.peak()).toEqual(queue[0]);
      expect(BucketQueue._getQueue()).toEqual(queue);
    });

    it('should work with an empty queue', () => {
      expect(BucketQueue.peak()).toNotExist();
    });
  });

  describe('#remove()', () => {
    it('should remove and return the next entry', () => {
      const queue = [1, 2, 3, 4];
      BucketQueue._setQueue(queue);

      let size = queue.length;
      queue.forEach((elem) => {
        size -= 1;
        expect(BucketQueue.remove()).toEqual(elem);
        expect(BucketQueue.getSize()).toEqual(size);
      });
      expect(BucketQueue.getSize()).toBe(0);
    });

    it('should work with an empty queue', () => {
      expect(BucketQueue.getSize()).toBe(0);
      expect(BucketQueue.remove()).toNotExist();
    });
  });

  describe('#add()', () => {
    it('should add an element', () => {
      const elements = [1, 2, 3, 4, 5, 6];
      expect(BucketQueue.getSize()).toBe(0);
      expect(BucketQueue._getQueue()).toEqual([]);

      elements.forEach((elem, index) => {
        BucketQueue.add(elem);
        expect(BucketQueue.getSize()).toBe(index + 1);
        expect(BucketQueue._getQueue())
          .toEqual(elements.slice(0, index + 1));
      });
    });
  });

  describe('#addAll()', () => {
    it('should add all elements', () => {
      const elementsA = [1, 2, 3];
      const elementsB = ['a', 'b', 'c'];
      expect(BucketQueue.getSize()).toBe(0);
      expect(BucketQueue._getQueue()).toEqual([]);

      BucketQueue.addAll(elementsA);
      expect(BucketQueue.getSize()).toBe(elementsA.length);
      expect(BucketQueue._getQueue()).toEqual(elementsA);

      BucketQueue.addAll(elementsB);
      expect(BucketQueue.getSize())
        .toBe(elementsA.length + elementsB.length);
      expect(BucketQueue._getQueue()).toEqual(elementsA.concat(elementsB));
    });
  });

  describe('#get()', () => {
    it('should return the element at the given index', () => {
      const queue = [1, 2, 3, 4, 5];
      BucketQueue._setQueue(queue);
      queue.forEach((elem, index) => {
        expect(BucketQueue.get(index)).toEqual(elem);
      });
    });

    it('should return undefined when no element exist at this index', () => {
      expect(BucketQueue.get(1)).toNotExist();
      expect(BucketQueue.get(13)).toNotExist();
    });
  });

  describe('#update()', () => {
    it('should update the element at the given index', () => {
      const queue = [1, 2, 3, 4, 5];
      const expectedA = [1, 2, 'a', 4, 5];
      const expectedB = [1, 2, 'a', 4, 'b'];
      const expectedC = ['c', 2, 'a', 4, 'b'];
      BucketQueue._setQueue(queue);

      BucketQueue.update(2, 'a');
      expect(BucketQueue._getQueue()).toEqual(expectedA);
      BucketQueue.update(4, 'b');
      expect(BucketQueue._getQueue()).toEqual(expectedB);
      BucketQueue.update(0, 'c');
      expect(BucketQueue._getQueue()).toEqual(expectedC);
    });

    it('should throw a RangeError when updating an invalid index', () => {
      const queue = [1, 2, 3];
      BucketQueue._setQueue(queue);

      expect(() => BucketQueue.update(10)).toThrow(RangeError);
      expect(() => BucketQueue.update(-1)).toThrow(RangeError);
    });
  });

  describe('#_clearBuckets()', () => {
    it('should clear all buckets and reset the size', () => {
      const queue = [1, 2, 3, 4];
      BucketQueue._setQueue(queue);
      expect(BucketQueue._getQueue()).toEqual(queue);
      expect(BucketQueue.getSize()).toBe(queue.length);

      BucketQueue._clearBuckets();
      expect(BucketQueue._getQueue()).toEqual([]);
      expect(BucketQueue.getSize()).toBe(0);
    });
  });
});
