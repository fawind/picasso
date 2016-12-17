import expect from 'expect';

import Store from '../../src/js/store';
import BucketQueue from '../../src/js/bucketQueue';
import ImageStore from '../../src/js/imageStore';

const KEYS = ImageStore._getKeys();

describe('ImageStore', () => {
  let mockImages;

  beforeEach(() => {
    localStorage.clear();
    mockImages = [
      { title: 'TitleA', artistName: 'Picasso', image: 'url' },
      { title: 'TitleB', artistName: 'Picasso', image: 'url' },
      { title: 'TitleC', artistName: 'Monet', image: 'url' },
    ];
  });

  describe('#getCurrentImage()', () => {
    it('should return the next image in the queue', () => {
      BucketQueue._setQueue(mockImages);
      expect(ImageStore.getCurrentImage()).toEqual(mockImages[0]);
    });

    it('should return undefined when no images are set', () => {
      expect(ImageStore.getCurrentImage()).toBe(undefined);
    });
  });

  describe('#skipCurrentImage()', () => {
    it('should remove the current image from the queue', () => {
      BucketQueue._setQueue(mockImages);
      mockImages.forEach((image, index) => {
        expect(ImageStore.getCurrentImage()).toEqual(mockImages[index]);
        expect(ImageStore.getImagesCount()).toBe(mockImages.length - index);
        ImageStore.skipCurrentImage();
      });
    });

    it('should work when no images are set', () => {
      expect(() => ImageStore.skipCurrentImage()).toNotThrow();
    });
  });

  describe('#addImages()', () => {
    it('should add all images to the queue', () => {
      const newImages = [
        { title: 'Title1', artist: 'Klee', image: 'url' },
        { title: 'Title2', artist: 'Klee', image: 'url' },
      ];
      BucketQueue._setQueue(mockImages);

      ImageStore.addImages(newImages);
      expect(ImageStore.getImagesCount()).toBe(mockImages.length + newImages.length);
      expect(BucketQueue._getQueue()).toEqual(mockImages.concat(newImages));
    });

    it('should work when queue is empty', () => {
      const newImages = [
        { title: 'Title1', artist: 'Klee', image: 'url' },
        { title: 'Title2', artist: 'Klee', image: 'url' },
      ];
      ImageStore.addImages(newImages);
      expect(ImageStore.getImagesCount()).toBe(newImages.length);
      expect(BucketQueue._getQueue()).toEqual(newImages);
    });
  });

  describe('#getImagesCount()', () => {
    it('should return the count of images in the queue', () => {
      expect(ImageStore.getImagesCount()).toBe(0);
      BucketQueue._setQueue(mockImages);
      expect(ImageStore.getImagesCount()).toBe(mockImages.length);
      BucketQueue.add({ title: 'newTitle', artist: 'newArtist' });
      expect(ImageStore.getImagesCount()).toBe(mockImages.length + 1);
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
      const limit = images.length;
      BucketQueue._setQueue(images);
      expect(ImageStore.getUncachedImages(limit)).toEqual(expectedImages);
    });
  });

  describe('#updateCachedImage', () => {
    it('should update the image at the given index', () => {
      BucketQueue._setQueue(mockImages);
      const imageA = { title: 'NewTitleA', artistName: 'Artist' };
      const imageB = { title: 'NewTitleB', artistName: 'Artist' };

      ImageStore.updateCachedImage(0, imageA);
      mockImages[0] = imageA;
      expect(BucketQueue._getQueue()).toEqual(mockImages);
      ImageStore.updateCachedImage(2, imageB);
      mockImages[2] = imageB;
      expect(BucketQueue._getQueue()).toEqual(mockImages);
    });

    it('should throw a RangeError when setting an invalid index', () => {
      BucketQueue._setQueue(mockImages);
      expect(() => ImageStore.updateCachedImage(10, {})).toThrow(RangeError);
      expect(() => ImageStore.updateCachedImage(-1, {})).toThrow(RangeError);
    });
  });

  describe('#currentImageIsExpired()', () => {
    it('should return false if last updated is the current day', () => {
      const currentDay = 12;
      expect.spyOn(ImageStore, '_getDay').andReturn(currentDay);
      Store.set(KEYS.LAST_UPDATED, currentDay);
      expect(ImageStore.currentImageIsExpired()).toBe(false);
    });

    it('should return true if last updated is not the current day', () => {
      const currentDay = 12;
      expect.spyOn(ImageStore, '_getDay').andReturn(currentDay);
      Store.set(KEYS.LAST_UPDATED, currentDay - 1);
      expect(ImageStore.currentImageIsExpired()).toBe(true);
    });
  });

  describe('#refreshLastUpdated()', () => {
    it('should set last updated to the current day', () => {
      const currentDay = 3;
      expect.spyOn(ImageStore, '_getDay').andReturn(currentDay);
      ImageStore.refreshLastUpdated();
      expect(Store.get(KEYS.LAST_UPDATED)).toBe(currentDay);
    });
  });

  describe('#shouldExtendQueue()', () => {
    it('should return true when the queue is smaller than its min size', () => {
      const queue = [];
      for (let i = 0; i < KEYS.MIN_QUEUE_SIZE - 1; i += 1) {
        queue.push({ title: i });
      }
      BucketQueue._setQueue(queue);
      expect(ImageStore.shouldExtendQueue()).toBe(true);
    });

    it('should return false when the queue is larger than its min size', () => {
      const queue = [];
      for (let i = 0; i < KEYS.MIN_QUEUE_SIZE + 1; i += 1) {
        queue.push({ title: i });
      }
      BucketQueue._setQueue(queue);
      expect(ImageStore.shouldExtendQueue()).toBe(false);
    });
  });
});
