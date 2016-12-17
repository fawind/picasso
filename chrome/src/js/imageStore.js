import Store from './store';
import BucketQueue from './bucketQueue';


const KEYS = {
  INDEX: 'index',
  LAST_UPDATED: 'last_updated',
  DATA_URI_FIELD: 'dataUri',
  MIN_QUEUE_SIZE: 4,
  IMAGES_TO_DOWNLOAD: 4,
};

export default class ImageStore {

  static getCurrentImage() {
    return BucketQueue.peak();
  }

  static skipCurrentImage() {
    BucketQueue.remove();
  }

  static addImages(images) {
    BucketQueue.addAll(images);
  }

  static getImagesCount() {
    return BucketQueue.getSize();
  }

  static isDownloaded(image) {
    return image.hasOwnProperty(KEYS.DATA_URI_FIELD);
  }

  static getUncachedImages(limit = KEYS.IMAGES_TO_DOWNLOAD) {
    const images = [];
    const toIndex = Math.min(BucketQueue.getSize(), limit);
    for (let i = 0; i < toIndex; i += 1) {
      const image = BucketQueue.get(i);
      if (!ImageStore.isDownloaded(image)) {
        images.push({ image, index: i });
      }
    }
    return images;
  }

  static updateCachedImage(index, image) {
    BucketQueue.update(index, image);
  }

  static canUpdateCachedImage(image) {
    return Store.canSet(image);
  }

  static currentImageIsExpired() {
    return ImageStore.getLastUpdated() !== ImageStore._getDay();
  }

  static getLastUpdated() {
    return Store.get(KEYS.LAST_UPDATED) || -1;
  }

  static refreshLastUpdated() {
    Store.set(KEYS.LAST_UPDATED, ImageStore._getDay());
  }

  static shouldExtendQueue() {
    return ImageStore.getImagesCount() < KEYS.MIN_QUEUE_SIZE;
  }

  static getBatchIndex() {
    return Store.get(KEYS.INDEX) || 0;
  }

  static setBatchIndex(index) {
    Store.set(KEYS.INDEX, index);
  }

  static _getDay() {
    return new Date().getDate();
  }

  static _getKeys() {
    return KEYS;
  }
}
