import constitute from 'constitute';
import expect from 'expect';

import Store from '../../src/js/store';
import BucketQueue from '../../src/js/bucketQueue';
import ImageStore from '../../src/js/imageStore';
import { MockStore } from '../testUtil';

describe('ImageStore', () => {
  let imageStore;
  let bucketQueue;
  let mockImages;

  beforeEach(() => {
    const container = new constitute.Container();
    container.bindClass(Store, MockStore);
    container.bindClass(BucketQueue, BucketQueue);
    imageStore = container.constitute(ImageStore);
    bucketQueue = imageStore.queue;

    mockImages = [
      { title: 'TitleA', artistName: 'Picasso', image: 'url' },
      { title: 'TitleB', artistName: 'Picasso', image: 'url' },
      { title: 'TitleC', artistName: 'Monet', image: 'url' },
    ];
  });

  describe('#getCurrentImage()', () => {
    it('should return the next image in the queue', () => {
      bucketQueue._setQueue(mockImages);
      expect(imageStore.getCurrentImage()).toEqual(mockImages[0]);
    });

    it('should return undefined when no images are set', () => {
      expect(imageStore.getCurrentImage()).toBe(undefined);
    });
  });

  describe('#skipCurrentImage()', () => {
    it('should remove the current image from the queue', () => {
      bucketQueue._setQueue(mockImages);
      mockImages.forEach((image, index) => {
        expect(imageStore.getCurrentImage()).toEqual(mockImages[index]);
        expect(imageStore.getImagesCount()).toBe(mockImages.length - index);
        imageStore.skipCurrentImage();
      });
    });

    it('should work when no images are set', () => {
      expect(() => imageStore.skipCurrentImage()).toNotThrow();
    });
  });

  describe('#addImages()', () => {
    it('should add all images to the queue', () => {
      const newImages = [
        { title: 'Title1', artist: 'Klee', image: 'url' },
        { title: 'Title2', artist: 'Klee', image: 'url' },
      ];
      bucketQueue._setQueue(mockImages);

      imageStore.addImages(newImages);
      expect(imageStore.getImagesCount()).toBe(mockImages.length + newImages.length);
      expect(bucketQueue._getQueue()).toEqual(mockImages.concat(newImages));
    });

    it('should work when queue is empty', () => {
      const newImages = [
        { title: 'Title1', artist: 'Klee', image: 'url' },
        { title: 'Title2', artist: 'Klee', image: 'url' },
      ];
      imageStore.addImages(newImages);
      expect(imageStore.getImagesCount()).toBe(newImages.length);
      expect(bucketQueue._getQueue()).toEqual(newImages);
    });
  });

  describe('#getImagesCount()', () => {
    it('should return the count of images in the queue', () => {
      expect(imageStore.getImagesCount()).toBe(0);
      bucketQueue._setQueue(mockImages);
      expect(imageStore.getImagesCount()).toBe(mockImages.length);
      bucketQueue.add({ title: 'newTitle', artist: 'newArtist' });
      expect(imageStore.getImagesCount()).toBe(mockImages.length + 1);
    });
  });

  describe('#getUncachedImages()', () => {
    it('should return images and their index without a dataUri', () => {
      const images = [
        { title: 'TitleA', artistName: 'Picasso', image: 'url', dataUri: 'asd' },
        { title: 'TitleB', artistName: 'Picasso', image: 'url', dataUri: 'zxc' },
        { title: 'TitleC', artistName: 'Monet', image: 'url' },
        { title: 'TitleD', artistName: 'Monet', image: 'url', dataUri: 'zxc' },
        { title: 'TitleE', artistName: 'Monet', image: 'url' },
      ];
      const expectedImages = [
        { index: 2, image: images[2] },
        { index: 4, image: images[4] },
      ];
      imageStore._IMAGES_TO_DOWNLOAD = images.length;
      bucketQueue._setQueue(images);
      expect(imageStore.getUncachedImages()).toEqual(expectedImages);
    });
  });

  describe('#updateCachedImage', () => {
    it('should update the image at the given index', () => {
      bucketQueue._setQueue(mockImages);
      const imageA = { title: 'NewTitleA', artistName: 'Artist' };
      const imageB = { title: 'NewTitleB', artistName: 'Artist' };

      imageStore.updateCachedImage(0, imageA);
      mockImages[0] = imageA;
      expect(bucketQueue._getQueue()).toEqual(mockImages);
      imageStore.updateCachedImage(2, imageB);
      mockImages[2] = imageB;
      expect(bucketQueue._getQueue()).toEqual(mockImages);
    });

    it('should throw a RangeError when setting an invalid index', () => {
      bucketQueue._setQueue(mockImages);
      expect(() => imageStore.updateCachedImage(10, {})).toThrow(RangeError);
      expect(() => imageStore.updateCachedImage(-1, {})).toThrow(RangeError);
    });
  });

  describe('#currentImageIsExpired()', () => {
    it('should return false if last updated is the current day', () => {
      const currentDay = 12;
      expect.spyOn(imageStore, '_getDay').andReturn(currentDay);
      imageStore.store.set(imageStore._keys.LAST_UPDATED, currentDay);
      expect(imageStore.currentImageIsExpired()).toBe(false);
    });

    it('should return true if last updated is not the current day', () => {
      const currentDay = 12;
      expect.spyOn(imageStore, '_getDay').andReturn(currentDay);
      imageStore.store.set(imageStore._keys.LAST_UPDATED, currentDay - 1);
      expect(imageStore.currentImageIsExpired()).toBe(true);
    });
  });

  describe('#refreshLastUpdated()', () => {
    it('should set last updated to the current day', () => {
      const currentDay = 3;
      expect.spyOn(imageStore, '_getDay').andReturn(currentDay);
      imageStore.refreshLastUpdated();
      expect(imageStore.store.get(imageStore._keys.LAST_UPDATED)).toBe(currentDay);
    });
  });

  describe('#shouldExtendQueue()', () => {
    it('should return true when the queue is smaller than its min size', () => {
      const queue = [];
      for (let i = 0; i < imageStore._MIN_QUEUE_SIZE - 1; i += 1) {
        queue.push({ title: i });
      }
      bucketQueue._setQueue(queue);
      expect(imageStore.shouldExtendQueue()).toBe(true);
    });

    it('should return false when the queue is larger than its min size', () => {
      const queue = [];
      for (let i = 0; i < imageStore._MIN_QUEUE_SIZE + 1; i += 1) {
        queue.push({ title: i });
      }
      bucketQueue._setQueue(queue);
      expect(imageStore.shouldExtendQueue()).toBe(false);
    });
  });
});
