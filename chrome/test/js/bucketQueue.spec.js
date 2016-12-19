import constitute from 'constitute';
import expect from 'expect';

import Store from '../../src/js/store';
import BucketQueue from '../../src/js/bucketQueue';
import { MockStore } from '../testUtil';


describe('BucketQueue', () => {
  let bucketQueue;

  beforeEach(() => {
    const container = new constitute.Container();
    container.bindClass(Store, MockStore);
    bucketQueue = container.constitute(BucketQueue);
  });

  describe('#_getQueue()', () => {
    it('should return the queue', () => {
      const expectedQueue = ['key1', 'key2', 'key3'];
      expectedQueue.forEach((elem, index) => bucketQueue.store.set(index, elem));
      bucketQueue.store.set(bucketQueue._keys.QUEUE_LENGTH, expectedQueue.length);

      const queue = bucketQueue._getQueue();
      expect(queue).toEqual(expectedQueue);
    });

    it('should return an empty queue when no size is set', () => {
      const queue = bucketQueue._getQueue();
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
      bucketQueue._setQueue(queue);

      expect(queue.length).toBe(bucketQueue.getSize());
      queue.forEach((elem, index) => {
        expect(elem).toEqual(bucketQueue.store.get(index));
      });
    });

    it('should remove old elements when setting a smaller queue', () => {
      const oldQueue = [1, 2, 3, 4, 5, 6, 7];
      const newQueue = ['a', 'b', 'c'];
      const startIndex = newQueue.length + 1;
      const endIndex = oldQueue.length - 1;

      bucketQueue._setQueue(oldQueue);
      expect(bucketQueue.getSize()).toBe(oldQueue.length);
      expect(bucketQueue._getQueue()).toEqual(oldQueue);

      bucketQueue._setQueue(newQueue);
      expect(bucketQueue.getSize()).toBe(newQueue.length);
      expect(bucketQueue._getQueue()).toEqual(newQueue);

      for (let i = startIndex; i <= endIndex; i += 1) {
        expect(bucketQueue.store.get(i)).toNotExist();
      }
    });
  });

  describe('#peak()', () => {
    it('should return the first element', () => {
      const queue = [1, 2, 3, 4];
      bucketQueue._setQueue(queue);

      expect(bucketQueue.peak()).toEqual(queue[0]);
      expect(bucketQueue._getQueue()).toEqual(queue);
    });

    it('should work with an empty queue', () => {
      expect(bucketQueue.peak()).toNotExist();
    });
  });

  describe('#remove()', () => {
    it('should remove and return the next entry', () => {
      const queue = [1, 2, 3, 4];
      bucketQueue._setQueue(queue);

      let size = queue.length;
      queue.forEach((elem) => {
        size -= 1;
        expect(bucketQueue.remove()).toEqual(elem);
        expect(bucketQueue.getSize()).toEqual(size);
      });
      expect(bucketQueue.getSize()).toBe(0);
    });

    it('should work with an empty queue', () => {
      expect(bucketQueue.getSize()).toBe(0);
      expect(bucketQueue.remove()).toNotExist();
    });
  });

  describe('#add()', () => {
    it('should add an element', () => {
      const elements = [1, 2, 3, 4, 5, 6];
      expect(bucketQueue.getSize()).toBe(0);
      expect(bucketQueue._getQueue()).toEqual([]);

      elements.forEach((elem, index) => {
        bucketQueue.add(elem);
        expect(bucketQueue.getSize()).toBe(index + 1);
        expect(bucketQueue._getQueue())
          .toEqual(elements.slice(0, index + 1));
      });
    });
  });

  describe('#addAll()', () => {
    it('should add all elements', () => {
      const elementsA = [1, 2, 3];
      const elementsB = ['a', 'b', 'c'];
      expect(bucketQueue.getSize()).toBe(0);
      expect(bucketQueue._getQueue()).toEqual([]);

      bucketQueue.addAll(elementsA);
      expect(bucketQueue.getSize()).toBe(elementsA.length);
      expect(bucketQueue._getQueue()).toEqual(elementsA);

      bucketQueue.addAll(elementsB);
      expect(bucketQueue.getSize())
        .toBe(elementsA.length + elementsB.length);
      expect(bucketQueue._getQueue()).toEqual(elementsA.concat(elementsB));
    });
  });

  describe('#get()', () => {
    it('should return the element at the given index', () => {
      const queue = [1, 2, 3, 4, 5];
      bucketQueue._setQueue(queue);
      queue.forEach((elem, index) => {
        expect(bucketQueue.get(index)).toEqual(elem);
      });
    });

    it('should return undefined when no element exist at this index', () => {
      expect(bucketQueue.get(1)).toNotExist();
      expect(bucketQueue.get(13)).toNotExist();
    });
  });

  describe('#update()', () => {
    it('should update the element at the given index', () => {
      const queue = [1, 2, 3, 4, 5];
      const expectedA = [1, 2, 'a', 4, 5];
      const expectedB = [1, 2, 'a', 4, 'b'];
      const expectedC = ['c', 2, 'a', 4, 'b'];
      bucketQueue._setQueue(queue);

      bucketQueue.update(2, 'a');
      expect(bucketQueue._getQueue()).toEqual(expectedA);
      bucketQueue.update(4, 'b');
      expect(bucketQueue._getQueue()).toEqual(expectedB);
      bucketQueue.update(0, 'c');
      expect(bucketQueue._getQueue()).toEqual(expectedC);
    });

    it('should throw a RangeError when updating an invalid index', () => {
      const queue = [1, 2, 3];
      bucketQueue._setQueue(queue);

      expect(() => bucketQueue.update(10)).toThrow(RangeError);
      expect(() => bucketQueue.update(-1)).toThrow(RangeError);
    });
  });

  describe('#_clearBuckets()', () => {
    it('should clear all buckets and reset the size', () => {
      const queue = [1, 2, 3, 4];
      bucketQueue._setQueue(queue);
      expect(bucketQueue._getQueue()).toEqual(queue);
      expect(bucketQueue.getSize()).toBe(queue.length);

      bucketQueue._clearBuckets();
      expect(bucketQueue._getQueue()).toEqual([]);
      expect(bucketQueue.getSize()).toBe(0);
    });
  });
});
