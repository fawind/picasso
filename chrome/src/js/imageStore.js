import Store from './store';
import BucketQueue from './bucketQueue';

export default class ImageStore {

  static constitute() { return [Store, BucketQueue]; }

  constructor(store, queue) {
    this.store = store;
    this.queue = queue;
    this._keys = {
      INDEX: 'index',
      LAST_UPDATED: 'last_updated',
      DATA_URI_FIELD: 'dataUri',
    };
    this._MIN_QUEUE_SIZE = 4;
    this._IMAGES_TO_DOWNLOAD = 4;
  }

  getCurrentImage() {
    return this.queue.peak();
  }

  skipCurrentImage() {
    this.queue.remove();
  }

  addImages(images) {
    this.queue.addAll(images);
  }

  getImagesCount() {
    return this.queue.getSize();
  }

  isDownloaded(image) {
    return image.hasOwnProperty(this._keys.DATA_URI_FIELD);
  }

  getUncachedImages() {
    const images = [];
    const toIndex = Math.min(this.queue.getSize(), this._IMAGES_TO_DOWNLOAD);
    for (let i = 0; i < toIndex; i += 1) {
      const image = this.queue.get(i);
      if (!this.isDownloaded(image)) {
        images.push({ image, index: i });
      }
    }
    return images;
  }

  updateCachedImage(index, image) {
    this.queue.update(index, image);
  }

  canUpdateCachedImage(image) {
    return this.store.canSet(image);
  }

  currentImageIsExpired() {
    return this.getLastUpdated() !== this._getDay();
  }

  getLastUpdated() {
    return this.store.get(this._keys.LAST_UPDATED) || -1;
  }

  refreshLastUpdated() {
    this.store.set(this._keys.LAST_UPDATED, this._getDay());
  }

  shouldExtendQueue() {
    return this.getImagesCount() < this._MIN_QUEUE_SIZE;
  }

  getBatchIndex() {
    return this.store.get(this._keys.INDEX) || 0;
  }

  setBatchIndex(index) {
    this.store.set(this._keys.INDEX, index);
  }

  _getDay() {
    return new Date().getDate();
  }
}
