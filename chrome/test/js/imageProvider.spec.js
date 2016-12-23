import constitute from 'constitute';
import expect, { spyOn } from 'expect';

import ImageProvider from '../../src/js/imageProvider';
import ImageStore from '../../src/js/imageStore';

describe('ImageProvider', () => {
  let imageProvider;
  let imageStore;

  beforeEach(() => {
    const container = new constitute.Container();
    container.bindClass(ImageStore, ImageStore);
    imageProvider = container.constitute(ImageProvider);
    imageStore = imageProvider.imageStore;
  });

  describe('#getCurrentImage()', () => {
    it('should return the current image if already downloaded', async () => {
      const mockImage = { title: 'Title', artist: 'picaso' };
      const expireImageSpy = spyOn(imageProvider, '_expireImageAndExtendQueue')
          .andReturn(new Promise(res => res()));
      spyOn(imageStore, 'isDownloaded').andReturn(true);
      spyOn(imageStore, 'getCurrentImage').andReturn(mockImage);

      const currentImage = await imageProvider.getCurrentImage();
      expect(currentImage).toEqual(mockImage);
      expect(expireImageSpy).toHaveBeenCalled();
    });

    it('should download and return the current image if not already downloaded', async () => {
      const mockImage = { title: 'Title', artist: 'picaso' };
      const expectedImage = { title: 'Title', artist: 'picaso', url: 'zxc' };
      const expireImageSpy = spyOn(imageProvider, '_expireImageAndExtendQueue')
          .andReturn(new Promise(res => res()));
      spyOn(imageStore, 'isDownloaded').andReturn(false);
      spyOn(imageStore, 'getCurrentImage').andReturn(mockImage);
      spyOn(imageProvider, '_downloadImage').andCall(image =>
        new Promise(res => res(Object.assign({}, image, { url: 'zxc' }))));
      const updateImageSpy = spyOn(imageStore, 'updateCachedImage');

      const currentImage = await imageProvider.getCurrentImage();
      expect(currentImage).toEqual(expectedImage);
      expect(expireImageSpy).toHaveBeenCalled();
      expect(updateImageSpy).toHaveBeenCalledWith(0, expectedImage);
    });
  });

  describe('#downloadNextImages()', () => {
    it('should download all uncached images', async () => {
      const uncachedImages = [
        { index: 2, image: { title: 'imageA' } },
        { index: 3, image: { title: 'imageB' } },
      ];
      spyOn(imageStore, 'getUncachedImages').andReturn(uncachedImages);
      const downloadImageSpy = spyOn(imageProvider, '_downloadImage')
        .andCall(img => new Promise(resolve => resolve(img)));
      const updateCachedSpy = spyOn(imageStore, 'updateCachedImage');

      await imageProvider.downloadNextImages();
      expect(downloadImageSpy.calls.length).toEqual(uncachedImages.length);
      expect(updateCachedSpy.calls.length).toEqual(uncachedImages.length);
      uncachedImages.forEach((bucket, index) => {
        expect(downloadImageSpy.calls[index].arguments)
          .toEqual([bucket.image]);
        expect(updateCachedSpy.calls[index].arguments)
          .toEqual([bucket.index, bucket.image]);
      });
    });
  });

  describe('#_expireImageAndExtendQueue()', () => {
    let isOnlineSpy;
    let imageExpiredSpy;
    let skipCurrentImageSpy;
    let refreshLastUpdatedSpy;
    let shouldExtendSpy;
    let updateImageCacheSpy;

    beforeEach(() => {
      isOnlineSpy = spyOn(imageProvider, '_isOnline').andReturn(true);
      imageExpiredSpy = spyOn(imageStore, 'currentImageIsExpired');
      skipCurrentImageSpy = spyOn(imageStore, 'skipCurrentImage');
      refreshLastUpdatedSpy = spyOn(imageStore, 'refreshLastUpdated');
      shouldExtendSpy = spyOn(imageStore, 'shouldExtendQueue');
      updateImageCacheSpy = spyOn(imageProvider, '_updateImageCache')
        .andCall(() => new Promise(resolve => resolve()));
    });

    it('should not expire when offline', async () => {
      isOnlineSpy.andReturn(false);
      imageExpiredSpy.andReturn(true);
      shouldExtendSpy.andReturn(true);
      await imageProvider._expireImageAndExtendQueue();
      expect(skipCurrentImageSpy).toNotHaveBeenCalled();
      expect(refreshLastUpdatedSpy).toNotHaveBeenCalled();
      expect(updateImageCacheSpy).toNotHaveBeenCalled();
    });

    it('should skip the current image if expired', async () => {
      imageExpiredSpy.andReturn(true);
      shouldExtendSpy.andReturn(false);
      await imageProvider._expireImageAndExtendQueue();
      expect(skipCurrentImageSpy).toHaveBeenCalled();
      expect(refreshLastUpdatedSpy).toHaveBeenCalled();
      expect(updateImageCacheSpy).toNotHaveBeenCalled();
    });

    it('should update image cache if needed', async () => {
      imageExpiredSpy.andReturn(true);
      shouldExtendSpy.andReturn(true);
      await imageProvider._expireImageAndExtendQueue();
      expect(skipCurrentImageSpy).toHaveBeenCalled();
      expect(refreshLastUpdatedSpy).toHaveBeenCalled();
      expect(updateImageCacheSpy).toHaveBeenCalled();
    });
  });
});
